"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { miLocal } from "@/content/mi-local";
import { campo } from "@/lib/formularios";
import { errorDe, profesionalQueEdita } from "@/lib/mi-local/acciones";
import { DIA_CERRADO, franjasDe, horaDe, minutosDe } from "@/lib/mi-local/horario";
import type { Respuesta } from "@/lib/mi-local/respuesta";
import { esClaveDeDia, sumarDias } from "@/lib/mi-local/vista";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * El horario de un profesional, con la sesión del dueño, como
 * `ScheduleProvider` de la app. Qué se puede guardar lo decide la base
 * (`guardar_dias_agenda` y `_excepciones_horas_validas`, BooKit
 * 20261022120000), que contesta con frases para personas: acá sólo se mira la
 * forma. Quién se edita, D2 del plan de la fase 3: lo del dueño y lo de los
 * profesionales sin cuenta.
 */

export type EstadoDeHorario = Respuesta;

const hora = z.string().regex(/^\d{2}:\d{2}$/);
const fecha = z.string().refine(esClaveDeDia);

/** Por qué el dueño no puede tocar el horario de este profesional, o `null` si puede. */
async function permiso(profesional: string): Promise<string | null> {
  const resultado = await profesionalQueEdita(profesional);
  if (resultado.error !== null) return resultado.error;
  return resultado.editable ? null : miLocal.horarios.soloLectura;
}

const dia = z.object({
  profesional: z.uuid(),
  dias: z.array(z.coerce.number().int().min(1).max(7)).min(1),
  /** Cerrado no lleva horas: el editor ni las muestra. */
  horario: z.object({ abre: hora, cierra: hora, descansos: z.array(z.object({ desde: hora, hasta: hora })) }).nullable(),
  modalidad: z.string(),
  intervalo: z.coerce.number().int(),
});

/**
 * Guarda un día y los que se repiten con él: `guardar_dias_agenda` borra esos
 * días y vuelve a insertar sus franjas en una sola transacción. Cerrado es sin
 * franjas.
 */
export async function guardarDias(_: EstadoDeHorario, datos: FormData): Promise<EstadoDeHorario> {
  const { errores } = miLocal.horarios.dia;
  const desdes = datos.getAll("descanso_desde").map(String);
  const hastas = datos.getAll("descanso_hasta").map(String);
  const abierto = datos.get("abierto") === "1";
  if (abierto && [...desdes, ...hastas].some((h) => !h)) return { error: errores.descanso };

  const leido = dia.safeParse({
    profesional: datos.get("profesional"),
    dias: datos.getAll("dias"),
    horario: abierto
      ? {
          abre: campo(datos, "abre"),
          cierra: campo(datos, "cierra"),
          descansos: desdes.map((desde, i) => ({ desde, hasta: hastas[i] })),
        }
      : null,
    modalidad: campo(datos, "modalidad"),
    intervalo: campo(datos, "intervalo"),
  });
  if (!leido.success) return { error: errores.generico };
  const d = leido.data;

  const noPuede = await permiso(d.profesional);
  if (noPuede) return { error: noPuede };

  const franjas = d.horario
    ? franjasDe({
        ...DIA_CERRADO,
        abierto: true,
        apertura: minutosDe(d.horario.abre),
        cierre: minutosDe(d.horario.cierra),
        descansos: d.horario.descansos.map((t) => ({ desde: minutosDe(t.desde), hasta: minutosDe(t.hasta) })),
      })
    : [];
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.rpc("guardar_dias_agenda", {
    p_profesional: d.profesional,
    p_dias: [...new Set(d.dias)],
    p_franjas: franjas.map((f) => ({ hora_inicio: horaDe(f.desde), hora_fin: horaDe(f.hasta) })),
    p_modalidad: d.modalidad,
    p_intervalo: d.intervalo,
  });
  if (error) return errorDe(error, errores.generico, "guardar-dias");
  // Un día abierto que no dejó filas no se guardó.
  if (franjas.length && !(data as unknown[] | null)?.length) {
    console.error("mi-local/guardar-dias: ninguna fila", d.profesional);
    return { error: errores.generico };
  }

  refresh();
  return { error: null, listo: true };
}

