"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { miLocal } from "@/content/mi-local";
import { ACCIONES_DE_TURNO, daAcceso, leerMiLocal, type AccionDeTurno } from "@/lib/mi-local/agenda";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * Lo que la agenda del local le pide al servidor. Escribe siempre con la sesión
 * del dueño: con otro rol no corre `_turnos_quien_cambia_el_estado`, y
 * `notificar_turno` no sabe que fue el local (docs/PLAN-MI-LOCAL-FASE-2.md).
 * La devolución de Mercado Pago, los puntos, el cupón y los avisos los
 * disparan los triggers de `turnos`: acá no se llama a nada más.
 */

export type ResultadoDeCambio = { error: string | null };

const cambio = z.object({ idTurno: z.uuid(), estado: z.enum(ACCIONES_DE_TURNO) });

/**
 * Lo que dice la base cuando rechaza un cambio. El trigger contesta con frases
 * para personas ("El turno todavía no empezó."), y la app las muestra tal cual
 * (D7). El `42501` de Postgres sin trigger ("permission denied for table…") no
 * es una de ellas.
 */
const mensajeDelTrigger = (error: { code: string; message: string }) =>
  error.code === "42501" && !error.message.startsWith("permission denied") ? error.message : null;

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
    const delTrigger = mensajeDelTrigger(error);
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
