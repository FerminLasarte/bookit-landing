/*
 * Cómo se escriben los números y las fechas en el panel. Todo en la hora de
 * Buenos Aires, como la app: el servidor de Vercel corre en UTC.
 */

const ZONA = "America/Argentina/Buenos_Aires";

const plata = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});
const entero = new Intl.NumberFormat("es-AR");
const fechaCorta = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: ZONA });
const fechaLarga = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: ZONA,
});
const mesCorto = new Intl.DateTimeFormat("es-AR", { month: "short", timeZone: "UTC" });
const relativo = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" });

/** `$150.000`. */
export const pesos = (valor: number | null | undefined) => plata.format(valor ?? 0);

/** `1.234`. */
export const numero = (valor: number) => entero.format(valor);

/** `8 oct.`, o una raya si no hay fecha. */
export const fecha = (iso: string | null | undefined) => (iso ? fechaCorta.format(new Date(iso)) : "—");

/** `8 oct. 2026`. */
export const fechaConAnio = (iso: string | null | undefined) =>
  iso ? fechaLarga.format(new Date(iso)) : "—";

/** `may.` a partir de `2026-05`. */
export const mes = (clave: string) => mesCorto.format(new Date(`${clave}-01T12:00:00Z`));

/** `hace 3 días`, `mañana`. Por días: el panel no necesita más precisión. */
export function haceCuanto(iso: string | null | undefined): string {
  if (!iso) return "nunca";
  const dias = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  return relativo.format(dias, "day");
}
