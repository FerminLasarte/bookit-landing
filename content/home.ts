import type { CapturaId } from "./capturas";
import { categorias } from "./categorias";
import { site } from "./site";

/** A dónde llevan los CTA de cada público. */
const descargar = "/descargar";
const listaCliente = "/lista-espera?tipo=cliente";
const listaLocal = "/lista-espera?tipo=local";

/** Los rubros en minúscula, para completar "Tu próximo turno de…". */
const rubros = categorias.map((categoria) => categoria.label.toLowerCase());

export const hero = {
  title: "Tu próximo turno de",
  rubros,
  lede: `Los locales de ${site.city} en una sola app. Reservá cuando se te ocurra, sin cadenas de WhatsApp ni llamados en horario de trabajo.`,
  note: `Ya está en el App Store. Si te anotás en la lista VIP y te registrás con el mismo mail, te llevás ${site.puntosDeRegalo} Puntos Bookit para tu primer turno.`,
  ctaCliente: { label: "Descargá la app", href: descargar },
  ctaLocal: { label: "Tengo un local", href: "/#locales" },
} as const;

/** Un texto con la pantalla de la app que lo muestra. */
export type Pantalla = {
  title: string;
  body: string;
  /** Qué captura, y qué franja (en píxeles de la captura). */
  captura: CapturaId;
  crop?: { top: number; bottom: number };
};

const pasos: readonly Pantalla[] = [
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
  },
];

export const comoFunciona = {
  title: "Sacar turno lleva treinta segundos.",
  /** Lo que marca el reloj al terminar el último paso. */
  segundos: 30,
  lede: "Sin llamar, sin esperar que te contesten.",
  pasos,
} as const;

const pantallasLocal: readonly Pantalla[] = [
  {
    title: "Agenda",
    body: "Los turnos del día y los huecos libres, al día solos.",
    captura: "agenda",
  },
  {
    title: "Asistencia",
    body: "Marcás quién vino y quién no. Menos ausencias, con recordatorios automáticos.",
    captura: "turnoLocal",
    // La hoja del turno, con un poco de la agenda oscurecida detrás.
    crop: { top: 880, bottom: 2622 },
  },
  {
    title: "Mostrador",
    body: "Los turnos que te piden por teléfono o en persona entran a la misma agenda.",
    captura: "mostrador",
    crop: { top: 420, bottom: 2622 },
  },
  {
    title: "Equipo",
    body: "Cada profesional con sus horarios y sus servicios.",
    captura: "equipo",
  },
  {
    title: "Crecimiento",
    body: "Cuántos turnos hacés por mes, tu mejor mes y lo que más vendés.",
    captura: "crecimiento",
  },
];

export const paraLocales = {
  title: "Tu agenda, sin idas y vueltas.",
  lede: "Todo lo del local en una app: los turnos, el equipo y cómo te va.",
  pantallas: pantallasLocal,
  fundador: `Precio fundador de por vida, para los primeros locales de ${site.city}.`,
  cta: { label: "Quiero mi lugar como fundador", href: listaLocal },
  /** También está en el nav desde que la app está en las tiendas. */
  planes: { label: "Mirá los planes", href: "/planes" },
} as const;

export const puntos = {
  title: "Los turnos que ya te hacías, ahora te devuelven algo.",
  lede: "Cada turno que reservás te deja Puntos Bookit, y los canjeás en los que vienen.",
  cifra: site.puntosDeRegalo,
  regalo: "Puntos Bookit de regalo si te anotás en la lista VIP y te registrás en la app con el mismo mail.",
  referidos: {
    title: "Invitá y ganen los dos.",
    body: "Cuando alguien se registra con tu código, suman puntos los dos.",
    link: `${site.dominio}/invite/`,
    codigo: "TUCODIGO",
    nota: "Es entre personas que sacan turnos: los locales no participan.",
  },
  cta: { label: `Quiero mis ${site.puntosDeRegalo} puntos`, href: listaCliente },
} as const;

export type Puerta = {
  label: string;
  body: string;
  note: string;
  cta: { label: string; href: string };
};

export const cierre = {
  title: `Bookit ya está en ${site.city}.`,
  lede: "Bajala y sacá tu próximo turno en treinta segundos.",
  // De izquierda a derecha; la del medio va al frente.
  cascada: ["mapa", "ficha", "bienvenida", "misTurnos", "servicios"] satisfies readonly CapturaId[],
  puertas: [
    {
      label: "Sacás turnos",
      body: "Gratis para quien saca turnos, en iPhone. La versión para Android sale pronto.",
      note: `¿Te anotaste en la lista VIP? Registrate con el mismo mail y tus ${site.puntosDeRegalo} puntos te esperan.`,
      cta: { label: "Descargá la app", href: descargar },
    },
    {
      label: "Tenés un local",
      body: `Precio fundador de por vida, para los primeros locales de ${site.city}.`,
      note: "Te contactamos por WhatsApp o email con los detalles. Anotarte no te compromete a nada.",
      cta: { label: "Quiero mi lugar como fundador", href: listaLocal },
    },
  ] satisfies readonly Puerta[],
} as const;
