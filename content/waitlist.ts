/**
 * Copy dinámico de la lista VIP (§6.2). Ya funciona en producción: el tono
 * y las promesas no se cambian, sólo se tipan.
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
  title: string;
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
    title: "Tandil, tu forma de sacar turnos está a punto de cambiar.",
    desc: {
      before: "Anotate en la lista VIP y llevate ",
      strong: "500 Puntos Bookit",
      after: " de regalo para canjear en tu primer turno cuando lancemos la app.",
    },
    button: "Quiero mis 500 puntos",
    success: {
      lead: "Ya estás oficialmente en la lista VIP.",
      body: "Acabamos de enviarte un correo confirmando tus 500 puntos (revisá spam por las dudas). Te vamos a avisar antes que a nadie cuando la app esté lista.",
    },
  },
  local: {
    tab: "Tengo un local",
    tabHint: "Quiero digitalizarlo",
    title: "Sumá tu local a Bookit antes que nadie.",
    desc: {
      before: "Anotate en la lista VIP y accedé a ",
      strong: "precio fundador de por vida",
      after: ": cupos limitados para los primeros locales que se sumen antes del lanzamiento.",
    },
    button: "Quiero mi lugar como fundador",
    success: {
      lead: "Tu local ya está en la lista VIP de fundadores.",
      body: "Te vamos a contactar por WhatsApp o email con los detalles del precio fundador antes de que se agoten los cupos.",
    },
  },
};

/** Estado de envío: el texto del botón cambia, la animación no. */
export const submittingLabel = "Guardando tus puntos…";

/** Título compartido de las dos pantallas de éxito. El 🎉 se conserva (§6.2). */
export const successTitle = "¡Adentro! 🎉";
