"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { miLocal } from "@/content/mi-local";
import { campo } from "@/lib/formularios";
import { errorDe, localParaActuar } from "@/lib/mi-local/acciones";
import { leerTurnosEnLaPausa } from "@/lib/mi-local/pausa";
import type { Respuesta } from "@/lib/mi-local/respuesta";
import { enlaceDeLaPausa, fechasDeLaPausa, type FechasPedidas } from "@/lib/pausa";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * Pausar el local, cambiarle las fechas o volver (docs/PLAN-MI-LOCAL-PAUSA.md),
 * con las funciones de la base (BooKit `docs/pausa-del-local.md`, sección 3).
 * La base controla que sea el dueño, las fechas y qué turnos cancela; acá se
 * mira antes, para dar el mensaje justo. Lo que se hizo vuelve a la página en
 * la URL: así se lee igual con JavaScript y sin él, y las fechas viejas no
 * quedan en el formulario.
 */

const PAGINA = "/mi-local/perfil/pausa";

/** Que la agenda, el cartel y el perfil se enteren. */
const alDia = () => revalidatePath("/mi-local", "layout");

export async function pausar(_: Respuesta, datos: FormData): Promise<Respuesta> {
  const copy = miLocal.pausa;
  const { local, error } = await localParaActuar();
  if (error !== null) return { error };

  const pedidas: FechasPedidas = { desde: campo(datos, "desde"), vuelta: campo(datos, "vuelta"), hasta: campo(datos, "hasta") };
  const fechas = fechasDeLaPausa(pedidas);
  if (!fechas) return { error: copy.errores.fechas };

  // La base cancela lo que hay al confirmar, no lo que se vio (D3): si la
  // lista cambió —entró un turno, o sin JavaScript se cambiaron las fechas sin
  // mirar—, no pausa y vuelve a mostrarla.
  const vistos = new Set(datos.getAll("visto").map(String));
  const ahora = await leerTurnosEnLaPausa(local.id, fechas.desde, fechas.hasta).catch((e: unknown) => {
    console.error("mi-local/pausa-turnos:", e);
    return null;
  });
  if (!ahora) return { error: copy.errores.generico };
  if (ahora.length !== vistos.size || ahora.some((t) => !vistos.has(t.id_turno))) {
    redirect(enlaceDeLaPausa(pedidas, { cambiaron: "1" }));
  }

  const supabase = await clienteDeSupabase("local");
  const { data, error: alPausar } = await supabase.rpc("pausar_mi_local", {
    p_comercio: local.id,
    p_desde: fechas.desde,
    p_hasta: fechas.hasta,
  });
  if (alPausar) return errorDe(alPausar, copy.errores.generico, "pausar");

  const cancelados = (data as { turnos_cancelados?: number } | null)?.turnos_cancelados ?? 0;
  alDia();
  if (cancelados > 0) redirect(`${PAGINA}?hecho=cancelados&n=${cancelados}`);
  redirect(`${PAGINA}?hecho=${campo(datos, "habia") === "1" ? "guardado" : "pausado"}`);
}

/** "Volver ahora", o "Sacar la pausa" si no empezó: la base decide cuál de las dos es. */
export async function volver(_: Respuesta, datos: FormData): Promise<Respuesta> {
  const { local, error } = await localParaActuar();
  if (error !== null) return { error };

  const supabase = await clienteDeSupabase("local");
  const { error: alVolver } = await supabase.rpc("terminar_pausa", { p_comercio: local.id });
  if (alVolver) return errorDe(alVolver, miLocal.pausa.errores.volver, "volver-de-la-pausa");

  alDia();
  redirect(`${PAGINA}?hecho=${campo(datos, "empezo") === "1" ? "volvio" : "saco"}`);
}
