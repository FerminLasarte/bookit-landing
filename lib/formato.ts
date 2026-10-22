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
const horaYMinutos = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: ZONA });
// Un día de la agenda es una clave `2026-10-21`, sin hora: se lee a mediodía UTC para que ninguna zona lo corra.
const diaDeAgenda = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const diaDeLaSemanaCorto = new Intl.DateTimeFormat("es-AR", { weekday: "short", timeZone: "UTC" });
const mesYAnioLargo = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric", timeZone: "UTC" });
// `en-CA` escribe la fecha como `2026-10-21`.
const claveDeDia = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: ZONA });
const relativo = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" });

/**
 * `$150.000`, como en la app: sin el espacio que pone `Intl` entre el signo y
 * el número. Negativo, `-$500`.
 */
export function pesos(valor: number | null | undefined): string {
  const n = Math.round(valor ?? 0);
  return `${n < 0 ? "-" : ""}$${entero.format(Math.abs(n))}`;
}

/**
 * Un monto abreviado, para donde no entra entero: `$850`, `$180k`, `$1,2M`,
 * como `pesosCortos` de la app. Lo usan los rótulos del gráfico por mes.
 */
export function pesosCortos(valor: number): string {
  const v = Math.abs(valor);
  const signo = valor < 0 ? "-" : "";
  if (v >= 1_000_000) {
    const m = v / 1_000_000;
    return `${signo}$${(m >= 10 ? String(Math.round(m)) : m.toFixed(1).replace(/\.0$/, "")).replace(".", ",")}M`;
  }
  if (v >= 1000) return `${signo}$${Math.round(v / 1000)}k`;
  return `${signo}$${Math.round(v)}`;
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

/** `May`, como lo rotula el gráfico de la app: con mayúscula y sin el punto. */
export const mesRotulo = (clave: string) => {
  const corto = mes(clave).replace(".", "");
  return corto.charAt(0).toUpperCase() + corto.slice(1);
};

/** `hace 3 días`, `mañana`. Por días: el panel no necesita más precisión. */
export function haceCuanto(iso: string | null | undefined): string {
  if (!iso) return "nunca";
  const dias = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  return relativo.format(dias, "day");
}

/** `14:30`. */
export const hora = (iso: string) => horaYMinutos.format(new Date(iso));

/** `miércoles, 21 de octubre`, a partir de `2026-10-21`. */
export const dia = (clave: string) => diaDeAgenda.format(new Date(`${clave}T12:00:00Z`));

/** `lun`, a partir de `2026-10-21`. */
export const diaCorto = (clave: string) => diaDeLaSemanaCorto.format(new Date(`${clave}T12:00:00Z`)).replace(".", "");

/** `octubre de 2026`, a partir de `2026-10-21`. */
export const mesYAnio = (clave: string) => mesYAnioLargo.format(new Date(`${clave}T12:00:00Z`));

/** El día de hoy en Buenos Aires, como `2026-10-21`. */
export const hoy = () => claveDeDia.format(new Date());

/** El día de Buenos Aires de un momento, como `2026-10-21`. */
export const diaDe = (iso: string) => claveDeDia.format(new Date(iso));
