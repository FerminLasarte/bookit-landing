/*
 * Qué está mirando la agenda: el día y los filtros. Viven en la URL, así que
 * sobreviven a recargar y se pueden guardar. Sin `server-only`: el selector de
 * día también arma enlaces.
 */

export type Vista = { dia: string; profesional: string | null; estado: string | null };

/** Si es un día de verdad escrito como `2026-10-21`. */
export function esClaveDeDia(valor: unknown): valor is string {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T12:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(valor);
}

/** El día `n` días antes o después. A mediodía UTC, para que ningún cambio de hora lo corra. */
export function sumarDias(dia: string, n: number): string {
  const fecha = new Date(`${dia}T12:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + n);
  return fecha.toISOString().slice(0, 10);
}

/** El enlace a una vista. Lo que no se filtra no va en la URL; el día va siempre. */
export function enlaceDeVista({ dia, profesional, estado }: Vista): string {
  const parametros = new URLSearchParams({ dia });
  if (profesional) parametros.set("profesional", profesional);
  if (estado) parametros.set("estado", estado);
  return `/mi-local?${parametros}`;
}
