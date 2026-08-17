export type Step = {
  /** Numeración mono `01 / 02 / 03` — motivo visual §4.6.3 */
  n: string;
  title: string;
  body: string;
};

export const steps: readonly Step[] = [
  {
    n: "01",
    title: "Encontrá tu local.",
    body: "Todos los locales de tu ciudad en un mismo lugar, con sus servicios, precios y horarios reales.",
  },
  {
    n: "02",
    title: "Reservá el turno.",
    body: "Elegís el servicio, ves los huecos disponibles y confirmás. Sin esperar respuesta.",
  },
  {
    n: "03",
    title: "Sumá puntos.",
    body: "Cada turno te deja Puntos Bookit para canjear en los que vienen.",
  },
] as const;
