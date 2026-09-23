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
