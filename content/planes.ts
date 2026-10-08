/*
 * El copy de /planes. Los precios y lo que incluye cada nivel no están acá:
 * salen de la base (`precios_web`, `niveles` y `mi_plan_web()`), como en la
 * app. Lo que sigue es lo que dice la página alrededor.
 *
 * La app no nombra ni enlaza esta página (regla de Apple): nada de acá se
 * copia allá.
 */

/** Los nombres de los niveles, para cuando la fila de `niveles` no está. */
export const nombresDeNivel = { esencial: "Esencial", pro: "Pro", equipo: "Equipo" } as const;

const crearLocal = "Creá tu local desde la app de Bookit y volvé.";

const tiendaVigente = (vence: string) =>
  `Tu plan se paga en la App Store o en Google Play y sigue hasta el ${vence}. Para pasarte a pagar acá, cancelalo allá y volvé cuando termine.`;

export const sufijoDeCiclo = { mensual: "por mes", anual: "por año" } as const;

export const frecuencias = [
  { valor: "mensual", rotulo: "Mensual" },
  { valor: "anual", rotulo: "Anual" },
] as const;

export const planes = {
  meta: {
    title: "Planes",
    description: "Los planes de Bookit para locales, en pesos y con Mercado Pago: Esencial, Pro y Equipo.",
  },

  sinSesion: {
    titulo: "Planes de Bookit",
    bajada: "En pesos, con Mercado Pago. Entrá con la cuenta de tu local para elegir el tuyo.",
    entrar: {
      titulo: "Entrá con la cuenta de tu local",
      bajada: "La misma con la que entrás a la app de Bookit.",
      google: "Continuar con Google",
      apple: "Continuar con Apple",
      separador: "o con tu mail",
      mail: "Mail",
      contrasena: "Contraseña",
      boton: "Entrar",
      olvido: "¿Te olvidaste la contraseña? Cambiala desde la app.",
    },
    errores: {
      oauth: "No pudimos entrar. Probá de nuevo.",
      credenciales: "El mail o la contraseña no coinciden.",
      sinConfirmar: "Todavía no confirmaste tu mail. Buscá el correo que te mandamos y volvé.",
      faltan: "Completá el mail y la contraseña.",
      generico: "No pudimos entrar. Probá de nuevo en un rato.",
    },
  },

  /** El título y la bajada según en qué está el local, como en el paywall de la app. */
  encabezado: {
    tienePlan: { titulo: "Tu plan", bajada: "Cambiá de plan cuando quieras." },
    cortada: { titulo: "Volvé a recibir turnos", bajada: "Elegí un plan para que tu local vuelva a aparecer." },
    pendiente: {
      titulo: "Elegí tu plan",
      conPrueba: (local: string, dias: number) => `${local} ya está listo. Probalo ${dias} días gratis.`,
      sinPrueba: (local: string) => `${local} ya está listo para recibir turnos.`,
    },
    otro: {
      titulo: "Elegí tu plan",
      conPrueba: (dias: number) => `Probalo ${dias} días gratis.`,
      sinPrueba: "El que mejor le queda a tu local.",
    },
  },

  /** Los motivos por los que `mi_plan_web()` no deja comprar. */
  motivos: {
    sin_comercio: {
      titulo: "Todavía no tenés un local",
      bajada: crearLocal,
      boton: { label: "Bajar la app", href: "/descargar" },
    },
    suspendida: {
      titulo: "Tu local está suspendido",
      bajada: "Escribinos a soporte y lo vemos.",
      boton: { label: "Ir a soporte", href: "/soporte" },
    },
    tienda_vigente: {
      titulo: "Tu plan se paga en la tienda",
      bajada: tiendaVigente,
    },
  },

  /** Lo que tiene hoy y lo que viene, sobre las cards. */
  estado: {
    plan: (nombre: string, vence: string) => `Tu plan: ${nombre}, hasta el ${vence}.`,
    prueba: (nivel: string, vence: string) => `Estás probando ${nivel}. La prueba termina el ${vence}.`,
    anterior: (vence: string) => `Tenés un plan anterior, hasta el ${vence}.`,
    termina: (vence: string) => `Tu plan termina el ${vence}.`,
    pasas: (nombre: string, vence: string) => `Pasás a ${nombre} el ${vence}.`,
    enGracia: "No pudimos cobrar tu plan. Revisá el medio de pago en tu cuenta de Mercado Pago.",
    confirmado: "Listo: tu suscripción quedó confirmada.",
  },

  boton: {
    tuPlan: "Tu plan",
    prueba: (dias: number) => `Empezar ${dias} días gratis`,
    cambiar: (nivel: string) => `Cambiar a ${nivel}`,
    suscribirme: (nivel: string) => `Suscribirme a ${nivel}`,
    yendo: "Yendo a Mercado Pago…",
  },

  /**
   * Lo que se cobra y cómo se corta, al lado del botón. Es lo que Términos §7
   * promete informar al contratar por un medio que no es la tienda.
   */
  letraChica: {
    prueba: (dias: number) => `${dias} días gratis: hoy no pagás nada. `,
    primerCobro: (fecha: string, cobro: string) => `Tu primer cobro es el ${fecha}: ${cobro}. `,
    hoy: (monto: string) => `Pagás ${monto} hoy. `,
    renueva: (plan: "mensual" | "anual") =>
      `Se renueva solo cada ${plan === "anual" ? "año" : "mes"}; lo cancelás cuando quieras desde esta página.`,
    cambio: "Si subís de plan, el cambio es inmediato; si bajás, vale desde la próxima renovación.",
  },

  mercadoPago: {
    conMail: "Pagás con la cuenta de Mercado Pago de",
    cambiar: "Cambiar",
    rotulo: "Mail de tu cuenta de Mercado Pago",
    listo: "Listo",
    relay: "Entraste con Apple: poné el mail de tu cuenta de Mercado Pago.",
  },

  /** La vuelta de Mercado Pago (contrato §5). */
  confirmando: {
    titulo: "Confirmando tu suscripción…",
    bajada: "Mercado Pago nos avisa en unos segundos.",
    demora: "Estamos esperando la confirmación de Mercado Pago. Si ya autorizaste, en unos minutos vas a ver tu plan acá.",
    reintentar: "Volver a mirar",
    otro: "Elegir otro plan",
  },

  cancelar: {
    enlace: "Cancelar suscripción",
    pregunta: (vence: string) => `Tu plan sigue hasta el ${vence} y después se corta. ¿Cancelar?`,
    confirmar: "Cancelar suscripción",
    volver: "Volver",
    cancelando: "Cancelando…",
  },

  pie: { terminos: "Términos", privacidad: "Privacidad", salir: "Salir" },

  /** Un mensaje por código de error de las funciones (contrato §7). */
  errores: {
    sin_sesion: "Tu sesión venció. Entrá de nuevo.",
    sin_comercio: crearLocal,
    suspendida: "Tu local está suspendido. Escribinos a soporte.",
    tienda_vigente: tiendaVigente,
    mismo_plan: "Ese ya es tu plan.",
    plan_invalido: "Algo falló de nuestro lado. Probá de nuevo en un rato.",
    email_invalido: "Revisá el mail de Mercado Pago.",
    baja_pendiente: "No pudimos completar el cambio. Probá de nuevo en un rato.",
    estado_desconocido: "No pudimos completar el cambio. Probá de nuevo en un rato.",
    mercadopago: "Mercado Pago no aceptó el pedido. Revisá que el mail sea el de tu cuenta de Mercado Pago.",
    sin_debito: "No había nada para cancelar. Ya actualizamos tu plan.",
    interno: "Algo falló de nuestro lado. Probá de nuevo en un rato.",
  },
} as const;

export type CodigoDeError = keyof typeof planes.errores;
