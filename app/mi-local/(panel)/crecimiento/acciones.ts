"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { miLocal } from "@/content/mi-local";
import { campo } from "@/lib/formularios";
import { errorDe, localParaActuar } from "@/lib/mi-local/acciones";
import type { Respuesta } from "@/lib/mi-local/respuesta";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * Cupones, premios y el programa de puntos (fase 5, docs/PLAN-MI-LOCAL-FASE-5.md),
 * con la sesión del dueño: las políticas dejan escribir sólo lo del local
 * propio. Las reglas las cuidan los CHECKs de BooKit 20261022210000; acá se
 * dicen antes, con las frases de la app, para no mandar algo que va a
 * rebotar. Crear un cupón en un plan sin promociones lo frena la base, con su
 * pista (`plan_sin_promociones`).
 */

export type EstadoDeCrecimiento = Respuesta & {
  /** La base no dejó borrar el premio: alguien lo canjeó (D6). Se ofrece pausarlo. */
  canjeado?: boolean;
};

type ErroresDeDisponibilidad = { dias: string; franja: string; franjaAlReves: string };

/** Los días, la franja y los servicios del formulario, o el error. Las horas viajan como `09:00`. */
function leerDisponibilidad(datos: FormData, errores: ErroresDeDisponibilidad) {
  const dias = [...new Set(datos.getAll("dias").map(Number))].filter((d) => Number.isInteger(d) && d >= 1 && d <= 7).sort();
  const servicios = [...new Set(datos.getAll("servicios").map(Number))].filter((s) => Number.isInteger(s) && s > 0);
  const hora = (nombre: string) => (/^\d{2}:\d{2}$/.test(campo(datos, nombre)) ? campo(datos, nombre) : null);
  const horaInicio = hora("hora_inicio");
  const horaFin = hora("hora_fin");
  if (dias.length === 0) return { error: errores.dias } as const;
  if ((horaInicio === null) !== (horaFin === null)) return { error: errores.franja } as const;
  if (horaInicio !== null && horaFin !== null && horaInicio >= horaFin) return { error: errores.franjaAlReves } as const;
  return { error: null, dias, servicios, horaInicio, horaFin } as const;
}

/** Un número escrito como en la app: con coma o con punto. `NaN` si no es uno. */
const numeroDe = (texto: string) => (texto === "" ? Number.NaN : Number(texto.replace(",", ".")));

const fecha = z.iso.date();

/** Crea un cupón o guarda los cambios de uno, y vuelve a la lista. Editar no lo pausa ni lo activa. */
export async function guardarCupon(_: EstadoDeCrecimiento, datos: FormData): Promise<EstadoDeCrecimiento> {
  const { errores } = miLocal.cupon;

  const faltan = (["nombre", "codigo", "valor", "desde", "hasta"] as const)
    .filter((c) => !campo(datos, c))
    .map((c) => errores.campos[c]);
  if (faltan.length) return { error: errores.faltan(faltan) };

  const tipo = campo(datos, "tipo") === "monto" ? "monto" : "porcentaje";
  const valor = numeroDe(campo(datos, "valor"));
  if (!(valor > 0)) return { error: errores.valor };
  if (tipo === "porcentaje" && valor > 100) return { error: errores.porcentaje };

  const limite = campo(datos, "limite") ? numeroDe(campo(datos, "limite")) : null;
  if (limite !== null && !(Number.isInteger(limite) && limite > 0)) return { error: errores.limite };

  const desde = fecha.safeParse(campo(datos, "desde"));
  const hasta = fecha.safeParse(campo(datos, "hasta"));
  if (!desde.success || !hasta.success) return { error: errores.generico };
  if (desde.data > hasta.data) return { error: errores.fechas };

  const disponibilidad = leerDisponibilidad(datos, errores);
  if (disponibilidad.error !== null) return { error: disponibilidad.error };

  const id = campo(datos, "id") ? z.coerce.number().int().positive().safeParse(campo(datos, "id")) : null;
  if (id && !id.success) return { error: errores.generico };

  const { local, error: noPuede } = await localParaActuar();
  if (noPuede !== null) return { error: noPuede };

  const fila = {
    nombre: campo(datos, "nombre").slice(0, 100),
    codigo: campo(datos, "codigo").toUpperCase().slice(0, 50),
    fecha_inicio: desde.data,
    fecha_fin: hasta.data,
    // La forma que lee `_cotizar_turno`: los servicios como texto, sin las horas si no hay franja.
    reglas_json: {
      tipo_descuento: tipo,
      valor_descuento: valor,
      limite_usos_total: limite,
      dias_validos: disponibilidad.dias,
      servicios_aplica: disponibilidad.servicios.map(String),
      ...(disponibilidad.horaInicio && { hora_inicio: disponibilidad.horaInicio, hora_fin: disponibilidad.horaFin }),
    },
  };
  const supabase = await clienteDeSupabase("local");
  const { data, error } = id
    ? await supabase.from("promociones").update(fila).eq("id_promocion", id.data).eq("id_comercio", local.id).select("id_promocion")
    : await supabase
        .from("promociones")
        .insert({ ...fila, id_comercio: local.id, id_tipo_promocion: 1, esta_activo: true })
        .select("id_promocion");
  if (error?.code === "23505") return { error: errores.codigoRepetido };
  if (error) return errorDe(error, errores.generico, "guardar-cupon");
  if (!data?.length) {
    console.error("mi-local/guardar-cupon: ninguna fila", id?.data);
    return { error: errores.generico };
  }

  redirect("/mi-local/crecimiento/cupones");
}

