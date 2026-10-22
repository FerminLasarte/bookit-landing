import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Una sección de un panel: la píldora que va llena cuando es la actual. La usan
 * el nav de /admin y la barra del panel del local.
 */
export default function EnlaceDeSeccion({
  href,
  activa,
  className,
  children,
}: {
  href: string;
  activa: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={activa ? "page" : undefined}
      className={cn(
        "ring-focus flex min-h-11 items-center rounded-pill px-4 text-small font-semibold transition-colors duration-(--duration-chico)",
        activa ? "bg-fg text-page" : "text-fg hover:bg-fg/6",
        className,
      )}
    >
      {children}
    </Link>
  );
}
