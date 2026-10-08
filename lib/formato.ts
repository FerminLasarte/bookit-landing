/*
 * Cómo se escriben los números y las fechas del panel y de los planes. Todo
 * en la hora de Buenos Aires, como la app: el servidor de Vercel corre en UTC.
 */

const ZONA = "America/Argentina/Buenos_Aires";

// `always`: en español `Intl` no separa los miles de un número de cuatro cifras.
const entero = new Intl.NumberFormat("es-AR", { useGrouping: "always" });
const fechaCorta = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: ZONA });
const fechaLarga = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: ZONA,
});
const diaYMesLargo = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", timeZone: ZONA });
const mesCorto = new Intl.DateTimeFormat("es-AR", { month: "short", timeZone: "UTC" });
const relativo = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" });

/**
 * `$150.000`, como en la app: sin el espacio que pone `Intl` entre el signo y
 * el número. Negativo, `-$500`.
 */
export function pesos(valor: number | null | undefined): string {
  const n = Math.round(valor ?? 0);
  return `${n < 0 ? "-" : ""}$${entero.format(Math.abs(n))}`;
}

/** `1.234`. */
export const numero = (valor: number) => entero.format(valor);

/** `8 oct.`, o una raya si no hay fecha. */
export const fecha = (iso: string | null | undefined) => (iso ? fechaCorta.format(new Date(iso)) : "—");

/** `8 oct. 2026`. */
export const fechaConAnio = (iso: string | null | undefined) =>
  iso ? fechaLarga.format(new Date(iso)) : "—";

/** `28 de octubre`: las fechas que lee el dueño en /planes. */
export const diaYMes = (iso: string | null | undefined) => (iso ? diaYMesLargo.format(new Date(iso)) : "—");

/** `may.` a partir de `2026-05`. */
export const mes = (clave: string) => mesCorto.format(new Date(`${clave}-01T12:00:00Z`));

/** `hace 3 días`, `mañana`. Por días: el panel no necesita más precisión. */
export function haceCuanto(iso: string | null | undefined): string {
  if (!iso) return "nunca";
  const dias = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  return relativo.format(dias, "day");
}
