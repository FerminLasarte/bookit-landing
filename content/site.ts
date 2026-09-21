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
 * Cómo se paga un turno. Hecho confirmado el 21 de septiembre de 2026
 * (`PRODUCT.md`, "Capabilities and Constraints").
 *
 * **Esto no es un booleano a propósito.** Antes era `flags.inAppPayments`, y
 * un booleano tiene dos ramas para una verdad de tres estados: conviven el
 * efectivo y Mercado Pago, y cuál acepta cada turno **lo decide el local**.
 * Cualquiera de las dos ramas que eligiera ese booleano mentía — la rama
 * `true` llegó a publicarse diciendo "reservás y pagás desde la app, en el
 * mismo paso", que no es la regla.
 *
 * Mientras `loEligeElLocal` sea `true`, ningún texto del sitio puede presentar
 * una de las dos vías como *la* forma de pagar.
 */
export const payments = {
  /** El cliente puede pagar el turno en el local, como siempre. */
  efectivoEnLocal: true,
  /** El cliente puede pagar el turno por Mercado Pago, dentro de Bookit. */
  mercadoPagoEnApp: true,
  /** Cuál de las dos vías acepta cada turno lo decide el local, no Bookit. */
  loEligeElLocal: true,
  /** La suscripción mensual de los locales se cobra por Mercado Pago. */
  suscripcionOnline: true,
} as const;

/**
 * Decisiones de producto de la §11 del brief. Algunas siguen siendo supuestos;
 * las ya confirmadas viven acá igual, para que el sitio entero lea el dato de
 * un solo lugar y confirmarlas sea cambiar una línea.
 */
export const flags = {
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
