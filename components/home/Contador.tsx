"use client";

import { useEffect, useRef } from "react";
import { animate, m, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { transicion } from "@/lib/movimiento";
import { cn } from "@/lib/utils";

/**
 * Una cifra que cuenta desde cero la primera vez que entra en pantalla. La
 * cifra final, invisible en la misma celda, fija el ancho para que no salte.
 * Es decorativa: quien la usa pone el número para los lectores.
 */
export default function Contador({ valor, className }: { valor: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visto = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const reducir = useReducedMotion();
  const cifra = useMotionValue(0);
  const texto = useTransform(cifra, (v) => Math.round(v).toString());

  useEffect(() => {
    if (!visto) return;
    if (reducir) return cifra.set(valor);
    const cuenta = animate(cifra, valor, transicion.cuenta);
    return () => cuenta.stop();
  }, [visto, reducir, cifra, valor]);

  return (
    <span ref={ref} aria-hidden="true" className={cn("num inline-grid *:[grid-area:1/1]", className)}>
      <span className="invisible">{valor}</span>
      <m.span className="text-center">{texto}</m.span>
    </span>
  );
}
