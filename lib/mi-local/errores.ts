/**
 * Lo que dice la base cuando rechaza algo, si es una frase para personas, o
 * `null`. Las que la base escribe para mostrarse van con dos códigos: `42501`
 * cuando no se puede ("El turno todavía no empezó.") y `22023` cuando un valor
 * no va ("La seña no puede ser mayor que el precio.", BooKit 20261022120000).
 * El `42501` de Postgres sin trigger ("permission denied for table…") no es
 * una de ellas. La app las muestra tal cual (D7 de la fase 2, D3 de la fase 3).
 */
export function mensajeDeLaBase(error: { code: string; message: string }): string | null {
  if (error.code === "22023") return error.message;
  if (error.code === "42501" && !error.message.startsWith("permission denied")) return error.message;
  return null;
}
