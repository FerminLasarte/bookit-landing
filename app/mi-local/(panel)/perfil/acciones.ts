"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { miLocal } from "@/content/mi-local";
import { leerDatosDelLocal, type CampoDelLocal } from "@/lib/alta";
import { FORMAS_DEL_LOCAL, FORMAS_DEL_PROFESIONAL } from "@/lib/encuadre";
import { campo } from "@/lib/formularios";
import { errorDe, localParaActuar, lugarParaActuar } from "@/lib/mi-local/acciones";
import { cambiarFotoDelLocal, cambiarFotoDelProfesional, guardarFoto } from "@/lib/mi-local/fotos";
import type { Respuesta } from "@/lib/mi-local/respuesta";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * El perfil del local, con la sesión del dueño, como "Información del negocio"
 * de la app: un `update` a `comercios` con lo que se puede escribir (grants por
 * columna). La categoría vive en dos lugares y la cambia la base, con
 * `cambiar_categoria_de_mi_local` (D3 del plan de la fase 4). El profesional
 * del equipo guarda acá su nombre y su foto en el local (D7).
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

/** La foto del local: el círculo y la portada, ya recortados en el navegador (D4 y D5). */
export async function guardarFotoDelLocal(_: Respuesta, datos: FormData): Promise<Respuesta> {
  const { local, error } = await localParaActuar();
  if (error !== null) return { error };

  return guardarFoto(datos, FORMAS_DEL_LOCAL, (recortes) => cambiarFotoDelLocal(local.id, recortes), "foto-del-local");
}

/** El profesional del equipo, en su lugar: si entra al local, su fila; si no, por qué. */
async function miFilaParaActuar(): Promise<{ id: string; error: null } | { id: null; error: string }> {
  const { lugar, error } = await lugarParaActuar();
  if (error !== null) return { id: null, error };
  return lugar.rol === "profesional" ? { id: lugar.idProfesional, error: null } : { id: null, error: miLocal.acceso.soloDuenio };
}

/** El nombre con el que lo ven los clientes en ese local, como "Nombre visible" de la app. */
export async function guardarMiNombre(_: Respuesta, datos: FormData): Promise<Respuesta> {
  const { errores } = miLocal.miPerfil;
  const { id, error } = await miFilaParaActuar();
  if (error !== null) return { error };

  const nombre = z.string().trim().min(1).max(80).safeParse(campo(datos, "nombre"));
  if (!nombre.success) return { error: errores.nombre };

  // Por `id_profesional`: quien trabaja en dos locales tiene una ficha en cada uno.
  const supabase = await clienteDeSupabase("local");
  const { data, error: alGuardar } = await supabase
    .from("profesionales")
    .update({ nombre: nombre.data })
    .eq("id_profesional", id)
    .select("id_profesional");
  if (alGuardar) return errorDe(alGuardar, errores.generico, "mi-nombre");
  if (!data?.length) return { error: errores.generico };

  refresh();
  return { error: null, listo: true };
}

/** Su foto en ese local, cuadrada. */
export async function guardarMiFoto(_: Respuesta, datos: FormData): Promise<Respuesta> {
  const { id, error } = await miFilaParaActuar();
  if (error !== null) return { error };

  return guardarFoto(datos, FORMAS_DEL_PROFESIONAL, (recortes) => cambiarFotoDelProfesional(id, recortes.perfil), "mi-foto");
}
