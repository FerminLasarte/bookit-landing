"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Badge from "@/components/ui/Badge";
import Wordmark from "@/components/ui/Wordmark";
import { seccionesAdmin } from "@/content/admin";
import { cn } from "@/lib/utils";

/**
 * El nav del panel: la misma píldora flotante del sitio, con las secciones
 * del panel y la salida. No se compacta al scrollear: acá se trabaja, no se
 * recorre.
 */
export default function AdminNav() {
  const ruta = usePathname();
  const activa = (href: string) => (href === "/admin" ? ruta === "/admin" : ruta.startsWith(href));

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 md:px-6 md:pt-5">
      <nav
        aria-label="Panel"
        className="mx-auto max-w-[68rem] rounded-card bg-surface/90 shadow-float backdrop-blur-xl [--ring-hueco:var(--surface)]"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 md:h-16 md:py-0 md:pr-3 md:pl-5">
          <Link href="/admin" className="ring-focus flex min-h-11 items-center rounded-pill">
            <Wordmark className="h-7" />
          </Link>
          <Badge>Admin</Badge>

          <ul className="order-last flex w-full items-center gap-1 md:order-none md:mx-auto md:w-auto">
            {seccionesAdmin.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  aria-current={activa(s.href) ? "page" : undefined}
                  className={cn(
                    "ring-focus flex min-h-11 items-center rounded-pill px-4 text-small font-semibold transition-colors duration-(--duration-chico)",
                    activa(s.href) ? "bg-fg text-page" : "text-fg hover:bg-fg/6",
                  )}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>

          <form action="/admin/auth/salir" method="post" className="ml-auto md:ml-0">
            <button
              type="submit"
              className="ring-focus min-h-11 rounded-pill px-4 text-small font-semibold text-muted hover:text-fg"
            >
              Salir
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
