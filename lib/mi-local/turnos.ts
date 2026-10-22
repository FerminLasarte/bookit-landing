/*
 * Los turnos del local y las reglas que se leen sobre ellos. Sin `server-only`:
 * los filtros de la agenda corren en el navegador (D6 del plan del panel). Lo
 * que se lee de Supabase está en `agenda.ts`.
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

export type Profesional = { id: string; nombre: string; foto: string | null };

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

/**
 * Cómo mira el local su día (D9 del plan del panel): no distingue pendiente de
 * confirmado, sí lo que quedó sin cerrar. Cancelados incluye las reservas de
 * Mercado Pago que vencieron sin pagarse.
 */
export const GRUPOS = ["sin-marcar", "por-atender", "completados", "ausentes", "cancelados"] as const;
export type Grupo = (typeof GRUPOS)[number];

export const esGrupo = (valor: unknown): valor is Grupo =>
  typeof valor === "string" && (GRUPOS as readonly string[]).includes(valor);

export function grupoDe(turno: Turno, ahora: Date): Grupo {
  if (estaAbierto(turno)) return quedoSinMarcar(turno, ahora) ? "sin-marcar" : "por-atender";
  if (turno.estado === "completado") return "completados";
  if (turno.estado === "ausente") return "ausentes";
  return "cancelados";
}
