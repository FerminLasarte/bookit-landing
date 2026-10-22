"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { miLocal } from "@/content/mi-local";
import { FORMAS_DEL_PROFESIONAL } from "@/lib/encuadre";
import { campo } from "@/lib/formularios";
import { errorDe, localParaActuar, profesionalQueEdita } from "@/lib/mi-local/acciones";
import { cambiarFotoDelProfesional, guardarFoto } from "@/lib/mi-local/fotos";
import { leerMiCuenta, leerServiciosAsignados } from "@/lib/mi-local/gestion";
import type { Respuesta } from "@/lib/mi-local/respuesta";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * El equipo del local, con la sesión del dueño, como `BusinessTeamProvider` de
 * la app. Lo que el plan no incluye lo frena la base (el tope de
 * profesionales, las cuentas del equipo) y contesta con una frase y una pista:
 * la pantalla la muestra y, si se destraba con otro plan, ofrece /planes.
 * Desactivar cancela los turnos por venir, avisa y devuelve lo pagado: lo hace
 * `cambiar_actividad_profesional`, no esta acción.
 */

/** `verPlanes`: lo que se rechazó se destraba con otro plan. `listo`: se guardó y la pantalla sigue. */
export type EstadoDeEquipo = Respuesta;

/**
 * Suma un profesional. Sin cuenta, sólo con el nombre. Si es el dueño
 * ("Agregarme"), queda atado a su cuenta: la cuenta sale de la sesión, nunca
 * del formulario.
 */
export async function sumarProfesional(_: EstadoDeEquipo, datos: FormData): Promise<EstadoDeEquipo> {
  const { errores } = miLocal.sumar;
  const nombre = z.string().trim().min(1).max(80).safeParse(campo(datos, "nombre"));
  if (!nombre.success) return { error: errores.nombre };

  const { local, error: noPuede } = await localParaActuar();
  if (noPuede !== null) return { error: noPuede };
  const soyYo = datos.get("soy_yo") === "1";
  const cuenta = soyYo ? await leerMiCuenta().catch(() => null) : null;
  if (soyYo && !cuenta) return { error: errores.generico };

  const supabase = await clienteDeSupabase("local");
  const { error } = await supabase.from("profesionales").insert({
    id_comercio: local.id,
    nombre: nombre.data,
    esta_activo: true,
    ...(cuenta && { auth_user_id: cuenta.id }),
  });
  if (error) return errorDe(error, errores.generico, "sumar-profesional");

  redirect("/mi-local/equipo");
}

/** Invita por mail. El mail lo manda la base (`enviar_correo_invitacion`) con el link para sumarse. */
export async function invitar(_: EstadoDeEquipo, datos: FormData): Promise<EstadoDeEquipo> {
  const { errores } = miLocal.sumar;
  const email = z.email().max(200).safeParse(campo(datos, "email").toLowerCase());
  if (!email.success) return { error: errores.email };

  const { local, error: noPuede } = await localParaActuar();
  if (noPuede !== null) return { error: noPuede };

  const supabase = await clienteDeSupabase("local");
  const { error } = await supabase.from("invitaciones_equipo").insert({ id_comercio: local.id, email_invitado: email.data });
  // La única invitación pendiente por mail la cuida un índice único.
  if (error?.code === "23505") return { error: errores.invitacionRepetida };
  if (error) return errorDe(error, errores.generico, "invitar");

  redirect("/mi-local/equipo");
}

/** Reenvía una invitación vencida: la base la borra y la vuelve a crear, con su mail. */
export async function reenviarInvitacion(_: EstadoDeEquipo, datos: FormData): Promise<EstadoDeEquipo> {
  const { errores } = miLocal.equipo.invitaciones;
  const id = z.uuid().safeParse(datos.get("id"));
  if (!id.success) return { error: errores.reenviar };
  const { error: noPuede } = await localParaActuar();
  if (noPuede !== null) return { error: noPuede };

  const supabase = await clienteDeSupabase("local");
  const { error } = await supabase.rpc("reenviar_invitacion", { p_id_invitacion: id.data });
  if (error) return errorDe(error, errores.reenviar, "reenviar-invitacion");

  refresh();
  return { error: null };
}

