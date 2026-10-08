import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookiesDeArea } from "@/lib/supabase";

/*
 * Corre en /admin y en /planes. Renueva la sesión de Supabase del área antes
 * de que se dibuje la página —una página no puede escribir cookies, y sin esto
 * el refresh token se reusaría en cada request hasta que Supabase lo
 * invalide—. En /admin, además, manda a /admin/entrar a quien no tenga sesión;
 * /planes muestra los precios sin sesión y se ocupa sola.
 *
 * No decide quién es admin ni qué puede comprar un local: eso lo hace la base
 * en cada lectura. Esto es sólo el chequeo optimista de que hay alguien
 * logueado.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const esPanel = pathname.startsWith("/admin");

  let respuesta = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, {
    cookieOptions: cookiesDeArea[esPanel ? "panel" : "planes"],
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (aEscribir, headers) => {
        for (const { name, value } of aEscribir) request.cookies.set(name, value);
        respuesta = NextResponse.next({ request });
        for (const { name, value, options } of aEscribir) respuesta.cookies.set(name, value, options);
        for (const [clave, valor] of Object.entries(headers)) respuesta.headers.set(clave, valor);
      },
    },
  });

  // getUser y no getSession: valida el token contra Supabase.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const esPublica = pathname === "/admin/entrar" || pathname.startsWith("/admin/auth/");
  if (esPanel && !user && !esPublica) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/admin/entrar";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return respuesta;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/planes", "/planes/:path*"],
};
