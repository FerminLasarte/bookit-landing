import "server-only";
import { MAXIMO_POR_LECTURA } from "./datos";

/*
 * Las listas del panel en CSV (docs/PLAN-ADMIN-V5.md, paso U). Se recorre la
 * lectura de a lo más que da la base (sección 22) hasta llegar al total, con
 * la sesión de quien exporta.
 */

type Celda = string | number | boolean | null | undefined;

/** Todas las filas de una lectura paginada. */
export async function todasLasFilas<T>(leer: (desde: number) => Promise<{ total: number; filas: T[] }>): Promise<T[]> {
  const filas: T[] = [];
  for (let desde = 0; ; desde += MAXIMO_POR_LECTURA) {
    const pagina = await leer(desde);
    filas.push(...pagina.filas);
    if (pagina.filas.length < MAXIMO_POR_LECTURA || filas.length >= pagina.total) return filas;
  }
}

/** Una celda con comillas si hace falta, y nada para lo vacío. */
function celda(valor: Celda): string {
  if (valor === null || valor === undefined) return "";
  const texto = String(valor);
  return /[",\n\r]/.test(texto) ? `"${texto.replaceAll('"', '""')}"` : texto;
}

/**
 * El archivo, con el BOM de UTF-8 para que Numbers y Excel lean bien los
 * acentos. `nombre` sin extensión: suma la fecha del día.
 */
export function respuestaCsv(nombre: string, hoy: string, columnas: string[], filas: Celda[][]): Response {
  const lineas = [columnas, ...filas].map((fila) => fila.map(celda).join(","));
  return new Response(`\uFEFF${lineas.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombre}-${hoy}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
