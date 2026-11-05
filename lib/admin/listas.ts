import { canales, filtrosComercios, niveles, ordenesComercios } from "@/content/admin";
import type { FiltroComercios, OrdenComercios, PedidoDeComercios } from "./datos";

/*
 * Lo que piden las listas del panel por la URL, ya validado: la página y su
 * CSV leen lo mismo. Un valor que no se conoce no filtra, en vez de llegar a
 * la base y volver como `parametro_invalido` (BooKit `docs/admin-panel.md`,
 * sección 22).
 */

/** Los parámetros de la URL de Comercios. `p` es la página. */
export type ParamsDeComercios = {
  q?: string;
  estado?: string;
  localidad?: string;
  nivel?: string;
  canal?: string;
  fundador?: string;
  oculto?: string;
  pausa?: string;
  orden?: string;
  p?: string;
};

/** Los filtros de la URL que no son la búsqueda, el estado ni la página. */
export const FILTROS_DE_COMERCIOS = ["localidad", "nivel", "canal", "fundador", "oculto", "pausa", "orden"] as const;

/** `si` y `no` de la URL, o nada. */
const siNo = (valor: string | undefined) => (valor === "si" ? true : valor === "no" ? false : undefined);

export function pedidoDeComercios(params: ParamsDeComercios): PedidoDeComercios {
  const oculto = siNo(params.oculto);
  return {
    busqueda: params.q?.trim() || undefined,
    estado: filtrosComercios.some((f) => f.valor === params.estado) ? (params.estado as FiltroComercios) : undefined,
    localidad: params.localidad || undefined,
    nivel: params.nivel && Object.hasOwn(niveles, params.nivel) ? params.nivel : undefined,
    canal: params.canal && Object.hasOwn(canales, params.canal) ? params.canal : undefined,
    fundador: siNo(params.fundador),
    visible: oculto === undefined ? undefined : !oculto,
    enPausa: siNo(params.pausa),
    orden: params.orden && Object.hasOwn(ordenesComercios, params.orden) ? (params.orden as OrdenComercios) : undefined,
  };
}

const aSiNo = (valor: boolean | undefined) => (valor === undefined ? undefined : valor ? "si" : "no");

/** La vuelta: un pedido ya validado escrito como la URL, para los links de la lista y su CSV. */
export function paramsDeComercios(pedido: PedidoDeComercios): ParamsDeComercios {
  return {
    q: pedido.busqueda,
    estado: pedido.estado,
    localidad: pedido.localidad,
    nivel: pedido.nivel,
    canal: pedido.canal,
    fundador: aSiNo(pedido.fundador),
    oculto: aSiNo(pedido.visible === undefined ? undefined : !pedido.visible),
    pausa: aSiNo(pedido.enPausa),
    orden: pedido.orden === "alta" ? undefined : pedido.orden,
  };
}

/** Los parámetros de la URL de Personas. */
export type ParamsDePersonas = { q?: string; p?: string };

export const pedidoDePersonas = (params: ParamsDePersonas) => ({ busqueda: params.q?.trim() || undefined });
