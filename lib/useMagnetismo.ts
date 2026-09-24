"use client";

import { useEffect } from "react";
import { animate, motionValue, type MotionValue, type Transition } from "motion/react";
import { PUNTERO_FINO, transicion } from "./movimiento";

/** Qué fracción de la distancia al centro sigue el elemento. */
const FUERZA = 0.3;
/** Cuánto se puede alejar el puntero de la caja antes de soltarla, en px. */
const MARGEN = 12;

type Iman = { x: MotionValue<number>; y: MotionValue<number> };
const imanes = new WeakMap<HTMLElement, Iman>();

/** El desplazamiento de un elemento, como dos valores que se pintan en su `translate`. */
function imanDe(el: HTMLElement): Iman {
  let iman = imanes.get(el);
  if (!iman) {
    const x = motionValue(0);
    const y = motionValue(0);
    const pintar = () => (el.style.translate = `${x.get()}px ${y.get()}px`);
    x.on("change", pintar);
    y.on("change", pintar);
    iman = { x, y };
    imanes.set(el, iman);
  }
  return iman;
}

/** Un resorte que, al cambiar de destino, sigue con la velocidad que traía. */
function llevar(el: HTMLElement, dx: number, dy: number, transition: Transition) {
  const { x, y } = imanDe(el);
  animate(x, dx, transition);
  animate(y, dy, transition);
}

/**
 * Todo lo que lleva `data-magnetico` se corre hacia el puntero mientras está
 * encima, y vuelve con un rebote al soltarlo. Un solo listener para todo el
 * sitio. Sólo con mouse y sin Reducir movimiento.
 *
 * La caja se mide una vez, al agarrar, y en reposo: medirla ya corrida hace
 * que el imán se persiga a sí mismo. Y va con resortes y no con una
 * transición de CSS, que en cada movimiento del puntero arranca de cero y
 * pierde la velocidad: eso era el temblor.
 */
export function useMagnetismo() {
  useEffect(() => {
    if (!window.matchMedia(PUNTERO_FINO).matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let actual: { el: HTMLElement; caja: DOMRect } | null = null;

    const soltar = () => {
      if (actual) llevar(actual.el, 0, 0, transicion.llegada);
      actual = null;
    };

    const mover = (event: PointerEvent) => {
      const { clientX: px, clientY: py } = event;

      if (actual) {
        const { caja } = actual;
        const cerca =
          px >= caja.left - MARGEN && px <= caja.right + MARGEN && py >= caja.top - MARGEN && py <= caja.bottom + MARGEN;
        if (!cerca) soltar();
      }

      if (!actual) {
        const el = (event.target as Element | null)?.closest<HTMLElement>("[data-magnetico]");
        if (!el) return;
        const { x, y } = imanDe(el);
        const caja = el.getBoundingClientRect();
        actual = { el, caja: new DOMRect(caja.x - x.get(), caja.y - y.get(), caja.width, caja.height) };
      }

      const { el, caja } = actual;
      llevar(
        el,
        (px - caja.left - caja.width / 2) * FUERZA,
        (py - caja.top - caja.height / 2) * FUERZA,
        transicion.resorte,
      );
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