/** Revoca una invitación: se borra, y el link deja de servir. */
export async function revocarInvitacion(_: EstadoDeEquipo, datos: FormData): Promise<EstadoDeEquipo> {
  const { errores } = miLocal.equipo.invitaciones;
  const id = z.uuid().safeParse(datos.get("id"));
  if (!id.success) return { error: errores.revocar };
  const { error: noPuede } = await localParaActuar();
  if (noPuede !== null) return { error: noPuede };

  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.from("invitaciones_equipo").delete().eq("id_invitacion", id.data).select("id_invitacion");
  if (error) return errorDe(error, errores.revocar, "revocar-invitacion");
  if (!data?.length) {
    console.error("mi-local/revocar-invitacion: ninguna fila", id.data);
    return { error: errores.revocar };
  }

  refresh();
  return { error: null };
}

/** Prende o apaga "Precios libres". El precio que vale lo arma la base con el switch y el plan. */
export async function cambiarPreciosLibres(_: EstadoDeEquipo, datos: FormData): Promise<EstadoDeEquipo> {
  const { error: generico } = miLocal.equipo.preciosLibres;
  const { local, error: noPuede } = await localParaActuar();
  if (noPuede !== null) return { error: noPuede };

  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("comercios")
    .update({ permitir_precios_profesionales: datos.get("valor") === "1" })
    .eq("id_comercio", local.id)
    .select("id_comercio");
  if (error || !data?.length) {
    console.error("mi-local/precios-libres:", error?.code ?? "ninguna fila", error?.message ?? local.id);
    return { error: generico };
  }

  refresh();
  return { error: null };
}

/**
 * Activa o desactiva a un profesional con `cambiar_actividad_profesional`.
 * Desactivar cancela sus turnos por venir, con su aviso y su devolución;
 * activar respeta el tope del plan.
 */
export async function cambiarActividad(_: EstadoDeEquipo, datos: FormData): Promise<EstadoDeEquipo> {
  const { errores } = miLocal.profesional;
  const id = z.uuid().safeParse(datos.get("id"));
  if (!id.success) return { error: errores.generico };
  const { error: noPuede } = await localParaActuar();
  if (noPuede !== null) return { error: noPuede };

  const supabase = await clienteDeSupabase("local");
  const { error } = await supabase.rpc("cambiar_actividad_profesional", {
    p_profesional: id.data,
    p_activo: datos.get("activo") === "1",
  });
  if (error) return errorDe(error, errores.generico, "cambiar-actividad");

  refresh();
  return { error: null };
}

/** Elige quiénes siguen dentro del tope del plan. A los que quedan afuera no se les cancela nada. */
export async function elegirQuienesSiguen(_: EstadoDeEquipo, datos: FormData): Promise<EstadoDeEquipo> {
  const { errores } = miLocal.quienesSiguen;
  const activos = z.array(z.uuid()).safeParse(datos.getAll("activos"));
  if (!activos.success) return { error: errores.generico };

  const { local, error: noPuede } = await localParaActuar();
  if (noPuede !== null) return { error: noPuede };

  const supabase = await clienteDeSupabase("local");
  const { error } = await supabase.rpc("elegir_profesionales_activos", { p_id_comercio: local.id, p_activos: activos.data });
  if (error) return errorDe(error, errores.generico, "quienes-siguen");

  redirect("/mi-local/equipo");
}

const datosDelProfesional = z.object({
  id: z.uuid(),
  nombre: z.string().trim().min(1).max(80),
  bio: z.string().trim().max(300),
});

/** Guarda el nombre y la presentación de un profesional que maneja el dueño. El profesional del equipo no tiene perfil en la web (D2 del plan del equipo). */
export async function guardarDatosDelProfesional(_: EstadoDeEquipo, datos: FormData): Promise<EstadoDeEquipo> {
  const { errores } = miLocal.profesional;
  const leido = datosDelProfesional.safeParse({ id: datos.get("id"), nombre: campo(datos, "nombre"), bio: campo(datos, "bio") });
  if (!leido.success) return { error: leido.error.issues[0]?.path[0] === "nombre" ? miLocal.sumar.errores.nombre : errores.generico };

  const permiso = await profesionalQueEdita(leido.data.id);
  if (permiso.error !== null) return { error: permiso.error };
  if (!permiso.delDuenio) return { error: miLocal.acceso.soloDuenio };
  if (!permiso.editable) return { error: errores.soloLectura };

  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("profesionales")
    .update({ nombre: leido.data.nombre, bio: leido.data.bio || null })
    .eq("id_profesional", leido.data.id)
    .select("id_profesional");
  if (error) return errorDe(error, errores.generico, "datos-del-profesional");
  if (!data?.length) return { error: errores.generico };

  refresh();
  return { error: null, listo: true };
}

