import "server-only";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * Los números de Crecimiento (fase 5, docs/PLAN-MI-LOCAL-FASE-5.md). Los suma
 * la base, `estadisticas_comercio` (BooKit 20261008140000), con la sesión del
 * dueño; acá van sólo las cuentas de pantalla que hace la app encima
 * (`business_stats.dart`), con los mismos nombres. Un turno prestado es uno
 * completado, como "Cobrado" en la agenda.
 */

/** Los períodos que se eligen, como la app. Sin el historial en el plan, sólo el mes en curso. */
export const PERIODOS = [3, 6, 12] as const;
export const PERIODO_POR_DEFECTO = 12;

/** Un mes con lo que se atendió, lo que se perdió y quiénes vinieron. `clave`: `2026-10`. */
export type Mes = {
  clave: string;
  turnos: number;
  ingresos: number;
  cancelados: number;
  ausentes: number;
  clientesNuevos: number;
  clientesRecurrentes: number;
};

/** Un servicio o un profesional, con cuánto atendió y facturó. */
export type Fila = { nombre: string; turnos: number; ingresos: number };

/** Cuántos turnos empezaron un día de la semana (ISO: 1 es lunes) a una hora del local. */
export type Horario = { dia: number; hora: number; turnos: number };

export type Estadisticas = {
  /** Del más viejo al más nuevo, sin huecos. El último es el mes en curso. */
  meses: Mes[];
  /** Del que más al que menos. */
  servicios: Fila[];
  profesionales: Fila[];
  horarios: Horario[];
};

type Json = Record<string, unknown>;
const entero = (v: unknown) => Math.round(Number(v ?? 0)) || 0;
const plata = (v: unknown) => Number(v ?? 0) || 0;
const lista = (v: unknown) => (Array.isArray(v) ? (v as Json[]) : []);
const fila = (f: Json): Fila => ({
  nombre: String(f.nombre ?? "").trim() || "Sin nombre",
  turnos: entero(f.turnos),
  ingresos: plata(f.ingresos),
});

/** Los números de los últimos `meses`, el actual incluido. */
export async function leerEstadisticas(idComercio: string, meses: number): Promise<Estadisticas> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.rpc("estadisticas_comercio", { p_id_comercio: idComercio, p_meses: meses });
  if (error) throw new Error(`estadisticas_comercio: ${error.code} ${error.message}`);
  const json = (data ?? {}) as Json;
  return {
    meses: lista(json.meses).map((m) => ({
      clave: String(m.mes),
      turnos: entero(m.turnos),
      ingresos: plata(m.ingresos),
      cancelados: entero(m.cancelados),
      ausentes: entero(m.ausentes),
      clientesNuevos: entero(m.clientes_nuevos),
      clientesRecurrentes: entero(m.clientes_recurrentes),
    })),
    servicios: lista(json.servicios).map(fila),
    profesionales: lista(json.profesionales).map(fila),
    horarios: lista(json.horarios).map((h) => ({ dia: entero(h.dia), hora: entero(h.hora), turnos: entero(h.turnos) })),
  };
}

const suma = (meses: Mes[], dato: (m: Mes) => number) => meses.reduce((s, m) => s + dato(m), 0);

/** Los totales del período y sus proporciones, de 0 a 1. */
export function totales({ meses }: Estadisticas) {
  const turnos = suma(meses, (m) => m.turnos);
  const ingresos = suma(meses, (m) => m.ingresos);
  const cancelados = suma(meses, (m) => m.cancelados);
  const ausentes = suma(meses, (m) => m.ausentes);
  // Lo que se reservó y llegó a su hora: prestado, cancelado o ausente.
  const reservados = turnos + cancelados + ausentes;
  // Un cliente que vino en dos meses cuenta en los dos, como la app.
  const nuevos = suma(meses, (m) => m.clientesNuevos);
  const recurrentes = suma(meses, (m) => m.clientesRecurrentes);
  return {
    turnos,
    ingresos,
    ticketPromedio: turnos === 0 ? 0 : ingresos / turnos,
    cancelados,
    ausentes,
    tasaNoHechos: reservados === 0 ? 0 : (cancelados + ausentes) / reservados,
    nuevos,
    recurrentes,
    tasaRecurrentes: nuevos + recurrentes === 0 ? 0 : recurrentes / (nuevos + recurrentes),
  };
}

/**
 * El último mes cerrado contra el anterior, en ingresos: `0.12` es 12% más.
 * `null` si falta alguno o alguno no facturó. El último de la lista está en
 * curso: compararlo sería comparar medio mes.
 */
export function ultimoMesCerrado({ meses }: Estadisticas) {
  const mes = meses.at(-2);
  const anterior = meses.at(-3);
  if (!mes || !anterior || anterior.ingresos <= 0 || mes.ingresos <= 0) return null;
  return { mes, anterior, variacion: (mes.ingresos - anterior.ingresos) / anterior.ingresos };
}

/** Una franja de tres horas para "Cuándo se llena": desde, incluida; hasta, excluida; y los turnos de lunes a domingo. */
export type Franja = { desde: number; hasta: number; porDia: number[] };

/** Las horas en las que hubo turnos, en franjas de tres desde la primera. */
export function franjas({ horarios }: Estadisticas): Franja[] {
  if (horarios.length === 0) return [];
  const horas = horarios.map((h) => h.hora);
  const primera = Math.min(...horas);
  const ultima = Math.max(...horas);
  const resultado: Franja[] = [];
  for (let desde = primera; desde <= ultima; desde += 3) {
    resultado.push({
      desde,
      hasta: desde + 3,
      porDia: [1, 2, 3, 4, 5, 6, 7].map((dia) =>
        horarios.filter((h) => h.dia === dia && h.hora >= desde && h.hora < desde + 3).reduce((s, h) => s + h.turnos, 0),
      ),
    });
  }
  return resultado;
}

/** Una celda del mapa: el día (ISO), su franja y sus turnos. */
export type Celda = { dia: number; franja: Franja; turnos: number };

/** La celda con más turnos. */
export function masLleno(lista: Franja[]): Celda | null {
  let mejor: Celda | null = null;
  for (const franja of lista) {
    franja.porDia.forEach((turnos, i) => {
      if (!mejor || turnos > mejor.turnos) mejor = { dia: i + 1, franja, turnos };
    });
  }
  return mejor;
}

/**
 * La celda con menos turnos de los días en que se trabaja: un día sin un solo
 * turno en el período es un día cerrado, no un hueco. `null` si no hay dos
 * celdas para comparar.
 */
export function masVacio(lista: Franja[]): Celda | null {
  const diasConTurnos = [0, 1, 2, 3, 4, 5, 6].filter((i) => lista.some((f) => (f.porDia[i] ?? 0) > 0));
  let peor: Celda | null = null;
  let celdas = 0;
  for (const franja of lista) {
    for (const i of diasConTurnos) {
      const turnos = franja.porDia[i] ?? 0;
      celdas++;
      if (!peor || turnos < peor.turnos) peor = { dia: i + 1, franja, turnos };
    }
  }
  return celdas < 2 ? null : peor;
}
