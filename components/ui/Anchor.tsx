import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

export type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** `mailto:`, `tel:` y URLs absolutas salen del router de Next. */
export function isExternal(href: string) {
  return /^(https?:|mailto:|tel:)/.test(href);
}

/** La base de todo link del sitio: `Link` para rutas propias, `<a>` para el resto. */
export default function Anchor({ href, ...props }: AnchorProps) {
  if (!isExternal(href)) return <Link href={href} {...props} />;

  const newTab = href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" };
  return <a href={href} {...newTab} {...props} />;
}
