"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { miLocal } from "@/content/mi-local";
import { campo } from "@/lib/formularios";
import { leerLocalQueEntra } from "@/lib/mi-local/agenda";
import { mensajeDeLaBase } from "@/lib/mi-local/errores";
import type { Respuesta } from "@/lib/mi-local/respuesta";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * Crear, editar y dar de baja un servicio, con la sesión del dueño: la
 * política de `servicios` deja escribir sólo los del local propio. Los valores
 * los controla la base (`trg_servicios_valores_validos`, BooKit
 * 20261022120000) y contesta con frases para personas; acá sólo se mira la
 * forma (D3 del plan de la fase 3).
 */

export type EstadoDeServicio = Respuesta;

const servicio = z.object({
  id: z.coerce.number().int().positive().nullable(),
  nombre: z.string().trim().min(1).max(100),
  descripcion: z.string().trim().max(500),
  precio: z.coerce.number().finite(),
  duracion: z.coerce.number().int(),
  /** Sólo viaja si el plan incluye la seña: sin ella, la seña del servicio no se toca. */
  sena: z
    .object({ pide: z.boolean(), tipo: z.enum(["porcentaje", "fijo"]), valor: z.coerce.number().finite() })
    .nullable(),
});

/** Crea un servicio o guarda los cambios de uno, y vuelve a la lista. */
export async function guardarServicio(_: EstadoDeServicio, datos: FormData): Promise<EstadoDeServicio> {
  const { errores } = miLocal.servicio;

  // Lo que falta se dice junto, como en la app: "Faltan el nombre y el precio."
  const faltan = (["nombre", "precio", "duracion"] as const).filter((c) => !campo(datos, c)).map((c) => errores.campos[c]);
  if (faltan.length) return { error: errores.faltan(faltan) };

  const conSena = datos.get("con_sena") === "1";
  const pide = datos.get("pide_sena") === "on";
  const tipo = campo(datos, "tipo_sena") === "fijo" ? "fijo" : "porcentaje";
  if (conSena && pide && !campo(datos, "valor_sena")) return { error: errores.faltaSena[tipo] };

  const leido = servicio.safeParse({
    id: campo(datos, "id") || null,
    nombre: campo(datos, "nombre"),
    descripcion: campo(datos, "descripcion"),
    precio: campo(datos, "precio"),
    duracion: campo(datos, "duracion"),
    sena: conSena ? { pide, tipo, valor: campo(datos, "valor_sena") || 0 } : null,
  });
  if (!leido.success) return { error: errores.generico };
  const d = leido.data;

  const local = await leerLocalQueEntra();
  if (!local) return { error: errores.sinAcceso };

  const fila = {
    nombre: d.nombre,
    descripcion: d.descripcion || null,
    precio: d.precio,
    duracion_minutos: d.duracion,
    ...(d.sena && { requiere_sena: d.sena.pide, tipo_sena: d.sena.tipo, valor_sena: d.sena.pide ? d.sena.valor : 0 }),
  };
  const supabase = await clienteDeSupabase("local");
  const { data, error } = d.id
    ? await supabase.from("servicios").update(fila).eq("id_servicio", d.id).eq("esta_activo", true).select("id_servicio")
    : await supabase
        .from("servicios")
        .insert({ ...fila, id_comercio: local.id })
        .select("id_servicio");
  if (error) {
    const deLaBase = mensajeDeLaBase(error);
    if (!deLaBase) console.error("mi-local/guardar-servicio:", error.code, error.message);
    return { error: deLaBase ?? errores.generico };
  }
  // Uno de otro local o ya dado de baja no da error: el update no toca nada.
  if (!data?.length) {
    console.error("mi-local/guardar-servicio: ninguna fila", d.id);
    return { error: errores.generico };
  }

  redirect("/mi-local/servicios");
}

/**
 * Da de baja un servicio: deja de ofrecerse y sus turnos siguen en pie. Es un
 * `update` y no un `delete`, como la app: el trigger de la base convierte el
 * borrado en baja igual, pero así cero filas se distingue de un error.
 */
export async function darDeBajaServicio(_: EstadoDeServicio, datos: FormData): Promise<EstadoDeServicio> {
  const { errores } = miLocal.servicio.baja;
  const id = z.coerce.number().int().positive().safeParse(datos.get("id"));
  if (!id.success) return { error: errores.generico };

  if (!(await leerLocalQueEntra())) return { error: errores.sinAcceso };

  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("servicios")
    .update({ esta_activo: false })
    .eq("id_servicio", id.data)
    .eq("esta_activo", true)
    .select("id_servicio");
  if (error || !data?.length) {
    console.error("mi-local/baja-de-servicio:", error?.code ?? "ninguna fila", error?.message ?? id.data);
    return { error: errores.generico };
  }

  redirect("/mi-local/servicios");
}
