import type { NextRequest } from "next/server";
import { csvAdmin, roles } from "@/content/admin";
import { respuestaCsv, todasLasFilas } from "@/lib/admin/csv";
import { leerPersonas, MAXIMO_POR_LECTURA } from "@/lib/admin/datos";
import { pedidoDePersonas } from "@/lib/admin/listas";
import { diaDe, hoy } from "@/lib/formato";

/** Personas en CSV, con la misma búsqueda que la lista (paso U). */
export async function GET(request: NextRequest) {
  const pedido = pedidoDePersonas(Object.fromEntries(request.nextUrl.searchParams));
  const filas = await todasLasFilas((desde) => leerPersonas({ ...pedido, limite: MAXIMO_POR_LECTURA, desde }));

  return respuestaCsv(
    csvAdmin.personas.archivo,
    hoy(),
    csvAdmin.personas.columnas,
    filas.map((p) => [
      p.nombre,
      p.email,
      p.locales.map((l) => `${l.nombre} (${roles[l.rol] ?? l.rol})`).join("; "),
      diaDe(p.alta),
      p.ultimo_ingreso ? diaDe(p.ultimo_ingreso) : null,
    ]),
  );
}
