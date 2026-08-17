"use client";

import { useEffect, useRef } from "react";

/**
 * El destello ámbar del hero — el único de la página (§4.1).
 *
 * Sigue al puntero con inercia: en vez de quedar clavado al cursor, va detrás
 * con una interpolación suave, así se siente como luz y no como un elemento de UI.
 * Cuando el puntero sale de la sección vuelve a su posición de reposo.
 *
 * Detalles que importan:
 * - La posición de reposo la define el CSS (las clases del `div`), no el JS, así
 *   que el server render ya lo pinta en el lugar correcto y no depende de hidratar.
 * - Sólo anima con `transform`, que va al compositor: no dispara layout ni repaint.
 * - Se desactiva por completo con `prefers-reduced-motion` y en punteros gruesos
 *   (touch), donde seguir al dedo no aporta nada.
 */
export default function HeroGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    const section = glow?.parentElement;
    if (!glow || !section) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    // Posición de reposo: la que le dio el CSS antes de que toquemos el transform.
    const home = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    let running = false;

    const measureHome = () => {
      const sectionBox = section.getBoundingClientRect();
      const glowBox = glow.getBoundingClientRect();
      // Centro del destello relativo a la sección, descontando el transform actual.
      home.x = glowBox.left + glowBox.width / 2 - sectionBox.left - current.x;
      home.y = glowBox.top + glowBox.height / 2 - sectionBox.top - current.y;
    };

    const tick = () => {
      // Interpolación: 12% por frame llega en ~0,6s. Deja estela, no se siente lento.
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      glow.style.transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0)`;

      const settled =
        Math.abs(target.x - current.x) < 0.5 && Math.abs(target.y - current.y) < 0.5;
      if (settled) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      const box = section.getBoundingClientRect();
      target.x = event.clientX - box.left - home.x;
      target.y = event.clientY - box.top - home.y;
      start();
    };

    const onPointerLeave = () => {
      target.x = 0;
      target.y = 0;
      start();
    };

    measureHome();
    section.addEventListener("pointermove", onPointerMove);
    section.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", measureHome);

    return () => {
      cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", measureHome);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="pointer-events-none absolute top-[-160px] left-1/2 -ml-[280px] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(215,138,29,0.15)_0%,rgba(215,138,29,0)_70%)] will-change-transform md:left-[28%]"
    />
  );
}
