import type { Transition } from "motion/react";

/*
 * Los tokens de movimiento para `motion`. Espejan los de `globals.css` —las
 * curvas y duraciones con el mismo nombre— y agregan los resortes, que CSS no
 * tiene. Un componente no escribe los suyos: los toma de acá o de `var()`.
 */

export const curva = {
  outCubic: [0.215, 0.61, 0.355, 1],
  reveal: [0.16, 1, 0.3, 1],
} as const;

export const duracion = {
  chico: 0.18,
  entrada: 0.3,
  reveal: 0.56,
} as const;

export const transicion = {
  /** Lo que sigue a otra cosa que se mueve con CSS: misma curva y duración. */
  entrada: { duration: duracion.entrada, ease: curva.outCubic },
  /** Algo que llega y se asienta, sin rebote. */
  reveal: { duration: duracion.reveal, ease: curva.reveal },
  /** Lo que responde a la mano: rápido y con un rebote apenas visible. */
  resorte: { type: "spring", stiffness: 420, damping: 32 },
  /** Una cifra que cuenta hasta su valor: arranca rápido y se frena al llegar. */
  cuenta: { duration: 1.6, ease: curva.reveal },
  /** Algo grande que se acomoda en su lugar: un abanico que se abre. */
  llegada: { type: "spring", stiffness: 180, damping: 20 },
  /** Lo que sigue al puntero o al scroll: más blando, para que no tiemble. */
  suave: { type: "spring", stiffness: 160, damping: 24, mass: 0.6 },
} as const satisfies Record<string, Transition>;

/** La marca de `sessionStorage` que dice que el splash ya se vio en esta visita. */
export const SPLASH_VISTO = "bookit-splash";

/** Hay un mouse de verdad: vale la pena reaccionar al puntero. */
export const PUNTERO_FINO = "(hover: hover) and (pointer: fine)";
