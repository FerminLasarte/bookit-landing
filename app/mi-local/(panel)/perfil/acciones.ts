"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { miLocal } from "@/content/mi-local";
import { leerDatosDelLocal, type CampoDelLocal } from "@/lib/alta";
import { FORMAS_DEL_LOCAL, FORMAS_DEL_PROFESIONAL } from "@/lib/encuadre";
import { campo } from "@/lib/formularios";
import { errorDe, localParaActuar, lugarParaActuar } from "@/lib/mi-local/acciones";
import { cambiarFotoDelLocal, cambiarFotoDelProfesional, guardarFoto } from "@/lib/mi-local/fotos";
import { leerCategoriasDelLocal } from "@/lib/mi-local/perfil";
import type { Respuesta } from "@/lib/mi-local/respuesta";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * El perfil del local, con la sesión del dueño, como "Información del negocio"
 * de la app: un `update` a `comercios` con lo que se puede escribir (grants por
 * columna). Las categorías —la principal y hasta 2 más— viven en dos lugares
 * y las guarda la base, con `guardar_categorias_de_mi_local` (BooKit
 * 20261029140000_varias_categorias), sólo si cambiaron. "Sobre el local"
 * (`descripcion`) va en el mismo `update`; el tope de 300 lo cuida la base
 * (20261029160000_descripcion_del_local). El profesional
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
  // El navegador cuenta un salto de línea como uno; el formulario lo manda como `\r\n`.
  const descripcion = campo(datos, "descripcion").replaceAll("\r\n", "\n") || null;

  // Las otras categorías, sin repetir ni la principal. El tope lo cuida la base.
  const pedidas = z.array(z.coerce.number().int().positive()).safeParse(datos.getAll("otras"));
  if (!pedidas.success) return { error: errores.generico };
  const otras = [...new Set(pedidas.data)].filter((id) => id !== categoria);

  const supabase = await clienteDeSupabase("local");
  const { data, error: alGuardar } = await supabase
    .from("comercios")
    .update({
      nombre,
      instagram,
      descripcion,
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

  const principalDeAhora = data[0]!.id_categoria as number | null;
  const deAhora = await leerCategoriasDelLocal(local.id).catch((error: unknown) => {
    console.error("mi-local/perfil-categorias:", error);
    return null;
  });
  if (!deAhora) return { error: errores.generico };
  const otrasDeAhora = deAhora.filter((id) => id !== principalDeAhora);

  const cambiaron =
    principalDeAhora !== categoria || otras.length !== otrasDeAhora.length || otras.some((id) => !otrasDeAhora.includes(id));
  if (cambiaron) {
    const { error: alCambiar } = await supabase.rpc("guardar_categorias_de_mi_local", { p_principal: categoria, p_otras: otras });
    if (alCambiar) return errorDe(alCambiar, errores.generico, "perfil-categorias");
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
