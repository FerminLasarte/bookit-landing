import "server-only";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/*
 * Los clientes de Supabase de la web. Entran siempre con la sesión de la
 * persona (anon key + su cookie), nunca con la service role: lo que cada uno
 * puede leer o hacer lo decide la base.
 *
 * Hay dos áreas con sesión y cada una tiene su cookie: el panel del equipo
 * (/admin) y la del dueño del local, que es una sola para /planes y /mi-local.
 * Es el mismo Supabase Auth, pero entrar o salir de una no toca la otra.
 */

export type Area = "panel" | "local";

/**
 * El panel conserva la cookie de siempre: cambiarla sacaría al equipo, y el
 * nav del sitio la busca por ese nombre (`lib/admin/sesion.ts`). La del local
 * va en `/` porque la leen dos rutas; reemplazó a `sb-planes`, que vivía sólo
 * en /planes.
 */
export const cookiesDeArea: Record<Area, CookieOptionsWithName | undefined> = {
  panel: undefined,
  local: { name: "sb-local", path: "/" },
};

export function credenciales() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Faltan SUPABASE_URL o SUPABASE_ANON_KEY");
  return { url, anon };
}

/**
 * Para las páginas públicas, sin sesión: entra como `anon` y sólo ve lo que la
 * base le abre a cualquiera (la ficha del enlace de una historia).
 */
export function clientePublico() {
  const { url, anon } = credenciales();
  return createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
}

/**
 * Para páginas, route handlers y server actions. En una página no se pueden
 * escribir cookies: la sesión la renueva antes el proxy, así que ahí sólo se
 * lee.
 */
export async function clienteDeSupabase(area: Area) {
  // Las cookies primero: es lo que hace dinámica a la página, y si faltan
  // las variables el error tiene que salir al pedirla, no en el build.
  const almacen = await cookies();
  const { url, anon } = credenciales();

  return createServerClient(url, anon, {
    cookieOptions: cookiesDeArea[area],
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: (aEscribir) => {
        try {
          for (const { name, value, options } of aEscribir) almacen.set(name, value, options);
        } catch {
          // Una página no escribe cookies; el proxy ya lo hizo.
        }
      },
    },
  });
}

export type Proveedor = "google" | "apple";

/**
 * Arranca el ingreso con Google o Apple. Va del lado del servidor para que el
 * verificador PKCE quede en la cookie del área y el canje del callback lo
 * encuentre. Se llama desde un POST: un GET lo dispararía cualquier prefetch.
 */
export async function iniciarIngreso(
  request: NextRequest,
  area: Area,
  proveedor: Proveedor,
  { vuelta, siFalla }: { vuelta: string; siFalla: string },
) {
  const supabase = await clienteDeSupabase(area);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: proveedor,
    options: { redirectTo: `${request.nextUrl.origin}${vuelta}` },
  });

  if (error || !data.url) return NextResponse.redirect(new URL(siFalla, request.url), 303);
  return NextResponse.redirect(data.url, 303);
}

/** La vuelta del proveedor: canjea el código por la sesión del área. */
export async function canjearCodigo(
  request: NextRequest,
  area: Area,
  { destino, siFalla }: { destino: string; siFalla: string },
) {
  const codigo = request.nextUrl.searchParams.get("code");
  if (codigo) {
    const supabase = await clienteDeSupabase(area);
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(new URL(destino, request.url));
    console.error(`${area}/auth/callback:`, error.code, error.message);
  } else {
    console.error(`${area}/auth/callback sin código:`, request.nextUrl.searchParams.get("error_description"));
  }
  return NextResponse.redirect(new URL(siFalla, request.url));
}

/**
 * Cierra la sesión del área y vuelve a donde se entra. `local`: sólo la de
 * esta cookie. El `global` de Supabase revoca todas las de la cuenta, y salir
 * del panel sacaba también de /mi-local y de la app (D3 de docs/PLAN-ADMIN.md).
 */
export async function salir(request: NextRequest, area: Area, destino: string) {
  const supabase = await clienteDeSupabase(area);
  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.redirect(new URL(destino, request.url), 303);
}
