import "server-only";
import { redirect } from "next/navigation";
import { leerMiPlan, type MiPlan } from "@/lib/planes";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * Lo que la agenda del local lee de Supabase, con la sesión del dueño. Las
 * mismas consultas que la app (BooKit, `BusinessCalendarRepository` y
 * `ManualBookingRepository.fetchProfesionales`): lo que se ve lo decide la
 * política de `turnos`, no esta página.
 */

export type EstadoTurno = "pendiente" | "confirmado" | "completado" | "ausente" | "cancelado" | "expirado";

export const ESTADOS_TURNO: readonly EstadoTurno[] = [
  "pendiente",
  "confirmado",
  "completado",
  "ausente",
  "cancelado",
  "expirado",
];

export const esEstadoTurno = (valor: unknown): valor is EstadoTurno =>
  typeof valor === "string" && (ESTADOS_TURNO as readonly string[]).includes(valor);

export type Turno = {
  id: string;
  inicio: string;
  fin: string;
  estado: EstadoTurno;
  precio: number;
  cliente: string | null;
  esManual: boolean;
  /** Lo que se le devuelve si se cancela: lo pagado por Mercado Pago. */
  pagadoPorMp: number;
  servicio: string | null;
  profesional: { id: string; nombre: string } | null;
};

export type Profesional = { id: string; nombre: string };

export type MiLocal = {
  id: string;
  nombre: string;
  suscripcion: NonNullable<MiPlan["suscripcion"]>;
};

/**
 * El local de la cuenta. Una cuenta sin local va a /mi-local/sin-local. El
 * chequeo vive acá y no en el layout: Next dibuja la página en paralelo al
 * layout, así que un layout que corta no evita que la página lea.
 */
export async function leerMiLocal(): Promise<MiLocal> {
  const plan = await leerMiPlan();
  if (!plan.comercio || !plan.suscripcion) redirect("/mi-local/sin-local");
  return { id: plan.comercio.id, nombre: plan.comercio.nombre, suscripcion: plan.suscripcion };
}

/**
 * Si el local entra a su agenda. Es la regla del gate de la app
 * (`EstadoSuscripcion.daAcceso`): al día o en gracia.
 */
export const daAcceso = (estado: MiLocal["suscripcion"]["estado"]) => estado === "al_dia" || estado === "en_gracia";

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
 * El principio y el fin de un día de Buenos Aires, en UTC. Argentina no tiene
 * horario de verano desde 2009: el día empieza siempre a las 03:00 UTC.
 */
function rangoDelDia(dia: string) {
  const inicio = new Date(`${dia}T00:00:00-03:00`);
  const fin = new Date(inicio.getTime() + 86_400_000);
  return { inicio: inicio.toISOString(), fin: fin.toISOString() };
}

/** Los turnos de un día del local, en orden. Un error sube: un día que no se leyó no es un día vacío. */
export async function leerTurnosDelDia(idComercio: string, dia: string): Promise<Turno[]> {
  const supabase = await clienteDeSupabase("local");
  const { inicio, fin } = rangoDelDia(dia);
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

/** Los profesionales activos del local, para el filtro. */
export async function leerProfesionales(idComercio: string): Promise<Profesional[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("profesionales")
    .select("id_profesional, nombre")
    .eq("id_comercio", idComercio)
    .eq("esta_activo", true)
    .order("nombre");
  if (error) throw new Error(`profesionales: ${error.message}`);
  return (data as { id_profesional: string; nombre: string | null }[]).map((p) => ({
    id: String(p.id_profesional),
    nombre: p.nombre ?? "",
  }));
}

export type ServicioDelProfesional = { id: number; nombre: string; precio: number; duracion: number };

/**
 * Lo que ofrece un profesional, con el precio que va a guardar
 * `crear_turno_manual` y la duración que arma el fin del turno. Lo calcula la
 * base (`servicios_del_profesional`, BooKit 20261021210000, D4).
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

/** Reservado y sin resolver: pendiente o confirmado (`EstadoTurno.esActivo` en la app). */
const estaAbierto = (turno: Turno) => turno.estado === "pendiente" || turno.estado === "confirmado";

/** Terminó y nadie lo cerró: sigue pendiente o confirmado (`EstadoTurno.quedoSinCerrar` en la app). */
export const quedoSinMarcar = (turno: Turno, ahora: Date) => estaAbierto(turno) && new Date(turno.fin) <= ahora;

/** Los estados a los que el local puede llevar un turno. Confirmar es cosa del pago (D1 del plan de la fase 2). */
export const ACCIONES_DE_TURNO = ["completado", "ausente", "cancelado"] as const;
export type AccionDeTurno = (typeof ACCIONES_DE_TURNO)[number];

/** Qué se le puede hacer a un turno ahora. `null`: ya está cerrado. */
export type AccionesDelTurno = { asistencia: boolean; cancelar: boolean } | null;

/**
 * La regla de `_turnos_quien_cambia_el_estado` (BooKit, 20260925150000), para
 * no ofrecer lo que la base va a rechazar: completado y ausente desde que
 * empieza, cancelar hasta que termina. La que decide es la base; si cambia
 * allá, cambia acá.
 */
export function accionesDelTurno(turno: Turno, ahora: Date): AccionesDelTurno {
  if (!estaAbierto(turno)) return null;
  return { asistencia: new Date(turno.inicio) <= ahora, cancelar: new Date(turno.fin) > ahora };
}

/** Lo cobrado: sólo lo completado, la definición de ingreso de la app (`EstadoTurno.esIngreso`). */
export const cobrado = (turnos: Turno[]) =>
  turnos.filter((t) => t.estado === "completado").reduce((suma, t) => suma + t.precio, 0);
