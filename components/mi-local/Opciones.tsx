import type { ReactNode } from "react";
import Anchor from "@/components/ui/Anchor";
import { cn } from "@/lib/utils";

/*
 * Elegir entre opciones con enlaces: funcionan sin JavaScript y lo elegido
 * queda en la URL. Los usan los filtros de la agenda y la carga de un turno.
 */

/** Un rótulo y sus opciones, en una fila que se parte. */
export function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <nav aria-label={titulo} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-small font-semibold text-fg">{titulo}</span>
      {children}
    </nav>
  );
}

/** La píldora de una opción; la elegida va llena. */
export const claseDeOpcion = (activa: boolean) =>
  cn(
    "ring-focus inline-flex min-h-9 items-center rounded-pill px-3.5 text-small font-semibold transition-colors duration-(--duration-chico)",
    activa ? "bg-fg text-page" : "bg-fg/6 text-fg hover:bg-fg/12",
  );

export function Opcion({ href, activa, children }: { href: string; activa: boolean; children: ReactNode }) {
  return (
    <Anchor href={href} aria-current={activa ? "true" : undefined} className={claseDeOpcion(activa)}>
      {children}
    </Anchor>
  );
}