/**
 * La foto de un profesional que maneja el dueño: la suya y la de los que no
 * tienen cuenta (D6 del plan de la fase 4). Los que tienen cuenta ponen la
 * suya desde "Mi perfil".
 */
export async function guardarFotoDelProfesional(_: EstadoDeEquipo, datos: FormData): Promise<EstadoDeEquipo> {
  const id = z.uuid().safeParse(datos.get("id"));
  if (!id.success) return { error: miLocal.encuadre.errores.subir };

  const permiso = await profesionalQueEdita(id.data);
  if (permiso.error !== null) return { error: permiso.error };
  if (!permiso.delDuenio) return { error: miLocal.acceso.soloDuenio };
  if (!permiso.editable) return { error: miLocal.profesional.errores.soloLectura };

  return guardarFoto(datos, FORMAS_DEL_PROFESIONAL, (recortes) => cambiarFotoDelProfesional(id.data, recortes.perfil), "foto-del-profesional");
}

const numeroOpcional = z.preprocess((v) => (v === "" || v === null ? null : v), z.coerce.number().finite().nullable());

/**
 * Guarda qué servicios hace un profesional y, si lo maneja el dueño, su precio
 * y su duración propios. Como la app: primero se suman los nuevos y después se
 * sacan los que ya no, así nunca queda sin ninguno a mitad de camino, y a los
 * que siguen no se les pierde el precio propio. El profesional del equipo
 * guarda su precio y su duración en los que ya tiene, y nada más: asignarse o
 * quitarse un servicio es del dueño (D3 del plan del equipo).
 */
export async function guardarServiciosDelProfesional(_: EstadoDeEquipo, datos: FormData): Promise<EstadoDeEquipo> {
  const { errores } = miLocal.profesional;
  const id = z.uuid().safeParse(datos.get("id"));
  const elegidos = z.array(z.coerce.number().int().positive()).safeParse(datos.getAll("servicios"));
  if (!id.success || !elegidos.success) return { error: errores.generico };

  const permiso = await profesionalQueEdita(id.data);
  if (permiso.error !== null) return { error: permiso.error };

  const conPrecio = datos.get("con_precio") === "1";
  const propios = elegidos.data.map((servicio) => ({
    servicio,
    duracion: numeroOpcional.safeParse(datos.get(`duracion_${servicio}`)),
    precio: numeroOpcional.safeParse(datos.get(`precio_${servicio}`)),
  }));
  if (propios.some((p) => !p.duracion.success || !p.precio.success)) return { error: errores.generico };

  const supabase = await clienteDeSupabase("local");
  const antes = await leerServiciosAsignados(id.data).catch(() => null);
  if (!antes) return { error: errores.generico };
  const yaEstaban = new Set(antes.map((a) => a.servicio));

  // Los que maneja el dueño se guardan enteros; a los que tienen cuenta sólo se les suman servicios.
  // El profesional guarda los suyos enteros, sólo los que ya tenía.
  const filas = permiso.editable
    ? propios
        .filter((p) => permiso.delDuenio || yaEstaban.has(p.servicio))
        .map((p) => ({
          id_profesional: id.data,
          id_servicio: p.servicio,
          duracion_personalizada: p.duracion.data ?? null,
          ...(conPrecio && { precio_personalizado: p.precio.data ?? null }),
        }))
    : elegidos.data.filter((s) => !yaEstaban.has(s)).map((s) => ({ id_profesional: id.data, id_servicio: s }));
  if (filas.length) {
    const { error } = await supabase.from("profesionales_servicios").upsert(filas, { onConflict: "id_profesional,id_servicio" });
    if (error) return errorDe(error, errores.generico, "servicios-del-profesional");
  }

  const sacados = permiso.delDuenio ? [...yaEstaban].filter((s) => !elegidos.data.includes(s)) : [];
  if (sacados.length) {
    const { error } = await supabase
      .from("profesionales_servicios")
      .delete()
      .eq("id_profesional", id.data)
      .in("id_servicio", sacados);
    if (error) return errorDe(error, errores.generico, "servicios-del-profesional");
  }

  refresh();
  return { error: null, listo: true };
}
