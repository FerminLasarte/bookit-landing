import type { ReactNode } from "react";
import Anchor from "@/components/ui/Anchor";
import { miLocal } from "@/content/mi-local";
import { ESTADOS_TURNO, type Profesional } from "@/lib/mi-local/agenda";
import { cn } from "@/lib/utils";
import { enlaceDeVista, type Vista } from "@/lib/mi-local/vista";

/** Los filtros de la agenda: enlaces, así que funcionan sin JavaScript y quedan en la URL. */
export default function Filtros({ vista, profesionales }: { vista: Vista; profesionales: Profesional[] }) {
  const copy = miLocal.agenda;

  return (
    <div className="flex flex-col gap-3">
      {/* Con un solo profesional, filtrar por él es la lista entera. */}
      {profesionales.length > 1 && (
        <Grupo titulo={copy.profesional}>
          <Opcion href={enlaceDeVista({ ...vista, profesional: null })} activa={!vista.profesional}>
            {copy.todos}
          </Opcion>
          {profesionales.map((p) => (
            <Opcion key={p.id} href={enlaceDeVista({ ...vista, profesional: p.id })} activa={vista.profesional === p.id}>
              {p.nombre}
            </Opcion>
          ))}
        </Grupo>
      )}
      <Grupo titulo={copy.estado}>
        <Opcion href={enlaceDeVista({ ...vista, estado: null })} activa={!vista.estado}>
          {copy.todos}
        </Opcion>
        {ESTADOS_TURNO.map((estado) => (
          <Opcion key={estado} href={enlaceDeVista({ ...vista, estado })} activa={vista.estado === estado}>
            {miLocal.estados[estado].label}
          </Opcion>
        ))}
      </Grupo>
    </div>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <nav aria-label={titulo} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-small font-semibold text-fg">{titulo}</span>
      {children}
    </nav>
  );
}

function Opcion({ href, activa, children }: { href: string; activa: boolean; children: ReactNode }) {
  return (
    <Anchor
      href={href}
      aria-current={activa ? "true" : undefined}
      className={cn(
        "ring-focus inline-flex min-h-9 items-center rounded-pill px-3.5 text-small font-semibold transition-colors duration-(--duration-chico)",
        activa ? "bg-fg text-page" : "bg-fg/6 text-fg hover:bg-fg/12",
      )}
    >
      {children}
    </Anchor>
  );
}
