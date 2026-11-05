import { pausa as copy } from "@/content/admin";
import type { CambioDePausa, Pausa } from "@/lib/admin/datos";
import { diaDe, diaYMesDe, hoy } from "@/lib/formato";
import { sumarDias } from "@/lib/mi-local/vista";
import { Dato } from "./piezas";

/*
 * La pausa que pide el propio local, como la ve el panel (docs/PLAN-ADMIN-V5.md,
 * paso S, y BooKit `docs/pausa-del-local.md`, sección 5). La base manda sólo
 * la que no terminó: en curso si ya empezó, programada si no.
 */

const enCurso = (p: Pausa) => p.desde <= hoy();

const fechas = (desde: string, hasta: string | null) => copy.fechas(diaYMesDe(desde), hasta && diaYMesDe(hasta));

/** "En pausa" o "Pausa programada", con las fechas al pasar el mouse. */
export function MarcaDePausa({ pausa }: { pausa: Pausa | null }) {
  if (!pausa) return null;
  return (
    <span title={fechas(pausa.desde, pausa.hasta)}>
      <Dato>{enCurso(pausa) ? copy.enCurso : copy.programada}</Dato>
    </span>
  );
}

/** Lo que dice el bloque Visibilidad de la pausa: cuándo y qué pasa con los turnos. */
export function DetalleDePausa({ pausa }: { pausa: Pausa | null }) {
  if (!pausa) return null;
  const { detalle } = copy;
  const texto = !enCurso(pausa)
    ? detalle.programada(fechas(pausa.desde, pausa.hasta))
    : pausa.hasta
      ? detalle.enCurso(diaYMesDe(pausa.hasta), diaYMesDe(sumarDias(pausa.hasta, 1)))
      : detalle.enCursoSinVuelta(diaYMesDe(pausa.desde));

  return (
    <div className="mt-4 flex flex-col gap-1 border-t border-line pt-3 text-small">
      <p className="font-medium text-fg">{texto}</p>
      <p className="text-muted">{detalle.loManeja}</p>
    </div>
  );
}

/**
 * Qué hizo el dueño con la pausa. "Volver ahora" con la pausa en curso deja
 * `hasta` en ayer (sección 5 del contrato), salvo si empezó ese mismo día:
 * ahí deja las dos fechas en null, como sacar una programada. Por eso una
 * pausa sacada que ya había empezado también es una vuelta.
 */
export function queCambioLaPausa(k: CambioDePausa) {
  const { cambio } = copy;
  const dia = diaDe(k.cambiado_el);
  const que = !k.desde
    ? k.desde_antes && k.desde_antes <= dia
      ? cambio.volvio
      : cambio.saco
    : k.hasta && k.hasta < dia
      ? cambio.volvio
      : k.desde_antes
        ? cambio.cambio(fechas(k.desde, k.hasta))
        : cambio.pauso(fechas(k.desde, k.hasta));
  return k.turnos_cancelados > 0 ? `${que} · ${cambio.cancelados(k.turnos_cancelados)}` : que;
}