/** Pausa o activa un cupón, como el menú de su tarjeta en la app. */
export async function cambiarEstadoDeCupon(_: EstadoDeCrecimiento, datos: FormData): Promise<EstadoDeCrecimiento> {
  const { generico } = miLocal.cupon.estado;
  const id = z.coerce.number().int().positive().safeParse(datos.get("id"));
  if (!id.success) return { error: generico };
  const { local, error: noPuede } = await localParaActuar();
  if (noPuede !== null) return { error: noPuede };

  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("promociones")
    .update({ esta_activo: datos.get("activo") === "1" })
    .eq("id_promocion", id.data)
    .eq("id_comercio", local.id)
    .select("id_promocion");
  if (error) return errorDe(error, generico, "estado-de-cupon");
  if (!data?.length) return { error: generico };

  refresh();
  return { error: null, listo: true };
}

/** Borra un cupón: los clientes que guardaron el código lo pierden, como avisa la app. */
export async function eliminarCupon(_: EstadoDeCrecimiento, datos: FormData): Promise<EstadoDeCrecimiento> {
  const { generico } = miLocal.cupon.baja;
  const id = z.coerce.number().int().positive().safeParse(datos.get("id"));
  if (!id.success) return { error: generico };
  const { local, error: noPuede } = await localParaActuar();
  if (noPuede !== null) return { error: noPuede };

  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("promociones")
    .delete()
    .eq("id_promocion", id.data)
    .eq("id_comercio", local.id)
    .select("id_promocion");
  if (error) return errorDe(error, generico, "eliminar-cupon");
  if (!data?.length) return { error: generico };

  redirect("/mi-local/crecimiento/cupones");
}

/** Prende o apaga el programa de puntos del local: `comercios.habilita_puntos`, como el interruptor de la app. */
export async function cambiarPrograma(_: EstadoDeCrecimiento, datos: FormData): Promise<EstadoDeCrecimiento> {
  const { generico } = miLocal.recompensas.programa;
  const { local, error: noPuede } = await localParaActuar();
  if (noPuede !== null) return { error: noPuede };

  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("comercios")
    .update({ habilita_puntos: datos.get("valor") === "1" })
    .eq("id_comercio", local.id)
    .select("id_comercio");
  if (error || !data?.length) {
    console.error("mi-local/programa-de-puntos:", error?.code ?? "ninguna fila", error?.message ?? local.id);
    return { error: generico };
  }

  refresh();
  return { error: null };
}

