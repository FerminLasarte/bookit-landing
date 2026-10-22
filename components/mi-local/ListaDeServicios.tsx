import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { pesos } from "@/lib/formato";
import type { Servicio } from "@/lib/mi-local/gestion";

/** "Seña 20%" o "Seña $5.000", como la app. */
export const senaLegible = ({ tipo, valor }: NonNullable<Servicio["sena"]>) =>
  miLocal.servicios.sena(tipo === "porcentaje" ? `${valor}%` : pesos(valor));

/**
 * Los servicios del local, uno por fila, como la lista de la agenda. En el
 * teléfono se apilan; desde `md`, el nombre, la duración, el precio y la seña
 * van en columnas. Cada fila lleva a editarlo.
 */
export default function ListaDeServicios({ servicios }: { servicios: Servicio[] }) {
  const copy = miLocal.servicios;

  return (
    <Superficie tone="surface">
      <ul className="divide-y divide-line">
        {servicios.map((s) => (
          <li key={s.id}>
            <Link
              href={`/mi-local/servicios/${s.id}`}
              aria-label={copy.editar(s.nombre)}
              className="ring-focus grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-5 py-4 transition-colors duration-(--duration-chico) hover:bg-fg/4 md:grid-cols-[1fr_6rem_8rem_8rem] md:items-center md:px-6"
            >
              <span>
                <span className="block font-semibold text-fg">{s.nombre}</span>
                {s.descripcion && <span className="block text-small text-muted">{s.descripcion}</span>}
              </span>
              <span className="col-start-1 text-small text-muted tabular-nums md:col-start-2 md:row-start-1 md:text-body md:text-fg">
                {copy.minutos(s.duracion)}
              </span>
              <span className="col-start-2 row-start-1 text-right text-fg tabular-nums md:col-start-3">{pesos(s.precio)}</span>
              <span className="col-start-2 row-start-2 flex justify-end md:col-start-4 md:row-start-1">
                {s.sena && <Badge tono="neutro">{senaLegible(s.sena)}</Badge>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Superficie>
  );
}
