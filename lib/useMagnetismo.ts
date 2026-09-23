"use client";

import { useEffect } from "react";
import { PUNTERO_FINO } from "./movimiento";

/** Qué fracción de la distancia al centro sigue el elemento. */
const FUERZA = 0.3;

/**
 * Todo lo que lleva `data-magnetico` se corre hacia el puntero mientras está
 * encima, y vuelve al soltarlo. Un solo listener para todo el sitio; el cómo
 * se mueve vive en la utilidad `magnetico`. Sólo con mouse y sin Reducir movimiento.
 */
export function useMagnetismo() {
  useEffect(() => {
    if (!window.matchMedia(PUNTERO_FINO).matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let actual: HTMLElement | null = null;

    const soltar = () => {
      actual?.style.removeProperty("--mx");
      actual?.style.removeProperty("--my");
      actual = null;
    };

    const mover = (event: PointerEvent) => {
      const el = (event.target as Element | null)?.closest<HTMLElement>("[data-magnetico]") ?? null;
      if (el !== actual) soltar();
      if (!el) return;
      actual = el;
      const caja = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${(event.clientX - caja.left - caja.width / 2) * FUERZA}px`);
      el.style.setProperty("--my", `${(event.clientY - caja.top - caja.height / 2) * FUERZA}px`);
    };

    document.addEventListener("pointermove", mover, { passive: true });
    document.documentElement.addEventListener("pointerleave", soltar);
    return () => {
      document.removeEventListener("pointermove", mover);
      document.documentElement.removeEventListener("pointerleave", soltar);
    };
  }, []);
}
