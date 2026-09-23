"use client";

import { useEffect, useRef, useState } from "react";
import Herramienta from "@/components/ui/Herramienta";
import Wordmark from "@/components/ui/Wordmark";
import { SPLASH_VISTO } from "@/lib/movimiento";
import { cn } from "@/lib/utils";
import { useIntro } from "./Movimiento";

const MITADES = [
  { parte: "arriba", className: "top-0" },
  { parte: "abajo", className: "bottom-0" },
] as const;

/**
 * El tijeretazo: el logo, una línea que lo corta de lado a lado y la pantalla
 * que se abre en dos. La coreografía vive en la utilidad `splash` de
 * `globals.css` y arranca con el primer cuadro, sin esperar a la hidratación;
 * esto sólo avisa cuándo empieza a abrirse, lo acelera si alguien toca algo y
 * lo saca cuando termina.
 *
 * Sale una vez por visita: el script de `layout.tsx` lo apaga antes de pintar
 * si ya se vio, y con Reducir movimiento no aparece.
 */
export default function Splash() {
  const ref = useRef<HTMLDivElement>(null);
  const { terminar } = useIntro();
  const [fuera, setFuera] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const abre = el?.querySelector('[data-parte="arriba"]')?.getAnimations()[0];
    if (!el || !abre) {
      terminar();
      setFuera(true);
      return;
    }

    try {
      sessionStorage.setItem(SPLASH_VISTO, "1");
    } catch {}

    const { delay } = abre.effect?.getComputedTiming() ?? {};
    if (Number(abre.currentTime) >= Number(delay)) terminar();

    const onStart = (event: AnimationEvent) => event.animationName === "splash-arriba" && terminar();
    const onEnd = (event: AnimationEvent) => event.target === el && setFuera(true);
    const acelerar = () => el.getAnimations({ subtree: true }).forEach((a) => (a.playbackRate = 4));
    const eventos = ["pointerdown", "keydown", "wheel", "touchmove"] as const;

    el.addEventListener("animationstart", onStart);
    el.addEventListener("animationend", onEnd);
    eventos.forEach((e) => window.addEventListener(e, acelerar, { once: true, passive: true }));
    return () => {
      el.removeEventListener("animationstart", onStart);
      el.removeEventListener("animationend", onEnd);
      eventos.forEach((e) => window.removeEventListener(e, acelerar));
    };
  }, [terminar]);

  if (fuera) return null;

  return (
    <div ref={ref} aria-hidden="true" className="splash fixed inset-0 z-100">
      {MITADES.map(({ parte, className }) => (
        <div key={parte} data-parte={parte} className={cn("absolute inset-x-0 h-1/2 overflow-hidden bg-page", className)}>
          {/* El logo entero en cada mitad, anclado al centro de la pantalla: cada una muestra su parte. */}
          <div className={cn("absolute inset-x-0 grid h-dvh place-items-center", className)}>
            <div data-parte="logo">
              <Wordmark className="h-14 md:h-16" />
            </div>
          </div>
        </div>
      ))}
      <div data-parte="corte" className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-accent" />
      <div data-parte="tijera" className="absolute top-1/2 left-0">
        <Herramienta tipo="tijera" className="-translate-x-full -translate-y-1/2 rotate-135" />
      </div>
    </div>
  );
}
