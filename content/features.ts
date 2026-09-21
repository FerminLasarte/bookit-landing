/**
 * Los dos públicos de Bookit. Listas, no cards (§4.7).
 *
 * Antes cada ítem traía un horario de adorno en un `SlotChip`. Eran números sin
 * significado: no eran turnos de nada, y quien los leía se preguntaba qué eran.
 * Los horarios ahora viven sólo en el paso 02 de "Cómo funciona", donde sí se
 * explican solos (son los turnos libres de un día).
 */

export type Feature = string;

/** §6.1 — "Para vos, que sacás turnos" */
export const featuresCliente: readonly Feature[] = [
  "Reservás a cualquier hora, también cuando el local está cerrado.",
  "Recordatorios para no perderte el turno.",
  "Cancelás o reprogramás desde la app, sin tener que avisar por mensaje.",
  "Tu historial y tus locales favoritos, siempre a mano.",
  "Puntos que se acumulan y se canjean.",
] as const;

/** §6.1 — "Para tu local" */
export const featuresLocal: readonly Feature[] = [
  "Agenda digital que se actualiza sola.",
  "Menos ausencias, con recordatorios automáticos.",
  "La ficha de cada cliente y su historial.",
  "Tu link propio para compartir en Instagram.",
  // Antes decía "clientes nuevos que ya están buscando en Bookit": presente
  // sobre demanda que en pre-lanzamiento no existe. El tiempo verbal es el
  // arreglo — la capacidad es real, el "ya" no lo era.
  "Cuando lancemos en Tandil, tu local aparece en las búsquedas desde el primer día.",
  "Vos decidís si cobrás en el local o por Mercado Pago.",
] as const;
