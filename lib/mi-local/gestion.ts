import "server-only";
import type { Nivel } from "@/lib/planes";
import { minutosDe, type DiaEspecial, type Franja, type TipoDeDiaEspecial } from "@/lib/mi-local/horario";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * Lo que la gestión del local lee de Supabase, con la sesión del dueño: los
 * servicios, el equipo, los horarios y el plan (fase 3, docs/PLAN-MI-LOCAL-FASE-3.md). Las
 * mismas consultas que la app (BooKit, `BusinessServicesRepository` y
 * `BusinessTeamProvider`).
 */

export type TipoDeSena = "porcentaje" | "fijo";

export type Servicio = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion: number;
  /** Lo que se cobra de adelanto con Mercado Pago, o `null` si no pide seña. */
  sena: { tipo: TipoDeSena; valor: number } | null;
};

type FilaDeServicio = {
  id_servicio: number;
  nombre: string;
  descripcion: string | null;
  precio: number | null;
  duracion_minutos: number;
  requiere_sena: boolean;
  tipo_sena: string | null;
  valor_sena: number | null;
};

const columnas = "id_servicio, nombre, descripcion, precio, duracion_minutos, requiere_sena, tipo_sena, valor_sena";

const servicioDe = (fila: FilaDeServicio): Servicio => ({
  id: fila.id_servicio,
  nombre: fila.nombre,
  descripcion: fila.descripcion?.trim() || null,
  precio: fila.precio ?? 0,
  duracion: fila.duracion_minutos,
  // `Servicio.senaLegible` de la app: sin valor, no hay seña que mostrar.
  sena:
    fila.requiere_sena && (fila.valor_sena ?? 0) > 0
      ? { tipo: fila.tipo_sena === "porcentaje" ? "porcentaje" : "fijo", valor: fila.valor_sena ?? 0 }
      : null,
});

/** Los servicios activos del local, por nombre. Un dado de baja no se ve. */
export async function leerServicios(idComercio: string): Promise<Servicio[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("servicios")
    .select(columnas)
    .eq("id_comercio", idComercio)
    .eq("esta_activo", true)
    .order("nombre");
  if (error) throw new Error(`servicios: ${error.message}`);
  return (data as FilaDeServicio[]).map(servicioDe);
}

/** Un servicio activo del local, o `null` si no es suyo o se dio de baja. */
export async function leerServicio(idComercio: string, id: number): Promise<Servicio | null> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("servicios")
    .select(columnas)
    .eq("id_comercio", idComercio)
    .eq("id_servicio", id)
    .eq("esta_activo", true)
    .maybeSingle();
  if (error) throw new Error(`servicio: ${error.message}`);
  return data ? servicioDe(data as FilaDeServicio) : null;
}

/**
 * Cuántos turnos por venir tiene un servicio, para avisar antes de darlo de
 * baja (`contarTurnosReservados` de la app): pendientes o confirmados, desde
 * ahora. `null` si no se pudo contar: la baja se avisa igual, sin el número.
 */
export async function contarTurnosPorVenir(idServicio: number): Promise<number | null> {
  const supabase = await clienteDeSupabase("local");
  const { count, error } = await supabase
    .from("turnos")
    .select("id_turno", { count: "exact", head: true })
    .eq("id_servicio", idServicio)
    .in("estado", ["pendiente", "confirmado"])
    .gte("fecha_hora_inicio", new Date().toISOString());
  if (error) {
    console.error("mi-local/turnos-por-venir:", error.code, error.message);
    return null;
  }
  return count ?? 0;
}

/** Si el plan del local incluye algo y, si no, el primer nivel que lo incluye, para decir "Disponible en Pro" como la app. */
export type Incluye = { incluida: boolean; desde: string | null };

export type PlanDelLocal = {
  /** Cuántos profesionales activos entran, o `null` sin tope. */
  tope: number | null;
  /** Cobrar seña con Mercado Pago. La base no la frena en el servicio: la frena al cobrar. */
  cobroMp: Incluye;
  /** Invitar al equipo con su cuenta. */
  cuentasStaff: Incluye;
  /** El precio propio de cada profesional. */
  preciosPorProfesional: Incluye;
  /** Los meses anteriores de los números; sin esto, sólo el mes en curso. Lo frena la app, no la base (D4 de la fase 5). */
  estadisticasHistorial: Incluye;
};

type FilaDeNivel = {
  id: Nivel;
  rotulo: string;
  tope_profesionales: number | null;
  cobro_mp: boolean;
  cuentas_staff: boolean;
  precios_por_profesional: boolean;
  estadisticas_historial: boolean;
};

/**
 * Lo que incluye el plan del local, de `niveles`, como `PlanDelLocal` de la
 * app. Sirve para mostrar lo bloqueado; lo que decide es la base, que rechaza
 * con una pista (`tope_profesionales`, `plan_sin_staff`). Sin saber el plan,
 * nada se ofrece: es lo que hace la app con un plan que no lo incluye.
 */
