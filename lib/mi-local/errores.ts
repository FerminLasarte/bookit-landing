export type ErrorDeLaBase = { code: string; message: string; hint?: string | null };

/** Las pistas con que la base dice que algo no entra en el plan (BooKit 20261003140000). */
const PISTAS_DEL_PLAN = ["tope_profesionales", "plan_sin_staff"];

/**
 * Lo que dice la base cuando rechaza algo, si es una frase para personas, o
 * `null`. Las que la base escribe para mostrarse son:
 * - `42501` cuando no se puede ("El turno todavía no empezó."). El `42501` de
 *   Postgres sin trigger ("permission denied for table…") no es una de ellas.
 * - `22023` cuando un valor no va ("La seña no puede ser mayor que el
 *   precio.", BooKit 20261022120000).
 * - Las del plan, con su pista ("Tu plan incluye hasta 2 profesionales
 *   activos.").
 * - `54000`, el tope de invitaciones del día, y `P0002`, la invitación que ya
 *   no se puede reenviar.
 *
 * La app las muestra tal cual (D7 de la fase 2, D3 de la fase 3).
 */
export function mensajeDeLaBase(error: ErrorDeLaBase): string | null {
  if (["22023", "54000", "P0002"].includes(error.code)) return error.message;
  if (error.code === "42501" && !error.message.startsWith("permission denied")) return error.message;
  if (pideOtroPlan(error)) return error.message;
  return null;
}

/** Si lo que se rechazó se destraba con otro plan: el que lo ve puede ir a /planes. */
export const pideOtroPlan = (error: ErrorDeLaBase) => PISTAS_DEL_PLAN.includes(error.hint ?? "");
