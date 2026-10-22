"use client";

import { CalendarDays, Scissors, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { miLocal } from "@/content/mi-local";
import { cn } from "@/lib/utils";
import { useSeccionActual } from "./SeccionesDelPanel";

const iconos: Record<string, LucideIcon> = {
  "/mi-local": CalendarDays,
  "/mi-local/servicios": Scissors,
  "/mi-local/equipo": Users,
};

/**
 * Las secciones en el teléfono: una barra de pestañas abajo, como la app
 * (plan del panel: con tres o más secciones). El menú de arriba queda para el
 * plan y salir.
 */
export default function PestanasDelPanel() {
  const { secciones, pestanas } = miLocal.panel;
  const actual = useSeccionActual();

  return (
    <nav
      aria-label={pestanas}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-page pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex">
        {secciones.map((s) => {
          const Icono = iconos[s.href];
          const activa = s === actual;
          return (
            <li key={s.href} className="flex-1">
              <Link
                href={s.href}
                aria-current={activa ? "page" : undefined}
                className={cn(
                  "ring-focus flex min-h-14 flex-col items-center justify-center gap-1 text-micro font-semibold transition-colors duration-(--duration-chico)",
                  activa ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {Icono && <Icono aria-hidden className="size-5" strokeWidth={activa ? 2.25 : 1.75} />}
                {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
