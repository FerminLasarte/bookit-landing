import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import type { Miembro } from "@/lib/mi-local/gestion";
import Avatar from "./Avatar";

/** El equipo, uno por fila, con el dueño primero. Cada fila lleva a su página. */
export default function ListaDelEquipo({ equipo }: { equipo: Miembro[] }) {
  const copy = miLocal.equipo;

  return (
    <Superficie tone="surface">
      <ul className="divide-y divide-line">
        {equipo.map((m) => (
          <li key={m.id}>
            <Link
              href={`/mi-local/equipo/${m.id}`}
              aria-label={copy.abrir(m.nombre)}
              className="ring-focus flex items-center gap-4 px-5 py-4 transition-colors duration-(--duration-chico) hover:bg-fg/4 md:px-6"
            >
              <Avatar nombre={m.nombre} foto={m.foto} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-semibold text-fg">
                  {m.nombre}
                  {m.esDuenio && <Badge tono="neutro">{copy.vos}</Badge>}
                </span>
                <span className="block truncate text-small text-muted">{m.email ?? (m.conCuenta ? null : copy.sinCuenta)}</span>
              </span>
              {!m.activo && <Badge tono="atencion">{copy.pausado}</Badge>}
            </Link>
          </li>
        ))}
      </ul>
    </Superficie>
  );
}
