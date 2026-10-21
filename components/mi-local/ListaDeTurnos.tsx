import Badge from "@/components/ui/Badge";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { hora, pesos } from "@/lib/formato";
import { quedoSinMarcar, type Turno } from "@/lib/mi-local/agenda";

/**
 * Los turnos del día, uno por fila. En el teléfono se apilan; desde `md`, la
 * hora, el cliente, el precio y el estado van en columnas.
 */
export default function ListaDeTurnos({ turnos, ahora }: { turnos: Turno[]; ahora: Date }) {
  const copy = miLocal.agenda;

  return (
    <Superficie tone="surface">
      <ul className="divide-y divide-line">
        {turnos.map((turno) => {
          const estado = miLocal.estados[turno.estado];
          const sinMarcar = quedoSinMarcar(turno, ahora);
          return (
            <li
              key={turno.id}
              className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-5 py-4 md:grid-cols-[8rem_1fr_7rem_8rem] md:items-center md:px-6"
            >
              <p className="font-semibold text-fg tabular-nums">
                {hora(turno.inicio)}–{hora(turno.fin)}
              </p>
              <div className="col-start-1 md:col-start-2 md:row-start-1">
                <p className="font-semibold text-fg">
                  {turno.cliente ?? (turno.esManual ? copy.deMostrador : copy.sinNombre)}
                </p>
                <p className="text-small text-muted">
                  {[turno.servicio, turno.profesional?.nombre ?? copy.sinProfesional].filter(Boolean).join(" · ")}
                </p>
              </div>
              <p className="col-start-2 row-start-1 text-right text-fg tabular-nums md:col-start-3">
                {pesos(turno.precio)}
              </p>
              <div className="col-start-2 row-start-2 flex justify-end md:col-start-4 md:row-start-1">
                {sinMarcar ? (
                  <Badge tono="atencion">{copy.sinMarcar}</Badge>
                ) : (
                  <Badge tono={estado.tono}>{estado.label}</Badge>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Superficie>
  );
}
