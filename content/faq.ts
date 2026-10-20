import { payments, site } from "./site";

export type FaqItem = {
  q: string;
  a: string;
  /** Link opcional al final de la respuesta. */
  link?: { label: string; href: string };
};

export const preguntas = {
  title: "Lo que suelen preguntarnos.",
  lede: {
    antes: "Y si no está acá, ",
    contacto: { label: "escribinos", href: "/soporte" },
    despues: ": te contestamos nosotros.",
  },
} as const;

export const faq: readonly FaqItem[] = [
  {
    q: "¿Dónde descargo la app?",
    a: "Ya está en el App Store para iPhone. La versión para Android sale pronto.",
    link: { label: "Descargar Bookit", href: "/descargar" },
  },
  {
    q: "¿Cuánto cuesta para quien saca turnos?",
    a: "Nada. Bookit es gratis para clientes.",
  },
  {
    q: "¿Y para los locales?",
    a: "Es una suscripción mensual. Los primeros locales que se suman tienen precio fundador de por vida. Te pasamos los detalles cuando te contactamos.",
  },
  {
    q: "¿Se paga el turno por la app?",
    // `payments` en content/site.ts. Tres estados, tres ramas: mientras el pago
    // lo elija el local, ninguna de las dos vías puede contarse como la regla.
    a: payments.loEligeElLocal
      ? "Depende del local. Algunos cobran en el local, como siempre; otros activan el pago por Mercado Pago dentro de Bookit. Antes de confirmar el turno ves cuál acepta ese local."
      : payments.mercadoPagoEnApp
        ? "Sí. Reservás y pagás por Mercado Pago dentro de Bookit, en el mismo paso. El precio y las condiciones te las informa el local antes de que confirmes."
        : "No. El turno lo reservás por Bookit y el servicio lo pagás en el local, como siempre.",
  },
  {
    q: "¿En qué ciudades está?",
    a: "Arrancamos por Tandil y vamos ciudad por ciudad.",
  },
  {
    q: "¿Cómo funcionan los puntos?",
    // El valor del punto no es fijo (confirmado 21/9/2026). Decirlo es mejor que
    // dejar el hueco: una moneda sin valor declarado es el clásico indicio de
    // que el beneficio no existe, y esta página ya admite lo que no sabe.
    a: `Sumás puntos por cada turno y los canjeás en los siguientes. Si te anotás en la lista VIP y te registrás con el mismo mail, te llevás ${site.puntosDeRegalo} de regalo para el primero. Un punto no tiene un valor fijo en pesos.`,
  },
  {
    q: "¿Cómo funcionan los referidos?",
    a: "Cada persona que saca turnos tiene su código de invitación: quien se registra con él y quien lo compartió suman puntos. Si ya tenés la app, el link la abre directo; si no, te muestra el código para usarlo al registrarte. Es sólo entre personas que sacan turnos: los locales no tienen código ni participan del programa.",
  },
  {
    q: "¿Qué hacen con mis datos?",
    a: "Los usamos para darte el servicio y soporte, como lo explica la Política de Privacidad. Podés pedir la baja cuando quieras.",
    link: { label: "Ver Política de Privacidad", href: "/legal/privacidad" },
  },
] as const;
