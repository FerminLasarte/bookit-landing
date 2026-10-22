import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { leerMiPlan, type MiPlan } from "@/lib/planes";
import { diaDe } from "@/lib/formato";
import { clienteDeSupabase } from "@/lib/supabase";
import { esEstadoTurno, type Profesional, type Turno } from "./turnos";

/*
 * Lo que la agenda del local lee de Supabase, con la sesión del dueño. Las
 * mismas consultas que la app (BooKit, `BusinessCalendarRepository` y
 * `ManualBookingRepository.fetchProfesionales`): lo que se ve lo decide la
 * política de `turnos`, no esta página.
 */

export type MiLocal = {
  id: string;
  nombre: string;
  suscripcion: NonNullable<MiPlan["suscripcion"]>;
};

/**
 * El local de la cuenta. Una cuenta sin local va a /mi-local/sin-local. El
 * chequeo vive acá y no en el layout: Next dibuja la página en paralelo al
 * layout, así que un layout que corta no evita que la página lea. Con
 * `cache`, el marco del panel y la página comparten la lectura.
 */
export const leerMiLocal = cache(async (): Promise<MiLocal> => {
  const plan = await leerMiPlan();
  if (!plan.comercio || !plan.suscripcion) redirect("/mi-local/sin-local");
  return { id: plan.comercio.id, nombre: plan.comercio.nombre, suscripcion: plan.suscripcion };
});

/**
 * El círculo del local en la app (`comercios.logo_url`), o `null` si no subió
 * uno. Aparte de `leerMiLocal`: lo pide sólo el marco, y así la página no lo
 * espera. Un error no tapa la agenda: el marco muestra la inicial.
 */
export async function leerLogoDelLocal(idComercio: string): Promise<string | null> {
  const supabase = await clienteDeSupabase("local");
  const { data } = await supabase.from("comercios").select("logo_url").eq("id_comercio", idComercio).maybeSingle();
  return (data as { logo_url: string | null } | null)?.logo_url ?? null;
}

/**
 * Si el local entra a su agenda. Es la regla del gate de la app
 * (`EstadoSuscripcion.daAcceso`): al día o en gracia.
 */
export const daAcceso = (estado: MiLocal["suscripcion"]["estado"]) => estado === "al_dia" || estado === "en_gracia";

/**
 * El local, si entra al panel, o `null`. Las pantallas de adentro mandan a la
 * agenda, que dice por qué no entra y cómo regularizarlo; las acciones
 * contestan que no tiene acceso.
 */
export async function leerLocalQueEntra(): Promise<MiLocal | null> {
  const local = await leerMiLocal();
  return daAcceso(local.suscripcion.estado) ? local : null;
}

type FilaDeTurno = {
  id_turno: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  estado: string;
  precio_total: number | null;
  cliente_nombre: string | null;
  origen: string | null;
  metodo_pago: string | null;
  pago_estado: string | null;
  monto_pagado: number | null;
  usuario: { nombre_completo: string | null } | null;
  servicios: { nombre: string | null } | null;
  profesionales: { id_profesional: string; nombre: string | null } | null;
};

/**
 * El principio de un día de Buenos Aires y el final de `dias` días después,
 * en UTC. Argentina no tiene horario de verano desde 2009: el día empieza
 * siempre a las 03:00 UTC.
 */
function rangoDeDias(dia: string, dias = 1) {
  const inicio = new Date(`${dia}T00:00:00-03:00`);
  const fin = new Date(inicio.getTime() + dias * 86_400_000);
  return { inicio: inicio.toISOString(), fin: fin.toISOString() };
}

/** Los turnos de un día del local, en orden. Un error sube: un día que no se leyó no es un día vacío. */
export async function leerTurnosDelDia(idComercio: string, dia: string): Promise<Turno[]> {
  const supabase = await clienteDeSupabase("local");
  const { inicio, fin } = rangoDeDias(dia);
  const { data, error } = await supabase
    .from("turnos")
    .select(
      `id_turno, fecha_hora_inicio, fecha_hora_fin, estado, precio_total, cliente_nombre, origen,
       metodo_pago, pago_estado, monto_pagado,
       usuario:usuario_visible(nombre_completo),
       servicios!fk_turnos_servicio!inner(id_comercio, nombre),
       profesionales(id_profesional, nombre)`,
    )
    .eq("servicios.id_comercio", idComercio)
    .gte("fecha_hora_inicio", inicio)
    .lt("fecha_hora_inicio", fin)
    .order("fecha_hora_inicio", { ascending: true });
  if (error) throw new Error(`turnos: ${error.message}`);

  return (data as unknown as FilaDeTurno[]).map((fila) => ({
    id: String(fila.id_turno),
    inicio: fila.fecha_hora_inicio,
    fin: fila.fecha_hora_fin,
    // La base exige minúscula (`chk_turnos_estado`); lo que no se reconoce queda pendiente, como en la app.
    estado: esEstadoTurno(fila.estado) ? fila.estado : "pendiente",
    precio: fila.precio_total ?? 0,
    cliente: fila.cliente_nombre?.trim() || fila.usuario?.nombre_completo || null,
    esManual: fila.origen?.toLowerCase() === "manual",
    // La misma condición que `trg_devolver_al_cancelar` (BooKit, `cobradoPorMp` en la app).
    pagadoPorMp: fila.metodo_pago === "mercadopago" && fila.pago_estado === "pagado" ? (fila.monto_pagado ?? 0) : 0,
    servicio: fila.servicios?.nombre ?? null,
    profesional: fila.profesionales
      ? { id: String(fila.profesionales.id_profesional), nombre: fila.profesionales.nombre ?? "" }
      : null,
  }));
}

