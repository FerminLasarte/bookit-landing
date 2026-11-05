import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

export type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Todo lo que trae esquema —`https:`, `mailto:`, `tel:`, el de la app— sale del router de Next. */
export function isExternal(href: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(href);
}

/**
 * La base de todo link del sitio: `Link` para rutas propias, `<a>` para el
 * resto. Una descarga tampoco pasa por el router: `Link` la precargaría al
 * verse en pantalla, y eso ya es armar el archivo.
 */
export default function Anchor({ href, ...props }: AnchorProps) {
  if (props.download !== undefined) return <a href={href} {...props} />;
  if (!isExternal(href)) return <Link href={href} {...props} />;

  const newTab = href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" };
  return <a href={href} {...newTab} {...props} />;
}
