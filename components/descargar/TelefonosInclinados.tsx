"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";
import { transicion } from "@/lib/movimiento";
import { useInclinacion } from "@/lib/useInclinacion";
import { cn } from "@/lib/utils";

/** Un teléfono de atrás: sale de detrás del central hacia su lado. */
const LADOS = [
  { lado: -1, className: "left-[8%]" },
  { lado: 1, className: "right-[8%]" },
] as const;

/**
 * Tres teléfonos: los de atrás se abren en abanico al entrar en pantalla, y
 * los tres se inclinan hacia el puntero, como en el hero.
 */
export default function TelefonosInclinados({
  centro,
  izquierda,
  derecha,
  className,
}: {
  centro: ReactNode;
  izquierda: ReactNode;
  derecha: ReactNode;
  className?: string;
}) {
  const { rotateX, rotateY } = useInclinacion();
  const atras = [izquierda, derecha];

  return (
    <div className={cn("perspective-[1400px]", className)}>
      <m.div style={{ rotateX, rotateY }} className="relative flex h-full justify-center">
        {LADOS.map(({ lado, className }, i) => (
          <m.div
            key={lado}
            initial={{ x: `${-lado * 55}%`, rotate: 0 }}
            whileInView={{ x: 0, rotate: lado * 7 }}
            viewport={{ once: true }}
            transition={{ ...transicion.llegada, delay: 0.15 }}
            className={cn("absolute top-16 w-36 sm:w-40 lg:w-56", className)}
          >
            {atras[i]}
          </m.div>
        ))}
        <div className="relative w-48 sm:w-52 lg:w-72">{centro}</div>
      </m.div>
    </div>
  );
}
