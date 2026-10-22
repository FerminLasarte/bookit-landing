"use client";

import { CalendarDays, ChartColumnIncreasing, CircleUserRound, Clock, Scissors, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { miLocal } from "@/content/mi-local";
import { cn } from "@/lib/utils";
import { useSeccionActual, type Seccion } from "./SeccionesDelPanel";

/** Los de la app: Gestión lleva el de servicios, que es donde abre. */
const iconos: Record<string, LucideIcon> = {
  agenda: CalendarDays,
  crecimiento: ChartColumnIncreasing,
  gestion: Scissors,
  horarios: Clock,
  servicios: Scissors,
  perfil: CircleUserRound,
};

/**
 * Las secciones en el teléfono: una barra de pestañas abajo, como la app
 * (plan del panel: con tres o más secciones). El menú de arriba queda para el
 * plan y salir.
 */
export default function PestanasDelPanel({ secciones }: { secciones: Seccion[] }) {
  const { pestanas } = miLocal.panel;
  const actual = useSeccionActual(secciones);

  return (
    <nav
      aria-label={pestanas}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-page pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex">
        {secciones.map((s) => {
          const Icono = iconos[s.id];
          const activa = s.id === actual;
          return (
            <li key={s.id} className="flex-1">
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
