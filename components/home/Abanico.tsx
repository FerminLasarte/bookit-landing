"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";
import { transicion } from "@/lib/movimiento";
import { cn } from "@/lib/utils";

/** Los extremos más girados y más bajos. En móvil quedan las tres del medio. */
const POSES = [
  { rotate: -8, y: 56, className: "z-0 hidden lg:block" },
  { rotate: -4, y: 20, className: "z-10" },
  { rotate: 0, y: 0, className: "z-20" },
  { rotate: 4, y: 20, className: "z-10" },
  { rotate: 8, y: 56, className: "z-0 hidden lg:block" },
];
const CENTRO = (POSES.length - 1) / 2;

/**
 * Capturas que llegan apiladas y se abren en abanico al entrar en pantalla.
 * Con el puntero encima se separan un poco más.
 */
export default function Abanico({ pantallas, className }: { pantallas: readonly ReactNode[]; className?: string }) {
  return (
    <m.div
      initial="apilado"
      whileInView="abierto"
      whileHover="separado"
      viewport={{ once: true, margin: "0px 0px -25% 0px" }}
      transition={{ staggerChildren: 0.05, delayChildren: 0.1 }}
      className={cn("flex justify-center", className)}
    >
      {pantallas.map((pantalla, i) => {
        const { rotate, y, className } = POSES[i] ?? POSES[CENTRO]!;
        const lejos = i - CENTRO;
        return (
          <m.div
            key={i}
            variants={{
              apilado: { x: `${-lejos * 80}%`, rotate: 0, y: 40 },
              abierto: { x: 0, rotate, y },
              separado: { x: `${lejos * 10}%`, rotate: rotate * 1.5, y: y - 8 },
            }}
            transition={transicion.llegada}
            className={cn("relative -mx-5 w-36 shrink-0 lg:-mx-3 lg:w-48", className)}
          >
            {pantalla}
          </m.div>
        );
      })}
    </m.div>
  );
}
