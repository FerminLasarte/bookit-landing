"use server";

import { refresh } from "next/cache";
import { acciones } from "@/content/admin";
import { errorDeAccion } from "@/lib/admin/acciones";
import { campo } from "@/lib/formularios";
import type { Respuesta } from "@/lib/mi-local/respuesta";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * Lo que el equipo cambia desde el panel, con su sesión. Cada función de la
 * base vuelve a mirar que sea del equipo, valida y deja su fila en el
 * registro en la misma transacción: acá no se repite ninguna regla.
 */

/** Cierra una incidencia de pago con lo que se hizo (D5: la nota es obligatoria). */
export async function resolverIncidencia(_: Respuesta, datos: FormData): Promise<Respuesta> {
  const { generico } = acciones.resolver;
  const idPago = campo(datos, "id_pago_mp");
  if (!idPago) return { error: generico };

  const supabase = await clienteDeSupabase("panel");
  const { error } = await supabase.rpc("admin_resolver_incidencia", {
    p_id_pago_mp: idPago,
    p_nota: campo(datos, "nota"),
  });
  if (error) return { error: errorDeAccion(error, generico, "resolver-incidencia") };

  refresh();
  return { error: null };
}

/** Corre el vencimiento de un local en prueba (D6: lo único que el panel toca de la suscripción). */
export async function extenderPrueba(_: Respuesta, datos: FormData): Promise<Respuesta> {
  const { generico } = acciones.extender;
  const idComercio = campo(datos, "id_comercio");
  if (!idComercio) return { error: generico };

  const supabase = await clienteDeSupabase("panel");
  const { error } = await supabase.rpc("admin_extender_prueba", {
    p_id_comercio: idComercio,
    p_dias: Number(campo(datos, "dias")),
    p_nota: campo(datos, "nota") || null,
  });
  if (error) return { error: errorDeAccion(error, generico, "extender-prueba") };

  refresh();
  return { error: null };
}

/** `turnosPorDelante`: los pendientes y confirmados que no empezaron. Ocultar no los cancela. */
export type RespuestaDeVisibilidad = Respuesta & { visible?: boolean; turnosPorDelante?: number };

/** Oculta un local o lo vuelve a mostrar. El interruptor es del equipo: el local no lo ve. */
export async function cambiarVisibilidad(_: RespuestaDeVisibilidad, datos: FormData): Promise<RespuestaDeVisibilidad> {
  const { generico } = acciones.visibilidad;
  const idComercio = campo(datos, "id_comercio");
  const visible = campo(datos, "visible");
  if (!idComercio || (visible !== "true" && visible !== "false")) return { error: generico };

  const supabase = await clienteDeSupabase("panel");
  const { data, error } = await supabase.rpc("admin_cambiar_visibilidad", {
    p_id_comercio: idComercio,
    p_visible: visible === "true",
    p_nota: campo(datos, "nota") || null,
  });
  if (error) return { error: errorDeAccion(error, generico, "cambiar-visibilidad") };

  refresh();
  const { visible: quedo, turnos_por_delante } = data as { visible: boolean; turnos_por_delante: number };
  return { error: null, visible: quedo, turnosPorDelante: turnos_por_delante };
}
