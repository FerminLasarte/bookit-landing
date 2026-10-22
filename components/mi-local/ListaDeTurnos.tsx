import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { hora, pesos } from "@/lib/formato";
import { accionesDelTurno, quedoSinMarcar, type Turno } from "@/lib/mi-local/turnos";
import EstadoDelTurno from "./EstadoDelTurno";
import FichaDelTurno from "./FichaDelTurno";

/**
 * Los turnos del día, uno por fila. En el teléfono se apilan; desde `md`, la
 * hora, el cliente, el precio y el estado van en columnas. Cada fila abre la
 * ficha del turno.
 */
export default function ListaDeTurnos({ turnos, ahora }: { turnos: Turno[]; ahora: Date }) {
  const copy = miLocal.agenda;

  return (
    <Superficie tone="surface">
      <ul className="divide-y divide-line">
        {turnos.map((turno) => {
          const sinMarcar = quedoSinMarcar(turno, ahora);
          const cliente = turno.cliente ?? (turno.esManual ? copy.deMostrador : copy.sinNombre);
          return (
            <li key={turno.id}>
              <FichaDelTurno
                turno={turno}
                cliente={cliente}
                acciones={accionesDelTurno(turno, ahora)}
                sinMarcar={sinMarcar}
                className="ring-focus grid w-full grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-5 py-4 text-left transition-colors duration-(--duration-chico) hover:bg-fg/4 md:grid-cols-[8rem_1fr_7rem_8rem] md:items-center md:px-6"
              >
                <span className="font-semibold text-fg tabular-nums">
                  {hora(turno.inicio)}–{hora(turno.fin)}
                </span>
                <span className="col-start-1 md:col-start-2 md:row-start-1">
                  <span className="block font-semibold text-fg">{cliente}</span>
                  <span className="block text-small text-muted">
                    {[turno.servicio, turno.profesional?.nombre ?? copy.sinProfesional].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="col-start-2 row-start-1 text-right text-fg tabular-nums md:col-start-3">
                  {pesos(turno.precio)}
                </span>
                <span className="col-start-2 row-start-2 flex items-start justify-end md:col-start-4 md:row-start-1 md:items-center">
                  <EstadoDelTurno estado={turno.estado} sinMarcar={sinMarcar} />
                </span>
              </FichaDelTurno>
            </li>
          );
        })}
      </ul>
    </Superficie>
  );
}