export async function leerPlanDelLocal(nivel: Nivel | null): Promise<PlanDelLocal> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("niveles")
    .select("id, rotulo, tope_profesionales, cobro_mp, cuentas_staff, precios_por_profesional, estadisticas_historial")
    .order("orden");
  const niveles = (data ?? []) as FilaDeNivel[];
  if (error) console.error("mi-local/niveles:", error.code, error.message);
  const propio = niveles.find((n) => n.id === nivel);
  const incluye = (funcion: "cobro_mp" | "cuentas_staff" | "precios_por_profesional" | "estadisticas_historial"): Incluye => ({
    incluida: Boolean(propio?.[funcion]),
    desde: niveles.find((n) => n[funcion])?.rotulo ?? null,
  });
  return {
    tope: propio?.tope_profesionales ?? null,
    cobroMp: incluye("cobro_mp"),
    cuentasStaff: incluye("cuentas_staff"),
    preciosPorProfesional: incluye("precios_por_profesional"),
    estadisticasHistorial: incluye("estadisticas_historial"),
  };
}

/** Quién está usando el panel: el id de su cuenta, el nombre con el que se registró y su mail. */
export async function leerMiCuenta(): Promise<{ id: string; nombre: string | null; email: string | null }> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) throw new Error(`cuenta: ${error?.message ?? "sin sesión"}`);
  const metadatos = data.claims.user_metadata as { nombre?: string } | undefined;
  return { id: data.claims.sub, nombre: metadatos?.nombre?.trim() || null, email: data.claims.email ?? null };
}

export type Miembro = {
  id: string;
  nombre: string;
  bio: string | null;
  foto: string | null;
  /** El mail de su cuenta, si la tiene y la base deja verlo. */
  email: string | null;
  activo: boolean;
  conCuenta: boolean;
  /** Es el dueño, que también atiende. */
  esDuenio: boolean;
};

type FilaDeMiembro = {
  id_profesional: string;
  nombre: string | null;
  bio: string | null;
  foto_url: string | null;
  esta_activo: boolean;
  auth_user_id: string | null;
  profesionales_contacto: { email: string | null } | { email: string | null }[] | null;
};

const columnasDeMiembro = "id_profesional, nombre, bio, foto_url, esta_activo, auth_user_id, profesionales_contacto(email)";

const miembroDe = (fila: FilaDeMiembro, miId: string): Miembro => {
  const contacto = Array.isArray(fila.profesionales_contacto) ? fila.profesionales_contacto[0] : fila.profesionales_contacto;
  return {
    id: String(fila.id_profesional),
    nombre: fila.nombre ?? "",
    bio: fila.bio?.trim() || null,
    foto: fila.foto_url,
    email: contacto?.email ?? null,
    activo: fila.esta_activo,
    conCuenta: fila.auth_user_id !== null,
    esDuenio: fila.auth_user_id === miId,
  };
};

/** El equipo entero, activos y pausados, con el dueño primero, como la app. */
export async function leerEquipo(idComercio: string, miId: string): Promise<Miembro[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("profesionales")
    .select(columnasDeMiembro)
    .eq("id_comercio", idComercio)
    .order("nombre");
  if (error) throw new Error(`equipo: ${error.message}`);
  const equipo = (data as FilaDeMiembro[]).map((fila) => miembroDe(fila, miId));
  return [...equipo.filter((m) => m.esDuenio), ...equipo.filter((m) => !m.esDuenio)];
}

/** Un profesional del local, o `null` si no es suyo. */
export async function leerMiembro(idComercio: string, id: string, miId: string): Promise<Miembro | null> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("profesionales")
    .select(columnasDeMiembro)
    .eq("id_comercio", idComercio)
    .eq("id_profesional", id)
    .maybeSingle();
  if (error) throw new Error(`miembro: ${error.message}`);
  return data ? miembroDe(data as FilaDeMiembro, miId) : null;
}

/**
 * Qué edita el dueño de un profesional: lo suyo y lo de los que no tienen
 * cuenta. Al que tiene cuenta lo ve, pero su nombre, su precio y su duración
 * los maneja él desde la app (D2 del plan de la fase 3). La base deja más;
 * es una decisión de la pantalla, no una regla.
 */
export const loEditaElDuenio = (miembro: Miembro) => miembro.esDuenio || !miembro.conCuenta;

export type Invitacion = { id: string; email: string; vencida: boolean };

/** Las invitaciones que esperan respuesta, la más nueva primero. Vencida: pasó su `expira_el` y se puede reenviar. */
export async function leerInvitaciones(idComercio: string): Promise<Invitacion[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("invitaciones_equipo")
    .select("id_invitacion, email_invitado, expira_el")
    .eq("id_comercio", idComercio)
    .eq("estado", "pendiente")
    .order("creado_el", { ascending: false });
  if (error) throw new Error(`invitaciones: ${error.message}`);
  const ahora = Date.now();
  return (data as { id_invitacion: string; email_invitado: string; expira_el: string | null }[]).map((i) => ({
    id: i.id_invitacion,
    email: i.email_invitado,
    vencida: i.expira_el !== null && new Date(i.expira_el).getTime() < ahora,
  }));
}

