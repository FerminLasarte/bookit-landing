import { hoy } from "@/lib/formato";
import { esClaveDeDia, sumarDias } from "@/lib/mi-local/vista";

/*
 * La pausa que pide el propio local (BooKit `docs/pausa-del-local.md`): las
 * cuentas que comparten `/mi-local`, que la maneja, y `/admin`, que la
 * muestra. Sin `server-only`: el formulario de la pausa también las usa.
 */

/**
 * Una pausa que no terminó: en curso o programada. Los días son de Buenos
 * Aires, como `2027-01-09`; `hasta` es el último día cerrado, o `null` si no
 * tiene fecha de vuelta.
 */
export type Pausa = { desde: string; hasta: string | null };

/**
 * La pausa de las columnas de `comercios`, o `null`. Una que ya terminó queda
 * escrita hasta la próxima: no cuenta (sección 3 del contrato).
 */
export function pausaVigente(desde: string | null, hasta: string | null, dia = hoy()): Pausa | null {
  if (!desde || (hasta && hasta < dia)) return null;
  return { desde, hasta };
}

/** Si ya empezó. Si no, está programada. */
export const enCurso = (pausa: Pausa, dia = hoy()) => pausa.desde <= dia;

/** El día en que el local vuelve a aparecer, el siguiente al último cerrado, o `null` sin fecha de vuelta. */
export const vuelta = (pausa: Pausa) => (pausa.hasta ? sumarDias(pausa.hasta, 1) : null);

/** Lo que se elige en /mi-local/perfil/pausa, como viaja en la URL y en el formulario. `vuelta`: `sin` es sin fecha de vuelta. */
export type FechasPedidas = { desde?: string; vuelta?: string; hasta?: string };

/** Las fechas elegidas, si están completas y en orden, o `null`. Lo demás (hoy, los 90 días) lo cuida la base. */
export function fechasDeLaPausa({ desde, vuelta, hasta }: FechasPedidas): Pausa | null {
  if (!esClaveDeDia(desde)) return null;
  if (vuelta === "sin") return { desde, hasta: null };
  return esClaveDeDia(hasta) && hasta >= desde ? { desde, hasta } : null;
}

/** La página de la pausa con esas fechas: la lista de turnos que se cancelan sale de la URL (D3). */
export function enlaceDeLaPausa({ desde, vuelta, hasta }: FechasPedidas, extra?: Record<string, string>) {
  const parametros = new URLSearchParams({
    desde: desde ?? "",
    vuelta: vuelta === "sin" ? "sin" : "con",
    ...(vuelta !== "sin" && hasta && { hasta }),
    ...extra,
  });
  return `/mi-local/perfil/pausa?${parametros}`;
}
