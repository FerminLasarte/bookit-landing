import Anchor from "@/components/ui/Anchor";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { hora, pesos } from "@/lib/formato";
import { accionesDelTurno, quedoSinMarcar, type Turno } from "@/lib/mi-local/turnos";
import EstadoDelTurno from "./EstadoDelTurno";
import FichaDelTurno from "./FichaDelTurno";

/**
 * Los turnos del día, uno por fila, con los huecos libres entre ellos (D7 del
 * plan de la fase 3). En el teléfono se apilan; desde `md`, la hora, el
 * cliente, el precio y el estado van en columnas. Cada fila abre la ficha del
 * turno; cada hueco lleva a cargar un turno, con el día y el profesional.
 */
export default function ListaDeTurnos({
  turnos,
  huecos,
  enlaceDeHueco,
  ahora,
}: {
  turnos: Turno[];
  huecos: { inicio: string; fin: string }[];
  enlaceDeHueco: string;
  ahora: Date;
}) {
  const copy = miLocal.agenda;
  // Turnos y huecos, en orden de hora.
  const filas = [
    ...turnos.map((turno) => ({ turno, inicio: turno.inicio })),
    ...huecos.map((hueco) => ({ hueco, inicio: hueco.inicio })),
  ].sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());

  return (
    <Superficie tone="surface">
      <ul className="divide-y divide-line">
        {filas.map((fila) => {
          if ("hueco" in fila) {
            const desde = hora(fila.hueco.inicio);
            const hasta = hora(fila.hueco.fin);
            return (
              <li key={`libre-${fila.inicio}`}>
                <Anchor
                  href={enlaceDeHueco}
                  aria-label={copy.cargarEnHueco(desde, hasta)}
                  className="ring-focus flex w-full items-center justify-between gap-4 bg-accent/6 px-5 py-3.5 transition-colors duration-(--duration-chico) hover:bg-accent/12 md:px-6"
                >
                  <span>
                    <span className="font-semibold text-accent-fg">{copy.libre}</span>
                    <span className="text-small text-muted"> · {copy.hueco(desde, hasta)}</span>
                  </span>
                  <span aria-hidden className="text-small font-semibold text-accent-fg">
                    + {copy.cargar}
                  </span>
                </Anchor>
              </li>
            );
          }
          const { turno } = fila;
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