/** El switch de "Precios libres" del local (`comercios.permitir_precios_profesionales`). */
export async function leerPreciosLibres(idComercio: string): Promise<boolean> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("comercios")
    .select("permitir_precios_profesionales")
    .eq("id_comercio", idComercio)
    .maybeSingle();
  if (error) throw new Error(`precios libres: ${error.message}`);
  return Boolean((data as { permitir_precios_profesionales: boolean | null } | null)?.permitir_precios_profesionales);
}

/**
 * Si valen los precios de cada profesional: el switch y el plan, en la
 * columna que mantiene la base (`comercios.precios_libres`). Es lo que lee la
 * app del profesional, que no puede leer el plan del local.
 */
export async function leerPreciosQueValen(idComercio: string): Promise<boolean> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.from("comercios").select("precios_libres").eq("id_comercio", idComercio).maybeSingle();
  if (error) throw new Error(`precios libres: ${error.message}`);
  return Boolean((data as { precios_libres: boolean | null } | null)?.precios_libres);
}

export type Asignado = { servicio: number; precio: number | null; duracion: number | null };

/** Los servicios que hace un profesional, con su precio y su duración propios (`null`: los del servicio). */
export async function leerServiciosAsignados(idProfesional: string): Promise<Asignado[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("profesionales_servicios")
    .select("id_servicio, precio_personalizado, duracion_personalizada")
    .eq("id_profesional", idProfesional);
  if (error) throw new Error(`servicios asignados: ${error.message}`);
  return (data as { id_servicio: number; precio_personalizado: number | null; duracion_personalizada: number | null }[]).map(
    (a) => ({ servicio: a.id_servicio, precio: a.precio_personalizado, duracion: a.duracion_personalizada }),
  );
}

export type ResumenDeBaja = { turnos: number; conCliente: number; pagadosPorMp: number };

/** Qué pasa si se desactiva a un profesional (`resumen_de_desactivar`), o `null` si no se pudo saber. */
export async function leerResumenDeBaja(idProfesional: string): Promise<ResumenDeBaja | null> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.rpc("resumen_de_desactivar", { p_profesional: idProfesional });
  if (error) {
    console.error("mi-local/resumen-de-baja:", error.code, error.message);
    return null;
  }
  const r = data as { turnos_a_cancelar: number; con_cliente: number; pagados_por_mp: number };
  return { turnos: r.turnos_a_cancelar, conCliente: r.con_cliente, pagadosPorMp: r.pagados_por_mp };
}

/** Las franjas de la semana de un profesional (`config_agenda`), por día y hora, como `ScheduleProvider` de la app. */
export async function leerFranjas(idProfesional: string): Promise<Franja[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("config_agenda")
    .select("dia_semana, hora_inicio, hora_fin, modalidad, intervalo_turnos, turnos_bloqueados")
    .eq("id_profesional", idProfesional)
    .order("dia_semana")
    .order("hora_inicio");
  if (error) throw new Error(`horario: ${error.message}`);
  type Fila = {
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    modalidad: string | null;
    intervalo_turnos: number | null;
    turnos_bloqueados: string[] | null;
  };
  return (data as Fila[]).map((f) => ({
    dia: f.dia_semana,
    inicio: f.hora_inicio,
    fin: f.hora_fin,
    modalidad: f.modalidad,
    intervalo: f.intervalo_turnos,
    turnosBloqueados: f.turnos_bloqueados ?? [],
  }));
}

/** Los días especiales de un profesional desde `desde`, en orden, como la pestaña Excepciones de la app. */
export async function leerDiasEspeciales(idProfesional: string, desde: string): Promise<DiaEspecial[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("excepciones")
    .select("id_excepcion, fecha, modalidad, hora_inicio, hora_fin, motivo")
    .eq("id_profesional", idProfesional)
    .gte("fecha", desde)
    .order("fecha")
    .order("hora_inicio", { nullsFirst: true });
  if (error) throw new Error(`días especiales: ${error.message}`);
  type Fila = {
    id_excepcion: number;
    fecha: string;
    modalidad: string | null;
    hora_inicio: string | null;
    hora_fin: string | null;
    motivo: string | null;
  };
  return (data as Fila[]).map((f) => {
    const tipo: TipoDeDiaEspecial =
      f.modalidad === "dia_libre" || f.modalidad === "horario_especial" ? f.modalidad : "bloqueo";
    return {
      id: f.id_excepcion,
      fecha: f.fecha,
      tipo,
      // `_excepcion_toma_el_dia`: un día libre, o sin horas, es el día entero.
      horas:
        tipo !== "dia_libre" && f.hora_inicio && f.hora_fin
          ? { desde: minutosDe(f.hora_inicio), hasta: minutosDe(f.hora_fin) }
          : null,
      motivo: f.motivo?.trim() || null,
    };
  });
}
