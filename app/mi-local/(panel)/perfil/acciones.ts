"use server";

import { refresh } from "next/cache";
import { miLocal } from "@/content/mi-local";
import { leerDatosDelLocal, type CampoDelLocal } from "@/lib/alta";
import { errorDe, localParaActuar } from "@/lib/mi-local/acciones";
import type { Respuesta } from "@/lib/mi-local/respuesta";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * El perfil del local, con la sesión del dueño, como "Información del negocio"
 * de la app: un `update` a `comercios` con lo que se puede escribir (grants por
 * columna). La categoría vive en dos lugares y la cambia la base, con
 * `cambiar_categoria_de_mi_local` (D3 del plan de la fase 4).
 */

/** `errores`: el de cada campo, como en el alta. */
export type EstadoDelPerfil = Respuesta & { errores?: Partial<Record<CampoDelLocal, string>> };

export async function guardarPerfil(_: EstadoDelPerfil, datos: FormData): Promise<EstadoDelPerfil> {
  const { errores } = miLocal.perfil;
  const { local, error } = await localParaActuar();
  if (error !== null) return { error };

  // La dirección viaja sólo si se eligió una nueva.
  const leido = leerDatosDelLocal(datos, { ubicacion: "si-viene" });
  if (leido.errores) return { error: null, errores: leido.errores };
  const { nombre, categoria, instagram, ubicacion } = leido.datos;

  const supabase = await clienteDeSupabase("local");
  const { data, error: alGuardar } = await supabase
    .from("comercios")
    .update({
      nombre,
      instagram,
      ...(ubicacion && {
        direccion: ubicacion.direccion,
        localidad_id: ubicacion.localidad,
        // Como la app (`BusinessProfileRepository.updateBusinessInfo`).
        ubicacion: `POINT(${ubicacion.lng} ${ubicacion.lat})`,
      }),
    })
    .eq("id_comercio", local.id)
    .select("id_categoria");
  if (alGuardar) return errorDe(alGuardar, errores.generico, "perfil");
  if (!data?.length) return { error: errores.generico };

  if (data[0]!.id_categoria !== categoria) {
    const { error: alCambiar } = await supabase.rpc("cambiar_categoria_de_mi_local", { p_id_categoria: categoria });
    if (alCambiar) return errorDe(alCambiar, errores.generico, "perfil-categoria");
  }

  refresh();
  return { error: null, listo: true };
}
