/**
 * Mensajes de error del alta a la lista VIP.
 *
 * Viven acá y no en `waitlist-schema.ts` porque el formulario —que es un
 * componente de cliente— muestra los mismos textos que devuelve el endpoint, y
 * el schema importa `zod`: leerlos desde ahí metía la librería entera en el
 * bundle del navegador para usar ocho strings. El schema los re-exporta, así
 * que el endpoint no cambia de fuente.
 *
 * Los seis primeros son **contrato**: ya circulan en producción. NO cambiar el
 * texto.
 */
export const WAITLIST_ERRORS = {
  method: "Método no permitido",
  missing: "Faltan datos obligatorios.",
  consent: "Es necesario aceptar recibir novedades para continuar.",
  category: "Contanos la categoría de tu comercio.",
  duplicate: "Este correo ya está en la lista VIP.",
  unexpected: "Hubo un error al procesar tu solicitud. Intentá de nuevo.",
  // Agregados en la migración (endurecen sin romper los de arriba):
  email: "Revisá el correo electrónico: no parece válido.",
  rateLimit: "Probá de nuevo en un minuto.",
} as const;

/**
 * Lo que dice cada campo cuando queda vacío.
 *
 * El formulario tenía un solo mensaje al pie —"Revisá los campos marcados para
 * continuar"— y por campo nada más que un borde rojo. Eso es exactamente el
 * "Error inesperado" de la tabla de Voz del manual: no dice qué pasó, y deja al
 * color como único portador del dato, que es otra regla del manual. Para quien
 * usa un lector de pantalla era peor: el campo anunciaba "inválido" y nada más.
 *
 * Son enunciados, no órdenes: el imperativo ("Escribí tu nombre") dice qué
 * hacer, no qué pasó, y el que está del otro lado ya sabe que tiene que
 * escribir. Los dos que faltan —el correo mal escrito y el consentimiento— ya
 * existen arriba, porque el endpoint los devuelve con ese mismo texto.
 */
export const WAITLIST_FIELD_ERRORS = {
  name: "Falta tu nombre.",
  email: "Falta tu correo.",
  userType: "Falta elegir cómo vas a usar Bookit.",
  category: "Falta la categoría de tu local.",
  categoryOther: "Falta decirnos cuál es.",
} as const;

/**
 * Chequeo de formato del lado del cliente, a propósito permisivo: el que decide
 * es el endpoint, con `z.email()`. Acá alcanza con atajar el error de tipeo
 * obvio antes de gastar un viaje al servidor, y pasarse de estricto es la forma
 * conocida de rechazar direcciones que existen.
 */
export const pareceEmail = (valor: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

/**
 * De qué campo habla cada mensaje del endpoint.
 *
 * El más frecuente en producción —"Este correo ya está en la lista VIP"— es un
 * problema del correo, y se mostraba al pie del formulario como si fuera de la
 * página entera. Con esto cae en el campo que le corresponde, con el mismo
 * cableado que los errores de validación. Los que no están acá no se pueden
 * atribuir a un campo (`missing`, `unexpected`, `rateLimit`) y se quedan al pie.
 */
export const CAMPO_DEL_ERROR: Record<string, "email" | "category" | "consent"> = {
  [WAITLIST_ERRORS.duplicate]: "email",
  [WAITLIST_ERRORS.email]: "email",
  [WAITLIST_ERRORS.category]: "category",
  [WAITLIST_ERRORS.consent]: "consent",
};
