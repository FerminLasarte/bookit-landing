"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const INTERVALO = 2200;

/**
 * Una palabra que rota en su lugar. Todas se apilan en la misma celda, así que
 * la caja mide lo que la más ancha y el renglón no salta al cambiar.
 *
 * Da una sola vuelta y se queda en la primera: algo que se mueve solo y
 * para siempre necesitaría un botón de pausa (WCAG 2.2.2). Con Reducir
 * movimiento no rota. Es decorativa: el texto accesible lo pone quien la usa.
 */
export default function RotatingWord({ words }: { words: readonly string[] }) {
  const [paso, setPaso] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (paso >= words.length) return;
    const timer = window.setTimeout(() => setPaso((p) => p + 1), INTERVALO);
    return () => window.clearTimeout(timer);
  }, [paso, words.length]);

  const actual = paso % words.length;

  return (
    <span aria-hidden="true" className="inline-grid justify-items-center overflow-hidden pb-[0.08em]">
      {words.map((word, i) => (
        <span
          key={word}
          className={cn(
            "col-start-1 row-start-1 transition-[opacity,transform] duration-(--duration-reveal) ease-(--ease-reveal)",
            i === actual ? "translate-y-0 opacity-100" : "opacity-0",
            i !== actual && (i < actual ? "-translate-y-full" : "translate-y-full"),
          )}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
