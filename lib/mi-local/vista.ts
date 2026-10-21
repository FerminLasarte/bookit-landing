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

/** Lo que no se eligió no va en la URL; el día va siempre. */
export type Parametros = Record<string, string | null>;

/** Un enlace de /mi-local con su día y lo demás que se eligió. */
export function enlaceConDia(ruta: string, dia: string, otros: Parametros): string {
  const parametros = new URLSearchParams({ dia });
  for (const [clave, valor] of Object.entries(otros)) if (valor) parametros.set(clave, valor);
  return `${ruta}?${parametros}`;
}

/** El enlace a una vista de la agenda. */
export const enlaceDeVista = ({ dia, profesional, estado }: Vista) =>
  enlaceConDia("/mi-local", dia, { profesional, estado });

/** Lo que se va eligiendo para cargar un turno a mano: también vive en la URL. */
export type Carga = { dia: string; profesional: string | null; servicio: string | null };

/** El enlace a un paso de la carga. */
export const enlaceDeCarga = ({ dia, profesional, servicio }: Carga) =>
  enlaceConDia("/mi-local/nuevo", dia, { profesional, servicio });
