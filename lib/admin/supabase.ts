import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/*
 * El cliente de Supabase del panel. Entra con la sesión de la persona (anon
 * key + su cookie), nunca con la service role: lo que puede leer lo deciden
 * las funciones `admin_*` de la base, que rechazan a quien no esté en
 * `administradores`.
 */

export function credenciales() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Faltan SUPABASE_URL o SUPABASE_ANON_KEY");
  return { url, anon };
}

/**
 * Para páginas y route handlers. En una página no se pueden escribir cookies:
 * la sesión la renueva antes el proxy, así que acá sólo se lee.
 */
export async function clienteDelPanel() {
  // Las cookies primero: es lo que hace dinámica a la página, y si faltan
  // las variables el error tiene que salir al pedirla, no en el build.
  const almacen = await cookies();
  const { url, anon } = credenciales();

  return createServerClient(url, anon, {
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
