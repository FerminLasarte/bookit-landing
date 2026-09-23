import { site } from "./site";

/**
 * Copy de la lista VIP. El de cada público ya funciona en producción: el tono
 * y las promesas no se cambian.
 *
 * La descripción se parte en tres para poder poner el `<strong>` sin
 * recurrir a `dangerouslySetInnerHTML`.
 */

export type Audience = "cliente" | "local";

export type AudienceCopy = {
  /** Label del segmented control */
  tab: string;
  /** Aclaración del label, dentro del control */
  tabHint: string;
  desc: { before: string; strong: string; after: string };
  button: string;
  success: {
    lead: string;
    body: string;
  };
};

export const waitlistCopy: Record<Audience, AudienceCopy> = {
  cliente: {
    tab: "Soy cliente",
    tabHint: "Quiero sacar turnos",
    desc: {
      before: "Anotate en la lista VIP y llevate ",
      strong: `${site.puntosDeRegalo} Puntos Bookit`,
      after: " de regalo para canjear en tu primer turno cuando lancemos la app.",
    },
    button: `Quiero mis ${site.puntosDeRegalo} puntos`,
    success: {
      lead: "Ya estás oficialmente en la lista VIP.",
      body: `Acabamos de enviarte un correo confirmando tus ${site.puntosDeRegalo} puntos (revisá spam por las dudas). Te vamos a avisar antes que a nadie cuando la app esté lista.`,
    },
  },
  local: {
    tab: "Tengo un local",
    tabHint: "Quiero digitalizarlo",
    desc: {
      before: "Anotate en la lista VIP y accedé a ",
      strong: "precio fundador de por vida",
      // Sin "cupos limitados": no hay un número detrás (confirmado 21/9/2026).
      after: ": es para los primeros locales que se sumen antes del lanzamiento.",
    },
    button: "Quiero mi lugar como fundador",
    success: {
      lead: "Tu local ya está en la lista VIP de fundadores.",
      body: "Te vamos a contactar por WhatsApp o email con los detalles del precio fundador.",
    },
  },
};

/** Estado de envío: el texto del botón cambia, la animación no. */
export const submittingLabel = "Guardando tus puntos…";

/** Título compartido de las dos pantallas de éxito. El 🎉 se conserva (§6.2). */
export const successTitle = "¡Adentro! 🎉";

export type Paso = { title: string; body: string };

/** La página /lista-espera, alrededor del formulario. */
export const listaEspera = {
  title: `Entrá antes que el resto de ${site.city}.`,
  lede: "Todavía no lanzamos. La lista es para las personas y los locales que van a usar Bookit antes que nadie, y anotarte lleva menos de un minuto.",
  garantias: [
    "Anotarte no cuesta nada.",
    "Sólo te escribimos por Bookit, nunca para otra cosa.",
    "Te podés dar de baja cuando quieras, desde cualquier correo que te mandemos.",
  ],
  pasos: {
    title: "Cómo sigue.",
    // Sin promesas que no podamos cumplir.
    items: [
      {
        title: "Te anotás",
        body: "Un nombre, un correo y listo. No pedimos tarjeta ni nada por el estilo.",
      },
      {
        title: "Te llega el correo",
        body: `Confirmamos tus ${site.puntosDeRegalo} puntos por email en el momento. Revisá spam por las dudas.`,
      },
      {
        title: "Te avisamos del lanzamiento",
        body: "El día que la app esté en App Store y Google Play, sos de los primeros en saberlo.",
      },
    ] satisfies readonly Paso[],
  },
  datos: {
    title: "Tus datos, en claro.",
    body: "Guardamos tu nombre, tu correo y —si nos lo dejás— tu WhatsApp, sólo para avisarte del lanzamiento y darte tus puntos. Nada de esto se vende ni se comparte. Podés pedir que los borremos cuando quieras.",
    links: [
      { label: "Política de Privacidad", href: "/legal/privacidad" },
      { label: "Términos y Condiciones", href: "/legal/terminos" },
      { label: "Eliminar mis datos", href: "/legal/eliminar-cuenta" },
    ],
  },
} as const;
