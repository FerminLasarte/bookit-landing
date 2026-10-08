import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/*
 * Sólo corre en /admin. Renueva la sesión de Supabase antes de que se dibuje
 * la página —una página no puede escribir cookies, y sin esto el refresh
 * token se reusaría en cada request hasta que Supabase lo invalide— y manda a
 * /admin/entrar a quien no tenga sesión.
 *
 * No decide quién es admin: eso lo hace la base en cada lectura. Esto es
 * sólo el chequeo optimista de que hay alguien logueado.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.next();

  let respuesta = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, {
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

  const { pathname } = request.nextUrl;
  const esPublica = pathname === "/admin/entrar" || pathname.startsWith("/admin/auth/");
  if (!user && !esPublica) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/admin/entrar";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return respuesta;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
