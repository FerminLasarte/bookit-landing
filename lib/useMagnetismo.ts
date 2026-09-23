"use client";

import { useEffect } from "react";
import { PUNTERO_FINO } from "./movimiento";

/** Qué fracción de la distancia al centro sigue el elemento. */
const FUERZA = 0.3;
/** Cuánto se puede alejar el puntero de la caja antes de soltarla, en px. */
const MARGEN = 12;

/** La caja del elemento sin el desplazamiento que le pone el imán. */
function cajaEnReposo(el: HTMLElement) {
  const caja = el.getBoundingClientRect();
  const [dx = 0, dy = 0] = getComputedStyle(el).translate.split(" ").map((v) => parseFloat(v) || 0);
  return new DOMRect(caja.x - dx, caja.y - dy, caja.width, caja.height);
}

/**
 * Todo lo que lleva `data-magnetico` se corre hacia el puntero mientras está
 * encima, y vuelve al soltarlo. Un solo listener para todo el sitio; el cómo
 * se mueve vive en la utilidad `magnetico`. Sólo con mouse y sin Reducir movimiento.
 *
 * Se mide la caja una vez, al agarrar, y en reposo: medirla ya corrida hace
 * que el imán se persiga a sí mismo y tiemble en los bordes.
 */
export function useMagnetismo() {
  useEffect(() => {
    if (!window.matchMedia(PUNTERO_FINO).matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let actual: { el: HTMLElement; caja: DOMRect } | null = null;

    const soltar = () => {
      actual?.el.style.removeProperty("--mx");
      actual?.el.style.removeProperty("--my");
      actual = null;
    };

    const mover = (event: PointerEvent) => {
      const { clientX: x, clientY: y } = event;

      if (actual) {
        const { caja } = actual;
        const cerca =
          x >= caja.left - MARGEN && x <= caja.right + MARGEN && y >= caja.top - MARGEN && y <= caja.bottom + MARGEN;
        if (!cerca) soltar();
      }

      if (!actual) {
        const el = (event.target as Element | null)?.closest<HTMLElement>("[data-magnetico]");
        if (!el) return;
        actual = { el, caja: cajaEnReposo(el) };
      }

      const { el, caja } = actual;
      el.style.setProperty("--mx", `${(x - caja.left - caja.width / 2) * FUERZA}px`);
      el.style.setProperty("--my", `${(y - caja.top - caja.height / 2) * FUERZA}px`);
    };

    // Al scrollear la caja medida deja de valer.
    const eventos = [
      [document, "pointermove", mover],
      [document.documentElement, "pointerleave", soltar],
      [window, "scroll", soltar],
    ] as const;
    eventos.forEach(([blanco, nombre, fn]) => blanco.addEventListener(nombre, fn as EventListener, { passive: true }));
    return () => {
      soltar();
      eventos.forEach(([blanco, nombre, fn]) => blanco.removeEventListener(nombre, fn as EventListener));
    };
  }, []);
}
