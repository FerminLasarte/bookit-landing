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
 * Decisiones de producto de la §11 del brief. Algunas siguen siendo supuestos;
 * las ya confirmadas viven acá igual, para que el sitio entero lea el dato de
 * un solo lugar y confirmarlas sea cambiar una línea.
 */
export const flags = {
  /**
   * ¿Se paga el turno dentro de la app?
   * `true` — **hecho confirmado el 21 de septiembre de 2026**, no un supuesto.
   * Ver `PRODUCT.md`, "Capabilities and Constraints". Afecta la FAQ, Términos §3
   * y el Botón de arrepentimiento, que con pagos in-app aplica de verdad.
   */
  inAppPayments: true,
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
export const legalUpdatedAt = "21 de septiembre de 2026";