/**
 * Cuántos turnos tiene cada día de una semana, de `lunes` a domingo, con la
 * clave `2026-10-21`. Todos los turnos, como el total de la lista. Para la
 * tira de la semana (D7 del plan del panel): sólo la fecha, nada más.
 */
export async function leerSemana(idComercio: string, lunes: string): Promise<Record<string, number>> {
  const supabase = await clienteDeSupabase("local");
  const { inicio, fin } = rangoDeDias(lunes, 7);
  const { data, error } = await supabase
    .from("turnos")
    .select("fecha_hora_inicio, servicios!fk_turnos_servicio!inner(id_comercio)")
    .eq("servicios.id_comercio", idComercio)
    .gte("fecha_hora_inicio", inicio)
    .lt("fecha_hora_inicio", fin);
  if (error) throw new Error(`semana: ${error.message}`);
  const cuenta: Record<string, number> = {};
  for (const { fecha_hora_inicio } of data as { fecha_hora_inicio: string }[]) {
    const clave = diaDe(fecha_hora_inicio);
    cuenta[clave] = (cuenta[clave] ?? 0) + 1;
  }
  return cuenta;
}

/** Los profesionales activos del local, con su foto, para elegir uno. */
export async function leerProfesionales(idComercio: string): Promise<Profesional[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("profesionales")
    .select("id_profesional, nombre, foto_url")
    .eq("id_comercio", idComercio)
    .eq("esta_activo", true)
    .order("nombre");
  if (error) throw new Error(`profesionales: ${error.message}`);
  return (data as { id_profesional: string; nombre: string | null; foto_url: string | null }[]).map((p) => ({
    id: String(p.id_profesional),
    nombre: p.nombre ?? "",
    foto: p.foto_url,
  }));
}

export type ServicioDelProfesional = { id: number; nombre: string; precio: number; duracion: number };

/**
 * Lo que ofrece un profesional, con el precio y la duración que va a guardar
 * `crear_turno_manual`. Lo calcula la base (`servicios_del_profesional`,
 * BooKit 20261021210000, D4).
 */
export async function leerServiciosDelProfesional(idProfesional: string): Promise<ServicioDelProfesional[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.rpc("servicios_del_profesional", { p_profesional: idProfesional });
  if (error) throw new Error(`servicios_del_profesional: ${error.message}`);
  return (data as { id_servicio: number; nombre: string; precio: number; duracion_minutos: number }[]).map((s) => ({
    id: s.id_servicio,
    nombre: s.nombre,
    precio: s.precio,
    duracion: s.duracion_minutos,
  }));
}

/**
 * Los inicios libres de un profesional en un día para un servicio, con la
 * misma cuenta que la reserva del cliente (`horarios_libres_del_profesional`).
 * Los que ya pasaron no vienen.
 */
export async function leerHorariosLibres(idProfesional: string, dia: string, idServicio: number): Promise<string[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.rpc("horarios_libres_del_profesional", {
    p_profesional: idProfesional,
    p_fecha: dia,
    p_servicio: idServicio,
  });
  if (error) throw new Error(`horarios_libres_del_profesional: ${error.message}`);
  return (data as { inicio: string }[]).map((h) => h.inicio);
}

/** Si un día se atiende, como `AtencionDelDia` de la app: con turnos, por orden de llegada o nada. */
export type Atencion = "con_horario" | "orden_de_llegada" | "no_atiende";

/** Los ratos libres de un día, como momentos ISO, y si el día se atiende. */
export type Libres = { atencion: Atencion; huecos: { inicio: string; fin: string }[] };

/** Los del local entero, ya unidos por la base, y los de cada profesional activo, por su id. */
export type HuecosDelDia = { local: Libres; profesionales: Record<string, Libres> };

/**
 * Los huecos libres de un día del local (`huecos_del_dia`, BooKit
 * 20261022120000, D4): la misma cuenta que va a usar la app. Lo que ya empezó
 * arranca en el próximo paso de la grilla, y lo más corto que el servicio más
 * corto no cuenta.
 */
export async function leerHuecosDelDia(idComercio: string, dia: string): Promise<HuecosDelDia> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.rpc("huecos_del_dia", { p_comercio: idComercio, p_fecha: dia });
  if (error) throw new Error(`huecos_del_dia: ${error.message}`);
  return data as HuecosDelDia;
}
