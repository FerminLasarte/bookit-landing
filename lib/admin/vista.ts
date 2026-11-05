import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";

/*
 * Cómo ve cada uno las listas del panel (docs/PLAN-ADMIN-V5.md, paso X): la
 * densidad de las tablas y cuántas filas por página. Vive en una cookie de
 * este navegador, no en la base: es una preferencia de quien mira, no un dato
 * de Bookit. El tema sigue al sistema, como el resto del sitio.
 */

export const COOKIE_DE_LA_VISTA = "panel-vista";

export const DENSIDADES = ["comoda", "compacta"] as const;
export type Densidad = (typeof DENSIDADES)[number];

export const FILAS_POR_PAGINA = [25, 50, 100] as const;

export type Vista = { densidad: Densidad; porPagina: number };

export const VISTA_POR_DEFECTO: Vista = { densidad: "comoda", porPagina: 50 };

/** La cookie es `compacta-25`: lo que no se reconoce vuelve a lo de siempre. */
export function vistaDe(valor: string | undefined): Vista {
  const [densidad, filas] = (valor ?? "").split("-");
  const porPagina = Number(filas);
  return {
    densidad: DENSIDADES.find((d) => d === densidad) ?? VISTA_POR_DEFECTO.densidad,
    porPagina: FILAS_POR_PAGINA.find((f) => f === porPagina) ?? VISTA_POR_DEFECTO.porPagina,
  };
}

export const valorDeVista = (vista: Vista) => `${vista.densidad}-${vista.porPagina}`;

/** La comparten el marco (la densidad) y las listas (las filas): una sola lectura por página. */
export const leerVista = cache(async () => vistaDe((await cookies()).get(COOKIE_DE_LA_VISTA)?.value));
