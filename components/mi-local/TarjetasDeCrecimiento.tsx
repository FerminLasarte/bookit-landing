import { Info, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { mesRotulo, pesos, pesosCortos } from "@/lib/formato";
import {
  franjas,
  masLleno,
  masVacio,
  totales,
  ultimoMesCerrado,
  type Celda,
  type Estadisticas,
  type Fila,
  type Franja,
  type Mes,
} from "@/lib/mi-local/crecimiento";
import { cn } from "@/lib/utils";

/*
 * Las tarjetas de Crecimiento, como las de la app (`business_stats_screen.dart`
 * y `stats_pieces.dart`). El gráfico y el mapa van dibujados con `div`, sin
 * librería, por lo mismo que en la app: son barras y celdas sin interacción.
 * Ninguna necesita JavaScript: la ⓘ es un `<details>`.
 */

const copy = miLocal.crecimiento;
const porcentaje = (proporcion: number) => Math.round(proporcion * 100);

/** Una tarjeta: el título, su ⓘ que se abre debajo, y lo que lleve a la derecha. */
function Tarjeta({
  titulo,
  info,
  accion,
  className,
  children,
}: {
  titulo: string;
  info: string;
  accion?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Superficie tone="surface" className={cn("flex flex-col gap-4 p-5 md:p-6", className)}>
      {/* Lo de la derecha queda afuera del `summary`: un enlace adentro abriría la ⓘ. */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <details className="group min-w-48 flex-1">
          <summary className="ring-focus inline-flex cursor-pointer list-none items-center gap-1.5 rounded-pill [&::-webkit-details-marker]:hidden">
            <h2 className="font-semibold text-fg">{titulo}</h2>
            <span className="inline-flex size-7 items-center justify-center rounded-pill text-muted group-open:bg-fg/6 group-open:text-fg hover:text-fg">
              <Info aria-hidden className="size-4" />
              <span className="sr-only">{copy.comoSeCuenta}</span>
            </span>
          </summary>
          <p className="mt-2 max-w-prose text-small text-muted">{info}</p>
        </details>
        {accion}
      </div>
      {children}
    </Superficie>
  );
}

/** Un número grande con su bajada. */
function Cifra({ valor, bajada, acento }: { valor: string; bajada: string; acento?: boolean }) {
  return (
    <div>
      <p className={cn("text-title font-extrabold tracking-[-0.02em]", acento ? "text-accent-fg" : "text-fg")}>{valor}</p>
      <p className="text-small text-muted">{bajada}</p>
    </div>
  );
}

/** Lo que el plan no trae: la muestra borrosa y, encima, a qué plan pasar. */
function Bloqueado({ muestra, titulo, bajada }: { muestra: ReactNode; titulo: string; bajada: string }) {
  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none blur-[6px] select-none">
        {muestra}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
        <div>
          <p className="font-semibold text-fg">{titulo}</p>
          <p className="text-small text-fg">{bajada}</p>
        </div>
        <Button href="/planes" size="compact">
          {copy.bloqueado.boton}
        </Button>
      </div>
    </div>
  );
}

/** Muestra de los meses en un plan sin historial, la de la app: los números no se leen detrás del desenfoque. */
const MUESTRA_DE_MESES: Mes[] = [9, 14, 11, 18, 15, 21].map((turnos, i) => ({
  clave: `muestra-${i}`,
  turnos,
  ingresos: 0,
  cancelados: 0,
  ausentes: 0,
  clientesNuevos: 0,
  clientesRecurrentes: 0,
}));

/** El gráfico por mes: los turnos o lo facturado. El último está en curso, y va marcado para que no se lea como una caída. */
function BarrasPorMes({ meses, deIngresos }: { meses: Mes[]; deIngresos: boolean }) {
  const valor = (m: Mes) => (deIngresos ? m.ingresos : m.turnos);
  const maximo = Math.max(0, ...meses.map(valor));
  const ultimo = meses.length - 1;
  // Pasando de seis barras se rotula mes por medio, siempre con el último: doce rótulos no entran.
  const conRotulo = (i: number) => meses.length <= 6 || (ultimo - i) % 2 === 0;
  const muestra = meses[0]?.clave.startsWith("muestra");

  return (
    <div>
      <div aria-hidden className="flex h-44 items-end gap-1 md:gap-2">
        {meses.map((m, i) => {
          const v = valor(m);
          const enCurso = i === ultimo;
          // Los montos no entran sobre doce barras: van sólo en las que llevan el mes abajo.
          const numero = v === 0 || (deIngresos && !conRotulo(i)) ? "" : deIngresos ? pesosCortos(v) : String(v);
          return (
            <div key={m.clave} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
              <span
                className={cn("text-micro font-semibold whitespace-nowrap", enCurso ? "text-accent-fg" : "text-muted")}
              >
                {numero}
              </span>
              <div
                className={cn(
                  "w-full max-w-12 rounded-t-lg",
                  v === 0 ? "bg-fg/8" : enCurso ? "bg-accent" : "bg-accent/55",
                )}
                // Un mínimo visible para que un mes con pocos turnos no desaparezca.
                style={{ height: v === 0 ? 2 : `max(6px, calc(${maximo === 0 ? 0 : v / maximo} * (100% - 3rem)))` }}
              />
              <span
                className={cn(
                  "text-micro whitespace-nowrap",
                  enCurso ? "font-bold text-accent-fg" : "font-medium text-muted",
                )}
              >
                {!muestra && conRotulo(i) ? mesRotulo(m.clave) : " "}
              </span>
            </div>
          );
        })}
      </div>
      {!muestra && (
        <ul className="sr-only">
          {meses.map((m, i) => (
            <li key={m.clave}>
              {mesRotulo(m.clave)}
              {i === ultimo && ` (${copy.facturado.enCurso})`}: {deIngresos ? pesos(m.ingresos) : miLocal.agenda.turnos(m.turnos)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Lo facturado, el gráfico por mes y los selectores. Arriba va la plata y no
 * los turnos: es la pregunta que se hace un dueño al abrir esta pantalla.
 */
export function Facturado({
  estadisticas,
  deIngresos,
  selectorDePeriodo,
  selectorDeVista,
  bloqueadoHasta,
}: {
  estadisticas: Estadisticas;
  deIngresos: boolean;
  selectorDePeriodo: ReactNode;
  selectorDeVista: ReactNode;
  /** El plan que trae el historial, si el del local no lo trae. */
  bloqueadoHasta: string | null;
}) {
  const t = totales(estadisticas);
  const comparacion = ultimoMesCerrado(estadisticas);
  const Tendencia = comparacion && comparacion.variacion < 0 ? TrendingDown : TrendingUp;

  return (
    <Tarjeta
      titulo={bloqueadoHasta ? copy.facturado.tituloDelMes : copy.facturado.titulo}
      info={copy.facturado.info}
      accion={bloqueadoHasta ? undefined : selectorDePeriodo}
      className="lg:col-span-2"
    >
      <div className="flex flex-col gap-2">
        <p className="text-[2rem] leading-tight font-extrabold tracking-[-0.03em] text-fg md:text-[2.5rem]">
          {pesos(t.ingresos)}
        </p>
        <p className="text-small text-muted">
          {t.turnos === 0 ? copy.facturado.sinTurnos : copy.facturado.resumen(miLocal.agenda.turnos(t.turnos), pesos(t.ticketPromedio))}
        </p>
        {comparacion && (
          <p className="inline-flex items-center gap-1.5 self-start rounded-pill bg-fg/6 px-3 py-1 text-small font-semibold text-fg">
            <Tendencia aria-hidden className="size-4" />
            <span className="sr-only">{comparacion.variacion < 0 ? copy.facturado.baja : copy.facturado.sube}</span>
            {copy.facturado.variacion(
              porcentaje(Math.abs(comparacion.variacion)),
              mesRotulo(comparacion.mes.clave),
              mesRotulo(comparacion.anterior.clave),
            )}
          </p>
        )}
      </div>

      {bloqueadoHasta ? (
        <Bloqueado
          muestra={<BarrasPorMes meses={MUESTRA_DE_MESES} deIngresos={false} />}
          titulo={copy.bloqueado.historial(bloqueadoHasta)}
          bajada={copy.bloqueado.bajadaHistorial}
        />
      ) : (
        <>
          {selectorDeVista}
          <p className="sr-only">{copy.facturado.grafico(deIngresos ? copy.ingresos : copy.turnos)}</p>
          <BarrasPorMes meses={estadisticas.meses} deIngresos={deIngresos} />
        </>
      )}
    </Tarjeta>
  );
}

/** Clientes que volvieron y que vinieron por primera vez. */
export function Clientes({ estadisticas }: { estadisticas: Estadisticas }) {
  const t = totales(estadisticas);
  if (t.nuevos + t.recurrentes === 0) return null;

  return (
    <Tarjeta titulo={copy.clientes.titulo} info={copy.clientes.info}>
      <div className="grid grid-cols-2 gap-4">
        <Cifra valor={String(t.recurrentes)} bajada={copy.clientes.volvieron(t.recurrentes)} acento />
        <Cifra valor={String(t.nuevos)} bajada={copy.clientes.nuevos(t.nuevos)} />
      </div>
      {/* La proporción entre los dos en la misma barra: pleno lo que volvió, claro lo nuevo. */}
      <div aria-hidden className="flex h-3 gap-1 overflow-hidden rounded-pill">
        {t.recurrentes > 0 && <div className="bg-accent" style={{ flexGrow: t.recurrentes }} />}
        {t.nuevos > 0 && <div className="bg-accent/25" style={{ flexGrow: t.nuevos }} />}
      </div>
      <p className="text-small text-fg">
        {t.recurrentes === 0 ? copy.clientes.nadie : copy.clientes.proporcion(porcentaje(t.tasaRecurrentes))}
      </p>
    </Tarjeta>
  );
}

/** Lo que se reservó y no se hizo: cancelados y ausentes. */
export function NoHechos({ estadisticas }: { estadisticas: Estadisticas }) {
  const t = totales(estadisticas);
  if (t.cancelados + t.ausentes === 0) return null;

  return (
    <Tarjeta titulo={copy.noHechos.titulo} info={copy.noHechos.info}>
      <Cifra valor={`${porcentaje(t.tasaNoHechos)}%`} bajada={copy.noHechos.deLoReservado} />
      <dl className="divide-y divide-line text-small">
        {[
          [copy.noHechos.cancelados, t.cancelados],
          [copy.noHechos.ausentes, t.ausentes],
        ].map(([rotulo, cantidad]) => (
          <div key={rotulo} className="flex justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
            <dt className="text-fg">{rotulo}</dt>
            <dd className="font-bold text-fg">{cantidad}</dd>
          </div>
        ))}
      </dl>
      {t.ausentes > 0 && <p className="text-small text-muted">{copy.noHechos.sena}</p>}
    </Tarjeta>
  );
}

/** Muestra del mapa en un plan sin historial, la de la app. */
const MUESTRA_DE_FRANJAS: Franja[] = [
  [5, 3, 4, 5, 6, 10, 0],
  [4, 3, 3, 4, 5, 8, 0],
  [5, 1, 3, 4, 7, 7, 0],
  [8, 6, 7, 8, 9, 4, 0],
].map((porDia, i) => ({ desde: 9 + i * 3, hasta: 12 + i * 3, porDia }));

/** Los días por franjas de tres horas: cuanto más oscura la celda, más turnos. */
function MapaDeHorarios({ lista }: { lista: Franja[] }) {
  const maximo = Math.max(0, ...lista.flatMap((f) => f.porDia));
  return (
    <div aria-hidden className="grid grid-cols-[3rem_repeat(7,minmax(0,1fr))] gap-1.5 text-micro font-semibold text-muted">
      <span />
      {copy.horarios.letras.map((letra, i) => (
        <span key={i} className="text-center">
          {letra}
        </span>
      ))}
      {lista.map((f) => (
        <div key={f.desde} className="contents">
          <span className="self-center">
            {f.desde}–{f.hasta}
          </span>
          {f.porDia.map((v, i) => (
            <div key={i} className="relative h-9 overflow-hidden rounded-md bg-fg/5">
              {v > 0 && maximo > 0 && (
                <div className="absolute inset-0 bg-accent" style={{ opacity: 0.12 + (v / maximo) * 0.88 }} />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const cuando = (c: Celda) => copy.horarios.cuando(copy.horarios.dias[c.dia - 1] ?? "", c.franja.desde, c.franja.hasta);

/** Qué días y a qué hora se atiende más. */
export function CuandoSeLlena({ estadisticas, bloqueadoHasta }: { estadisticas: Estadisticas; bloqueadoHasta: string | null }) {
  const lista = franjas(estadisticas);
  if (!bloqueadoHasta && lista.length === 0) return null;
  const lleno = masLleno(lista);
  const vacio = masVacio(lista);

  return (
    <Tarjeta titulo={copy.horarios.titulo} info={copy.horarios.info}>
      {bloqueadoHasta ? (
        <Bloqueado
          muestra={<MapaDeHorarios lista={MUESTRA_DE_FRANJAS} />}
          titulo={copy.bloqueado.horarios(bloqueadoHasta)}
          bajada={copy.bloqueado.bajadaHorarios}
        />
      ) : (
        <>
          <MapaDeHorarios lista={lista} />
          <div className="flex flex-col gap-1 text-small text-fg">
            {lleno && (
              <p>
                <span className="font-bold">{copy.horarios.masLleno}</span> {cuando(lleno)}
              </p>
            )}
            {vacio && lleno && vacio.turnos < lleno.turnos && (
              <p>
                <span className="font-bold">{copy.horarios.masVacio}</span> {cuando(vacio)} · {copy.horarios.hueco}
              </p>
            )}
          </div>
        </>
      )}
    </Tarjeta>
  );
}

/** Una lista de nombres con su barra contra el primero: servicios o profesionales. */
export function Ranking({
  titulo,
  info,
  filas,
  detalle,
}: {
  titulo: string;
  info: string;
  filas: Fila[];
  detalle: (fila: Fila) => string;
}) {
  const maximo = filas[0]?.turnos ?? 0;
  return (
    <Tarjeta titulo={titulo} info={info}>
      <ul className="flex flex-col gap-4">
        {filas.map((f, i) => (
          <li key={i} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-small">
              <span className="min-w-0 truncate font-semibold text-fg">{f.nombre}</span>
              <span className="shrink-0 text-muted">{detalle(f)}</span>
            </div>
            <div aria-hidden className="h-2 overflow-hidden rounded-pill bg-fg/6">
              <div className="h-full rounded-pill bg-accent" style={{ width: `${maximo === 0 ? 0 : (f.turnos / maximo) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}

/** "40%": la parte de los turnos del período. */
export const participacion = (turnos: number, total: number) => (total <= 0 ? "0%" : `${porcentaje(turnos / total)}%`);
