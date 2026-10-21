"use client";

import { useEffect } from "react";
import { useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { PUNTERO_FINO, transicion } from "./movimiento";

/**
 * El giro de un grupo de teléfonos hacia el puntero, con resortes. Sin mouse,
 * o con Reducir movimiento, no gira. Se aplica como lámina, sin
 * `transform-3d`: Safari no resuelve qué teléfono va adelante donde se pisan.
 */
export function useInclinacion() {
  const reducir = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-1, 1], [-7, 7]), transicion.suave);
  const rotateX = useSpring(useTransform(py, [-1, 1], [5, -5]), transicion.suave);

  useEffect(() => {
    if (reducir || !window.matchMedia(PUNTERO_FINO).matches) return;
    const seguir = (event: PointerEvent) => {
      px.set((event.clientX / window.innerWidth) * 2 - 1);
      py.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", seguir, { passive: true });
    return () => window.removeEventListener("pointermove", seguir);
  }, [reducir, px, py]);

  return { rotateX, rotateY };
}
