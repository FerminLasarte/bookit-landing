/*
 * El dueño entra desde /planes o desde /mi-local con la misma sesión (el área
 * `local` de `lib/supabase.ts`), y vuelve a la que eligió. Lo que manda el
 * formulario se valida contra esta lista: nunca se redirige a una dirección
 * que escribió el navegador.
 */

/** Cada destino, con la página donde está su formulario de entrar. */
const entradas = {
  "/planes": "/planes",
  "/mi-local": "/mi-local/entrar",
} as const;

export type Destino = keyof typeof entradas;

/** El destino que llegó en un formulario o una cookie; si no es uno de la lista, /planes. */
export const leerDestino = (valor: unknown): Destino =>
  typeof valor === "string" && Object.hasOwn(entradas, valor) ? (valor as Destino) : "/planes";

/** Dónde se vuelve a entrar desde un destino: con un error, o al salir. */
export const entradaDe = (destino: Destino, error?: string) =>
  error ? `${entradas[destino]}?error=${error}` : entradas[destino];

/**
 * Guarda el destino mientras la persona está en Google o Apple. Va en una
 * cookie y no en la URL de vuelta porque esa URL tiene que coincidir con la
 * que Supabase tiene permitida.
 */
export const COOKIE_DESTINO = "sb-local-destino";

/** El destino que mandó un formulario. Un POST sin cuerpo de formulario vuelve a /planes, como antes. */
export async function destinoDelPedido(request: Request): Promise<Destino> {
  const datos = await request.formData().catch(() => null);
  return leerDestino(datos?.get("destino"));
}
