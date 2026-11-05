import type { NextRequest } from "next/server";
import { atajosAdmin } from "@/content/admin";
import { leerComercios, leerPersonas, type Encontrados } from "@/lib/admin/datos";

/** Cuántos de cada uno trae el buscador: es para ir, no para listar. */
const POR_GRUPO = 5;

/**
 * Lo que busca "Ir a…" (docs/PLAN-ADMIN-V5.md, paso R): locales y personas
 * por nombre o mail, con las mismas lecturas de las listas. Con menos de dos
 * letras no busca.
 */
export async function GET(request: NextRequest) {
  const texto = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (texto.length < 2) return Response.json({ comercios: [], personas: [] } satisfies Encontrados);

  const pedido = { busqueda: texto, limite: POR_GRUPO, desde: 0 };
  const [comercios, personas] = await Promise.all([leerComercios(pedido), leerPersonas(pedido)]);

  return Response.json({
    comercios: comercios.filas.map((c) => ({
      href: `/admin/comercios/${c.id_comercio}`,
      titulo: c.nombre,
      detalle: [c.localidad, c.email_duenio].filter(Boolean).join(" · ") || atajosAdmin.sinDueno,
    })),
    personas: personas.filas.map((p) => ({
      href: `/admin/personas/${p.id_usuario}`,
      titulo: p.nombre ?? p.email ?? atajosAdmin.sinNombre,
      detalle: p.nombre ? (p.email ?? "") : "",
    })),
  } satisfies Encontrados);
}
