import { flags } from "./site";

export type FaqItem = {
  q: string;
  a: string;
  /** Link opcional al final de la respuesta. */
  link?: { label: string; href: string };
};

export const faq: readonly FaqItem[] = [
  {
    q: "¿Cuándo lanza la app?",
    a: "Estamos terminando el desarrollo y arrancamos por Tandil. Si estás en la lista, te avisamos antes que a nadie.",
  },
  {
    q: "¿Cuánto cuesta para quien saca turnos?",
    a: "Nada. Bookit es gratis para clientes.",
  },
  {
    q: "¿Y para los locales?",
    a: "Es una suscripción mensual. Los locales fundadores tienen precio preferencial de por vida. Te pasamos los detalles cuando te contactamos.",
  },
  {
    q: "¿Se paga el turno por la app?",
    // Ver `flags.inAppPayments` en content/site.ts — confirmado: sí se paga en la app.
    a: flags.inAppPayments
      ? "Sí. Reservás y pagás el turno desde la app, en el mismo paso. El precio y las condiciones te las informa el local antes de que confirmes."
      : "No. El turno lo reservás por Bookit y el servicio lo pagás en el local, como siempre.",
  },
  {
    q: "¿En qué ciudades está?",
    a: "Arrancamos en Tandil y vamos ciudad por ciudad.",
  },
  {
    q: "¿Cómo funcionan los puntos?",
    a: "Sumás puntos por cada turno y los canjeás en los siguientes. Por anotarte a la lista te llevás 500 de regalo para el primero.",
  },
  {
    q: "¿Cómo funcionan los referidos?",
    a: "Cada persona que saca turnos tiene su código de invitación: quien se registra con él y quien lo compartió suman puntos. Es sólo entre usuarios — los locales no tienen código ni participan del programa.",
  },
  {
    q: "¿Qué hacen con mis datos?",
    a: "Sólo los usamos para avisarte del lanzamiento y darte soporte. Podés pedir la baja cuando quieras.",
    link: { label: "Ver Política de Privacidad", href: "/legal/privacidad" },
  },
] as const;