/** Lo más largo que se guarda de una vez: unas vacaciones (D8 del plan de la fase 3). */
const TOPE_DE_DIAS = 60;

const diaEspecial = z.object({
  id: z.coerce.number().int().positive().nullable(),
  profesional: z.uuid(),
  tipo: z.enum(["dia_libre", "bloqueo"]),
  del: fecha,
  al: fecha.nullable(),
  desde: hora.nullable(),
  hasta: hora.nullable(),
  motivo: z.string().trim().max(200),
});

/**
 * Crea o edita un día especial, como `ExcepcionSheet`: un día libre o unas
 * horas cerradas. Un día libre nuevo puede ir "del … al …" (D8): se guarda una
 * fila por día, como la app, y los turnos de esos días quedan como están.
 */
export async function guardarDiaEspecial(_: EstadoDeHorario, datos: FormData): Promise<EstadoDeHorario> {
  const { errores } = miLocal.horarios.especiales;
  if (!campo(datos, "del")) return { error: errores.fecha };
  const tipo = campo(datos, "tipo");
  if (tipo === "bloqueo" && (!campo(datos, "desde") || !campo(datos, "hasta"))) return { error: errores.horas };

  const leido = diaEspecial.safeParse({
    id: campo(datos, "id") || null,
    profesional: datos.get("profesional"),
    tipo,
    del: campo(datos, "del"),
    al: campo(datos, "al") || null,
    desde: campo(datos, "desde") || null,
    hasta: campo(datos, "hasta") || null,
    motivo: campo(datos, "motivo"),
  });
  if (!leido.success) return { error: errores.generico };
  const d = leido.data;

  // Un rango es sólo para un día libre nuevo: lo que se edita es una fila.
  const fechas = [d.del];
  if (d.tipo === "dia_libre" && !d.id && d.al && d.al !== d.del) {
    if (d.al < d.del) return { error: errores.rango };
    while (fechas.at(-1) !== d.al) {
      if (fechas.length === TOPE_DE_DIAS) return { error: errores.tope };
      fechas.push(sumarDias(fechas.at(-1) ?? d.del, 1));
    }
  }

  const noPuede = await permiso(d.profesional);
  if (noPuede) return { error: noPuede };

  const libre = d.tipo === "dia_libre";
  const fila = {
    modalidad: d.tipo,
    hora_inicio: libre ? null : d.desde,
    hora_fin: libre ? null : d.hasta,
    motivo: d.motivo || null,
  };
  const supabase = await clienteDeSupabase("local");
  const { data, error } = d.id
    ? await supabase
        .from("excepciones")
        .update({ ...fila, fecha: d.del })
        .eq("id_excepcion", d.id)
        .eq("id_profesional", d.profesional)
        .select("id_excepcion")
    : await supabase
        .from("excepciones")
        .insert(fechas.map((f) => ({ ...fila, fecha: f, id_profesional: d.profesional })))
        .select("id_excepcion");
  if (error) return errorDe(error, errores.generico, "guardar-dia-especial");
  if (!data?.length) {
    console.error("mi-local/guardar-dia-especial: ninguna fila", d.id ?? d.profesional);
    return { error: errores.generico };
  }

  refresh();
  return { error: null, listo: true };
}

/** Borra un día especial: ese día vuelve al horario habitual. */
export async function eliminarDiaEspecial(_: EstadoDeHorario, datos: FormData): Promise<EstadoDeHorario> {
  const { errores } = miLocal.horarios.especiales;
  const id = z.coerce.number().int().positive().safeParse(datos.get("id"));
  const profesional = z.uuid().safeParse(datos.get("profesional"));
  if (!id.success || !profesional.success) return { error: errores.eliminar };

  const noPuede = await permiso(profesional.data);
  if (noPuede) return { error: noPuede };

  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("excepciones")
    .delete()
    .eq("id_excepcion", id.data)
    .eq("id_profesional", profesional.data)
    .select("id_excepcion");
  if (error) return errorDe(error, errores.eliminar, "eliminar-dia-especial");
  if (!data?.length) {
    console.error("mi-local/eliminar-dia-especial: ninguna fila", id.data);
    return { error: errores.eliminar };
  }

  refresh();
  return { error: null, listo: true };
}
