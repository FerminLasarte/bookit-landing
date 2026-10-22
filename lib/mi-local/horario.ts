/*
 * El horario de un profesional como lo piensa el local: un día abre, cierra y
 * descansa (`DiaAgenda` de la app, BooKit `lib/shared/schedule_management`).
 * En la base el día son franjas de `config_agenda` y un descanso es el hueco
 * entre dos. Sin `server-only`: el editor del día corre en el navegador.
 *
 * Acá no hay reglas: que el cierre sea después de la apertura, que las franjas
 * no se pisen, la modalidad y el intervalo los controla `guardar_dias_agenda`
 * (D3 del plan de la fase 3).
 */

/** Un tramo del día en minutos desde las 00:00, con el fin afuera. */
export type Tramo = { desde: number; hasta: number };

export type Modalidad = "con_turno" | "orden_llegada";

export type Dia = {
  abierto: boolean;
  apertura: number;
  cierre: number;
  /** Ordenados por inicio. */
  descansos: Tramo[];
  modalidad: Modalidad;
  intervalo: number;
};

/** Una fila de `config_agenda`. `turnosBloqueados` es lo de antes: inicios de la grilla tachados. */
export type Franja = {
  dia: number;
  inicio: string;
  fin: string;
  modalidad: string | null;
  intervalo: number | null;
  turnosBloqueados: string[];
};

/** Los que ofrece la app en "Un turno cada" (`DiaAgenda.intervalos`). */
export const INTERVALOS = [15, 20, 30, 45, 60, 90, 120];

/** 1 = lunes … 7 = domingo, como `dia_semana`. */
export const DIAS_DE_LA_SEMANA = [1, 2, 3, 4, 5, 6, 7];

/** Un día sin horario. Las horas son las que propone el editor al abrirlo. */
export const DIA_CERRADO: Dia = { abierto: false, apertura: 9 * 60, cierre: 18 * 60, descansos: [], modalidad: "con_turno", intervalo: 30 };

/** `09:00` a minutos. También lee `09:00:00`, como lo devuelve Postgres. */
export function minutosDe(hora: string): number {
  const [h = "0", m = "0"] = hora.split(":");
  return Number(h) * 60 + Number(m);
}

/** Minutos a `09:00`. */
export const horaDe = (minutos: number) =>
  `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;

/** "09:00–13:00". */
export const etiquetaDe = ({ desde, hasta }: Tramo) => `${horaDe(desde)}–${horaDe(hasta)}`;

/** Lo que pisa un descanso de antes: cada inicio bloqueado le saca un paso a la franja (`_tramosDeFila` de la app). */
function tramosDeFranja(franja: Franja): Tramo[] {
  const inicio = minutosDe(franja.inicio);
  const fin = minutosDe(franja.fin);
  if (!franja.turnosBloqueados.length) return [{ desde: inicio, hasta: fin }];
  const paso = franja.intervalo && franja.intervalo > 0 ? franja.intervalo : 30;
  const bloqueados = new Set(franja.turnosBloqueados.map(minutosDe));
  const tramos: Tramo[] = [];
  let desde: number | null = null;
  for (let minuto = inicio; minuto < fin; minuto += paso) {
    if (!bloqueados.has(minuto)) desde ??= minuto;
    else if (desde !== null) {
      tramos.push({ desde, hasta: minuto });
      desde = null;
    }
  }
  if (desde !== null) tramos.push({ desde, hasta: fin });
  return tramos;
}

/** El día a partir de sus franjas (`DiaAgenda.desdeFilas`): abre con la primera, cierra con la última y descansa entre ellas. */
export function diaDesdeFranjas(franjas: Franja[]): Dia {
  const tramos = franjas.flatMap(tramosDeFranja).sort((a, b) => a.desde - b.desde);
  const [primero, ...resto] = tramos;
  if (!primero) return DIA_CERRADO;
  const descansos: Tramo[] = [];
  let fin = primero.hasta;
  for (const tramo of resto) {
    if (tramo.desde > fin) descansos.push({ desde: fin, hasta: tramo.desde });
    fin = Math.max(fin, tramo.hasta);
  }
  return {
    abierto: true,
    apertura: primero.desde,
    cierre: fin,
    descansos,
    modalidad: franjas[0]?.modalidad === "orden_llegada" ? "orden_llegada" : "con_turno",
    intervalo: franjas[0]?.intervalo || 30,
  };
}

/**
 * Lo que se guarda: de la apertura al primer descanso, entre descansos y del
 * último al cierre. Sin arreglar nada: un descanso fuera del día o que pisa a
 * otro da una franja al revés o encimada, y la base la rechaza con su frase.
 */
export function franjasDe(dia: Dia): Tramo[] {
  if (!dia.abierto) return [];
  const descansos = [...dia.descansos].sort((a, b) => a.desde - b.desde);
  const cortes = [dia.apertura, ...descansos.flatMap((d) => [d.desde, d.hasta]), dia.cierre];
  return Array.from({ length: cortes.length / 2 }, (_, i) => ({ desde: cortes[2 * i] ?? 0, hasta: cortes[2 * i + 1] ?? 0 }));
}

export const minutosDeAtencion = (dia: Dia) => franjasDe(dia).reduce((total, f) => total + f.hasta - f.desde, 0);

/** "45 min", "1 h", "1 h 30" (`duracionCorta` de la app). */
export function duracionCorta(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const resto = minutos % 60;
  return resto === 0 ? `${Math.floor(minutos / 60)} h` : `${Math.floor(minutos / 60)} h ${String(resto).padStart(2, "0")}`;
}

/** La semana, de lunes a domingo, a partir de todas las franjas del profesional. */
export const semanaDe = (franjas: Franja[]) => DIAS_DE_LA_SEMANA.map((d) => diaDesdeFranjas(franjas.filter((f) => f.dia === d)));

/** Lo que guarda `excepciones.modalidad`. La app crea día libre y bloqueo; el horario especial sólo lo muestra. */
export type TipoDeDiaEspecial = "dia_libre" | "bloqueo" | "horario_especial";

/** Un día que se sale de la semana habitual (`ExcepcionAgenda` de la app). Sin horas, toma el día entero. */
export type DiaEspecial = {
  id: number;
  fecha: string;
  tipo: TipoDeDiaEspecial;
  horas: Tramo | null;
  motivo: string | null;
};
