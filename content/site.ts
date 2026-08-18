/**
 * Fuente única de verdad para datos de contacto, URLs y handles.
 * Si un dato aparece dos veces en el sitio, tiene que salir de acá.
 */

export const site = {
  name: "Bookit",
  legalName: "Bookit",
  url: "https://www.somosbookit.com.ar",
  city: "Tandil",
  province: "Buenos Aires",
  country: "Argentina",
  hq: "HQ · Tandil, Buenos Aires, Argentina",
  email: "somosbookit@gmail.com",
  transactionalEmail: "hola@somosbookit.com.ar",
  instagram: {
    handle: "@bookit_arg",
    url: "https://instagram.com/bookit_arg",
  },
  phone: {
    display: "+54 9 249 460-0615",
    href: "tel:+5492494600615",
    isPlaceholder: false,
  },
  app: {
    bundleId: "ar.com.somosbookit.app",
    appleTeamId: "MPX5U375K6",
    appStore: null,
    playStore: null,
  },
  legal: {
    dataProtectionLaw: "Ley 25.326 de Protección de Datos Personales",
    consumerLaw: "Ley 24.240 de Defensa del Consumidor",
    jurisdiction: "tribunales ordinarios de Tandil, Provincia de Buenos Aires",
    consumerDefenseUrl:
      "https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario",
    aaipUrl: "https://www.argentina.gob.ar/aaip",
  },
} as const;

/**
 * Decisiones de producto todavía sin confirmar (§11 del brief).
 * Están acá y no hardcodeadas para que confirmarlas sea cambiar una línea.
 */
export const flags = {
  /**
   * ¿Se paga el turno dentro de la app en el lanzamiento?
   * Asumido `false`: el pago se hace en el local. Afecta FAQ, Términos y
   * si el Botón de arrepentimiento aplica ya o sólo se explica.
   * TODO: confirmar antes de publicar.
   */
  inAppPayments: false,
  /**
   * ¿Ya hay links de App Store / Google Play?
   * Mientras sea `false`, todo CTA de descarga manda a la lista de espera
   * con copy honesto en vez de un link muerto.
   */
  storeLinksLive: false,
  /** Analítica sin cookies. Mientras sea `false`, no hay banner ni tracking. */
  analytics: false,
} as const;

/** Fecha de última actualización de los textos legales. */
export const legalUpdatedAt = "17 de agosto de 2026";
