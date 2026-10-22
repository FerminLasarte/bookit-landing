"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { miLocal } from "@/content/mi-local";
import { lugarParaActuar } from "@/lib/mi-local/acciones";
import { ACCIONES_DE_TURNO, FUERA_DE_HORARIO, type AccionDeTurno, type FueraDeHorario } from "@/lib/mi-local/turnos";
import { enBuenosAires, enlaceDeVista, esClaveDeDia } from "@/lib/mi-local/vista";
import { clienteDeSupabase } from "@/lib/supabase";
import { mensajeDeLaBase } from "@/lib/mi-local/errores";

/*
 * Lo que la agenda del local le pide al servidor. Escribe siempre con la sesión
 * de quien entra, el dueño o un profesional del equipo: con otro rol no corre
 * `_turnos_quien_cambia_el_estado`, y `notificar_turno` no sabe que fue el
 * local (docs/PLAN-MI-LOCAL-FASE-2.md). Al profesional, la base lo deja sobre
 * sus turnos y nada más.
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

  const { error: noPuede } = await lugarParaActuar();
  if (noPuede !== null) return { error: noPuede };

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

/** `fueraDeHorario`: la base no lo cargó porque cae fuera de la agenda; se pregunta y se reintenta con `forzar`. */
export type EstadoDeCarga = { error: string | null; fueraDeHorario: FueraDeHorario | null };

const carga = z.object({
  dia: z.string().refine(esClaveDeDia),
  profesional: z.uuid(),
  servicio: z.coerce.number().int().positive(),
  inicio: z.iso.datetime({ offset: true }),
  nombre: z.string().trim().max(80),
  telefono: z.string().trim().max(30),
});

/** "Otra hora": un cuarto de hora entre las 06:00 y las 23:45, como en la app. */
const otraHora = z.string().regex(/^(0[6-9]|1\d|2[0-3]):(00|15|30|45)$/);

/**
 * Carga un turno a mano con `crear_turno_manual`, la misma función que la app.
 * El fin lo pone la base, con la duración del servicio para ese profesional
 * (BooKit 20261021220000). La base también controla que el profesional ofrezca
 * el servicio, que sea del local y que el horario no se pise con otro; si sale
 * bien, vuelve a la agenda de ese día.
 *
 * Si el horario cae fuera de la agenda del profesional, la base no lo carga y
 * dice por qué (BooKit, docs/turno-manual-fuera-de-horario.md). La web
 * pregunta, y con "Cargar igual" vuelve acá con `forzar`. Lo que se pisa con
 * otro turno no se puede forzar.
 */
export async function cargarTurno(_: EstadoDeCarga, datos: FormData): Promise<EstadoDeCarga> {
  const { errores } = miLocal.nuevo;
  const fallo = (error: string): EstadoDeCarga => ({ error, fueraDeHorario: null });
  const campo = (nombre: string) => String(datos.get(nombre) ?? "");

  // El horario es uno de los libres, que llega como momento, u "otra" con la hora aparte.
  const elegido = campo("inicio");
  if (!elegido) return fallo(errores.horario);
  let inicio = elegido;
  if (elegido === "otra") {
    const hora = otraHora.safeParse(campo("hora"));
    if (!hora.success || !esClaveDeDia(campo("dia"))) return fallo(errores.hora);
    inicio = enBuenosAires(campo("dia"), hora.data).toISOString();
  }

  const leido = carga.safeParse({
    dia: campo("dia"),
    profesional: campo("profesional"),
    servicio: campo("servicio"),
    inicio,
    nombre: campo("nombre"),
    telefono: campo("telefono"),
  });
  if (!leido.success) return fallo(errores.generico);
  const d = leido.data;

  const { lugar, error: noPuede } = await lugarParaActuar();
  if (noPuede !== null) return fallo(noPuede);
  // El profesional del equipo se carga turnos a sí mismo, como en la app.
  if (lugar.rol === "profesional" && d.profesional !== lugar.idProfesional) return fallo(errores.generico);

  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.rpc("crear_turno_manual", {
    p_profesional_id: d.profesional,
    p_servicio_id: d.servicio,
    p_inicio: new Date(d.inicio).toISOString(),
    p_cliente_nombre: d.nombre || null,
    p_cliente_telefono: d.telefono || null,
    p_forzar: campo("forzar") === "1",
  });
  if (error) {
    console.error("mi-local/cargar-turno:", error.code, error.message);
    return fallo(errores.generico);
  }
  const respuesta = data as { success?: boolean; message?: string; code?: string; motivo?: string } | null;
  if (respuesta?.code === "fuera_de_horario") {
    const motivo = FUERA_DE_HORARIO.find((m) => m === respuesta.motivo);
    // Un motivo que la web no conoce se lee como el resto de los errores: el mensaje de la base.
    if (motivo) return { error: null, fueraDeHorario: motivo };
  }
  // Lo que contesta la función ya es para personas ("El horario se solapa con otro turno",
  // "Este profesional no ofrece ese servicio."), D7.
  if (!respuesta?.success) return fallo(respuesta?.message || errores.generico);

  redirect(enlaceDeVista({ dia: d.dia, profesional: null, estado: null }));
}
