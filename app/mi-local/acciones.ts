"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { miLocal } from "@/content/mi-local";
import { daAcceso, leerMiLocal } from "@/lib/mi-local/agenda";
import { ACCIONES_DE_TURNO, type AccionDeTurno } from "@/lib/mi-local/turnos";
import { enlaceDeVista, esClaveDeDia } from "@/lib/mi-local/vista";
import { clienteDeSupabase } from "@/lib/supabase";
import { mensajeDeLaBase } from "@/lib/mi-local/errores";

/*
 * Lo que la agenda del local le pide al servidor. Escribe siempre con la sesión
 * del dueño: con otro rol no corre `_turnos_quien_cambia_el_estado`, y
 * `notificar_turno` no sabe que fue el local (docs/PLAN-MI-LOCAL-FASE-2.md).
 * La devolución de Mercado Pago, los puntos, el cupón y los avisos los
 * disparan los triggers de `turnos`: acá no se llama a nada más.
 */

export type ResultadoDeCambio = { error: string | null };

const cambio = z.object({ idTurno: z.uuid(), estado: z.enum(ACCIONES_DE_TURNO) });

/** Completa, marca ausente o cancela un turno del local. */
export async function cambiarEstado(idTurno: string, estado: AccionDeTurno): Promise<ResultadoDeCambio> {
  const { errores } = miLocal.ficha;
  const leido = cambio.safeParse({ idTurno, estado });
  if (!leido.success) return { error: errores.generico };

  const local = await leerMiLocal();
  if (!daAcceso(local.suscripcion.estado)) return { error: errores.sinAcceso };

  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("turnos")
    .update({ estado: leido.data.estado })
    .eq("id_turno", leido.data.idTurno)
    .select("id_turno");
  if (error) {
    const delTrigger = mensajeDeLaBase(error);
    if (!delTrigger) console.error("mi-local/cambiar-estado:", error.code, error.message);
    return { error: delTrigger ?? errores.generico };
  }
  // Un turno que la política no deja ver no da error: el update no toca nada.
  if (!data?.length) {
    console.error("mi-local/cambiar-estado: ninguna fila", leido.data.idTurno);
    return { error: errores.generico };
  }

  refresh();
  return { error: null };
}

export type EstadoDeCarga = { error: string | null };

const carga = z.object({
  dia: z.string().refine(esClaveDeDia),
  profesional: z.uuid(),
  servicio: z.coerce.number().int().positive(),
  inicio: z.iso.datetime({ offset: true }),
  nombre: z.string().trim().max(80),
  telefono: z.string().trim().max(30),
});

/**
 * Carga un turno a mano con `crear_turno_manual`, la misma función que la app.
 * El fin lo pone la base, con la duración del servicio para ese profesional
 * (BooKit 20261021220000). La base también controla que el profesional ofrezca
 * el servicio, que sea del local y que el horario no se pise con otro; si sale
 * bien, vuelve a la agenda de ese día.
 */
export async function cargarTurno(_: EstadoDeCarga, datos: FormData): Promise<EstadoDeCarga> {
  const { errores } = miLocal.nuevo;
  const campo = (nombre: string) => String(datos.get(nombre) ?? "");
  if (!campo("inicio")) return { error: errores.horario };
  const leido = carga.safeParse({
    dia: campo("dia"),
    profesional: campo("profesional"),
    servicio: campo("servicio"),
    inicio: campo("inicio"),
    nombre: campo("nombre"),
    telefono: campo("telefono"),
  });
  if (!leido.success) return { error: errores.generico };
  const d = leido.data;

  const local = await leerMiLocal();
  if (!daAcceso(local.suscripcion.estado)) return { error: errores.sinAcceso };

  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.rpc("crear_turno_manual", {
    p_profesional_id: d.profesional,
    p_servicio_id: d.servicio,
    p_inicio: new Date(d.inicio).toISOString(),
    p_cliente_nombre: d.nombre || null,
    p_cliente_telefono: d.telefono || null,
  });
  if (error) {
    console.error("mi-local/cargar-turno:", error.code, error.message);
    return { error: errores.generico };
  }
  // Lo que contesta la función ya es para personas ("El horario se solapa con otro turno",
  // "Este profesional no ofrece ese servicio."), D7.
  const respuesta = data as { success?: boolean; message?: string } | null;
  if (!respuesta?.success) return { error: respuesta?.message || errores.generico };

  redirect(enlaceDeVista({ dia: d.dia, profesional: null, estado: null }));
}