/** Crea un premio o guarda los cambios de uno, y vuelve a la lista. Editar no reactiva uno pausado, como la app. */
export async function guardarPremio(_: EstadoDeCrecimiento, datos: FormData): Promise<EstadoDeCrecimiento> {
  const { errores } = miLocal.premio;

  const pedido = campo(datos, "tipo");
  const tipo = pedido === "porcentaje" || pedido === "monto" ? pedido : "gratis";
  const faltan = [
    !campo(datos, "titulo") && errores.campos.titulo,
    tipo !== "gratis" && !campo(datos, "valor") && errores.campos.valor,
    !campo(datos, "puntos") && errores.campos.puntos,
  ].filter((c): c is string => Boolean(c));
  if (faltan.length) return { error: errores.faltan(faltan) };

  const valor = tipo === "gratis" ? 0 : numeroDe(campo(datos, "valor"));
  if (tipo !== "gratis" && !(valor > 0)) return { error: errores.valor };
  if (tipo === "porcentaje" && valor > 100) return { error: errores.porcentaje };

  const puntos = numeroDe(campo(datos, "puntos"));
  if (!(Number.isInteger(puntos) && puntos > 0)) return { error: errores.puntos };
  const visitas = campo(datos, "visitas") ? numeroDe(campo(datos, "visitas")) : 0;
  if (!(Number.isInteger(visitas) && visitas >= 0)) return { error: errores.visitas };

  const disponibilidad = leerDisponibilidad(datos, errores);
  if (disponibilidad.error !== null) return { error: disponibilidad.error };

  const id = campo(datos, "id") ? z.uuid().safeParse(campo(datos, "id")) : null;
  if (id && !id.success) return { error: errores.generico };

  const { local, error: noPuede } = await localParaActuar();
  if (noPuede !== null) return { error: noPuede };

  const fila = {
    titulo: campo(datos, "titulo").slice(0, 100),
    descripcion: campo(datos, "descripcion").slice(0, 120) || null,
    costo_puntos: puntos,
    turnos_minimos_requeridos: visitas,
    tipo_beneficio: tipo,
    valor_beneficio: valor,
    // Sin servicios es todos, y en la tabla eso es `null`, como la app.
    id_servicios: disponibilidad.servicios.length ? disponibilidad.servicios : null,
    dias_validos: disponibilidad.dias,
    hora_inicio: disponibilidad.horaInicio,
    hora_fin: disponibilidad.horaFin,
  };
  const supabase = await clienteDeSupabase("local");
  const { data, error } = id
    ? await supabase
        .from("recompensas_comercios")
        .update(fila)
        .eq("id_recompensa", id.data)
        .eq("id_comercio", local.id)
        .select("id_recompensa")
    : await supabase
        .from("recompensas_comercios")
        .insert({ ...fila, id_comercio: local.id, esta_activa: true })
        .select("id_recompensa");
  if (error) return errorDe(error, errores.generico, "guardar-premio");
  if (!data?.length) {
    console.error("mi-local/guardar-premio: ninguna fila", id?.data);
    return { error: errores.generico };
  }

  redirect("/mi-local/crecimiento/recompensas");
}

/** Pausa o activa un premio: deja de aparecer en el catálogo, o vuelve. */
export async function cambiarEstadoDePremio(_: EstadoDeCrecimiento, datos: FormData): Promise<EstadoDeCrecimiento> {
  const { generico } = miLocal.premio.estado;
  const id = z.uuid().safeParse(datos.get("id"));
  if (!id.success) return { error: generico };
  const { local, error: noPuede } = await localParaActuar();
  if (noPuede !== null) return { error: noPuede };

  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("recompensas_comercios")
    .update({ esta_activa: datos.get("activo") === "1" })
    .eq("id_recompensa", id.data)
    .eq("id_comercio", local.id)
    .select("id_recompensa");
  if (error) return errorDe(error, generico, "estado-de-premio");
  if (!data?.length) return { error: generico };

  refresh();
  return { error: null, listo: true };
}

/**
 * Borra un premio. Si alguien lo canjeó, la base no deja (`23503`, D6): sus
 * canjes son de los clientes. Entonces se dice y se ofrece pausarlo.
 */
export async function eliminarPremio(_: EstadoDeCrecimiento, datos: FormData): Promise<EstadoDeCrecimiento> {
  const { generico, canjeado } = miLocal.premio.baja;
  const id = z.uuid().safeParse(datos.get("id"));
  if (!id.success) return { error: generico };
  const { local, error: noPuede } = await localParaActuar();
  if (noPuede !== null) return { error: noPuede };

  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("recompensas_comercios")
    .delete()
    .eq("id_recompensa", id.data)
    .eq("id_comercio", local.id)
    .select("id_recompensa");
  if (error?.code === "23503") return { error: canjeado, canjeado: true };
  if (error) return errorDe(error, generico, "eliminar-premio");
  if (!data?.length) return { error: generico };

  redirect("/mi-local/crecimiento/recompensas");
}
