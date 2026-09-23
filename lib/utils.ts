import { extendTailwindMerge } from "tailwind-merge";

/* Las escalas propias de `globals.css`, para que tailwind-merge sepa que
   `text-small` es un tamaño y `text-muted` un color, y no descarte uno. */
const merge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["numeral", "display", "title", "body", "small", "micro"],
      radius: ["field", "toast", "card", "pill"],
      shadow: ["tile", "float"],
    },
  },
});

/**
 * Une clases ignorando `false`, `undefined` y `null`. Si dos chocan, gana la
 * última: es lo que deja que un `className` de afuera pise al del componente.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return merge(classes.filter(Boolean).join(" "));
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
 *   `/invite/comercio/XXX`   → null
 *
 * Los links de comercio responden 200 (contrato), pero como invitación sin
 * código: el programa para locales se dio de baja y esos códigos ya no le
 * corresponden a nadie. La app los ignora igual.
 */
export function codeFromSlug(slug: readonly string[] | undefined): string | null {
  if (!slug || slug.length === 0) return null;
  const [first] = slug;
  if (first === "comercio") return null;
  return normalizeCode(first);
}
