import type { NextRequest } from "next/server";
import { canales, csvAdmin, estados, niveles, planes } from "@/content/admin";
import { respuestaCsv, todasLasFilas } from "@/lib/admin/csv";
import { leerComercios, MAXIMO_POR_LECTURA } from "@/lib/admin/datos";
import { pedidoDeComercios } from "@/lib/admin/listas";
import { diaDe, hoy } from "@/lib/formato";

/** Comercios en CSV, con los mismos filtros y el mismo orden que la lista (paso U). */
export async function GET(request: NextRequest) {
  const pedido = pedidoDeComercios(Object.fromEntries(request.nextUrl.searchParams));
  const filas = await todasLasFilas((desde) => leerComercios({ ...pedido, limite: MAXIMO_POR_LECTURA, desde }));
  const siNo = (valor: boolean) => (valor ? csvAdmin.si : csvAdmin.no);
  const dia = (iso: string | null) => (iso ? diaDe(iso) : null);

  return respuestaCsv(
    csvAdmin.comercios.archivo,
    hoy(),
    csvAdmin.comercios.columnas,
    filas.map((c) => [
      c.nombre,
      c.localidad,
      c.email_duenio,
      c.dado_de_baja_el ? csvAdmin.deBaja : (estados[c.estado]?.label ?? c.estado),
      niveles[c.nivel] ?? c.nivel,
      planes[c.plan] ?? c.plan,
      canales[c.canal] ?? c.canal,
      dia(c.vencimiento),
      siNo(c.cancela_al_vencer),
      siNo(c.es_fundador),
      siNo(c.visible),
      c.pausa?.desde,
      c.pausa?.hasta,
      c.turnos_30d,
      dia(c.ultimo_turno),
      dia(c.creado_el),
      dia(c.dado_de_baja_el),
    ]),
  );
}
