"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useInView, useReducedMotion } from "motion/react";
import { transicion } from "@/lib/movimiento";

const INTERVALO = 1400;

/**
 * Una palabra que rota en su lugar: la que se va sale por arriba y la nueva
 * entra desde abajo, siempre en ese sentido. Las palabras invisibles de fondo
 * le dan a la caja el ancho de la más larga, así el renglón no salta.
 *
 * Gira sin parar, pero se frena fuera de pantalla y con el puntero encima
 * (WCAG 2.2.2). Con Reducir movimiento no gira. Es decorativa: el texto
 * accesible lo pone quien la usa.
 */
export default function RotatingWord({ words }: { words: readonly string[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  const enPantalla = useInView(ref);
  const reducir = useReducedMotion();
  const [actual, setActual] = useState(0);
  const [pausada, setPausada] = useState(false);

  useEffect(() => {
    if (reducir || pausada || !enPantalla) return;
    const timer = window.setInterval(() => setActual((i) => (i + 1) % words.length), INTERVALO);
    return () => window.clearInterval(timer);
  }, [reducir, pausada, enPantalla, words.length]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      onPointerEnter={() => setPausada(true)}
      onPointerLeave={() => setPausada(false)}
      className="inline-grid justify-items-center overflow-hidden pb-[0.08em] *:[grid-area:1/1]"
    >
      {words.map((word) => (
        <span key={word} className="invisible">
          {word}
        </span>
      ))}
      <AnimatePresence initial={false}>
        <m.span
          key={words[actual]}
          initial={{ y: "105%" }}
          animate={{ y: 0 }}
          exit={{ y: "-105%" }}
          transition={transicion.reveal}
        >
          {words[actual]}
        </m.span>
      </AnimatePresence>
    </span>
  );
}
