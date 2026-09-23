import type { CapturaId } from "./capturas";
import { categorias } from "./categorias";
import { site } from "./site";

/** Los rubros en minúscula, para completar "Tu próximo turno de…". */
const rubros = categorias.map((categoria) => categoria.label.toLowerCase());

export const hero = {
  title: "Tu próximo turno de",
  rubros,
  lede: `Los locales de ${site.city} en una sola app. Reservá cuando se te ocurra, sin cadenas de WhatsApp ni llamados en horario de trabajo.`,
  note: "Todavía no lanzamos. Anotate y llevate 500 Puntos Bookit para tu primer turno.",
  ctaCliente: { label: "Sumate a la lista VIP", href: "/lista-espera?tipo=cliente" },
  ctaLocal: { label: "Tengo un local", href: "/#locales" },
} as const;

export type Paso = {
  title: string;
  body: string;
  /** La pantalla que lo muestra, y qué franja (en píxeles de la captura). */
  captura: CapturaId;
  crop?: { top: number; bottom: number };
};

const pasos: readonly Paso[] = [
  {
    title: "Encontrá tu local.",
    body: `Los locales de ${site.city} en un mismo lugar, con sus servicios, precios y horarios reales.`,
    captura: "cerca",
  },
  {
    title: "Elegí el horario.",
    body: "Ves los turnos libres de cada día y elegís con quién. Sin esperar respuesta.",
    captura: "horario",
  },
  {
    title: "Confirmá el turno.",
    body: "Revisás el día, el servicio y cómo se paga, y listo: el turno es tuyo.",
    captura: "revisa",
    // La hoja de confirmación, sin la pantalla oscurecida de atrás.
    crop: { top: 1000, bottom: 2622 },
  },
];

export const comoFunciona = {
  title: "Sacar turno lleva treinta segundos.",
  lede: "Sin llamar, sin esperar que te contesten.",
  pasos,
} as const;
