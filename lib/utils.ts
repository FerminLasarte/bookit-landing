/** Une clases ignorando `false`, `undefined` y `null`. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Normaliza un código de referido: `.trim().toUpperCase()`.
 * Mismo comportamiento que el `index.html` actual (§6.3).
 */
export function normalizeCode(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  return code.length > 0 ? code : null;
}

/**
 * Extrae el código de invitación de un slug de `/invite/[[...slug]]`.
 * Orden de precedencia (§6.3): `?code=` lo resuelve el caller.
 *   `/invite/XXX`            → XXX
 *   `/invite/comercio/XXX`   → XXX
 */
export function codeFromSlug(slug: readonly string[] | undefined): string | null {
  if (!slug || slug.length === 0) return null;
  const [first, second] = slug;
  if (first === "comercio") return normalizeCode(second);
  return normalizeCode(first);
}

/** `true` cuando la ruta es la variante para comercios. */
export function isComercioSlug(slug: readonly string[] | undefined): boolean {
  return slug?.[0] === "comercio";
}
