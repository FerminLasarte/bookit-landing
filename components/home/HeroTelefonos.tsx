"use client";

import { useEffect, type ReactNode } from "react";
import { m, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useIntro } from "@/components/layout/Movimiento";
import { PUNTERO_FINO, transicion } from "@/lib/movimiento";
import { cn } from "@/lib/utils";

/** Un teléfono de atrás: sale de detrás del central hacia su lado. */
const LADOS = {
  izquierda: { lado: -1, className: "left-0 lg:left-8" },
  derecha: { lado: 1, className: "right-0 lg:right-8" },
} as const;

/**
 * Las dos caras del turno: quien reserva al centro, el local detrás. Los de
 * atrás se abren en abanico cuando se va el splash y quedan un poco más
 * lentos que la página al scrollear; los tres se inclinan hacia el puntero.
 */
export default function HeroTelefonos({
  centro,
  izquierda,
  derecha,
}: {
  centro: ReactNode;
  izquierda: ReactNode;
  derecha: ReactNode;
}) {
  const { lista } = useIntro();
  const reducir = useReducedMotion();

  const { scrollY } = useScroll();
  const deriva = useTransform(scrollY, [0, 800], [0, reducir ? 0 : 120]);

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

  const atras = { izquierda, derecha };

  return (
    <div className="relative mx-auto mt-16 max-w-[56rem] perspective-[1400px] md:mt-20">
      {/* Sin `transform-3d`: el grupo gira como una lámina. Si los teléfonos compartieran
          el espacio 3D, Safari no sabría cuál va adelante donde se pisan y los haría saltar. */}
      <m.div style={{ rotateX, rotateY }} className="relative flex justify-center">
        {(Object.keys(LADOS) as (keyof typeof LADOS)[]).map((key) => {
          const { lado, className } = LADOS[key];
          return (
            <m.div
              key={key}
              initial="plegado"
              animate={lista ? "abierto" : "plegado"}
              variants={{
                plegado: { x: `${-lado * 60}%`, rotate: 0 },
                abierto: { x: 0, rotate: lado * 6 },
              }}
              transition={{ ...transicion.llegada, delay: 0.15 }}
              style={{ y: deriva }}
              className={cn("absolute top-20 hidden w-60 md:block", className)}
            >
              {atras[key]}
            </m.div>
          );
        })}
        <div className="relative w-[76vw] max-w-80">{centro}</div>
      </m.div>
    </div>
  );
}
