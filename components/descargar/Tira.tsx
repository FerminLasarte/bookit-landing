"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { m, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { transicion } from "@/lib/movimiento";
import { cn } from "@/lib/utils";

/**
 * Una fila de pantallas que corre de costado mientras la página baja: entera
 * de punta a punta en el tramo del medio de la pantalla. Con Reducir
 * movimiento no corre sola y se recorre a mano.
 */
export default function Tira({
  pantallas,
  etiqueta,
  className,
}: {
  pantallas: readonly ReactNode[];
  /** El nombre de la tira cuando se recorre a mano. */
  etiqueta: string;
  className?: string;
}) {
  const marco = useRef<HTMLDivElement>(null);
  const fila = useRef<HTMLDivElement>(null);
  const recorrido = useRef(0);
  const reducir = useReducedMotion();

  // Lo que la fila sobra del marco: lo que tiene que correr.
  useEffect(() => {
    const medir = () => {
      if (marco.current && fila.current) recorrido.current = fila.current.scrollWidth - marco.current.clientWidth;
    };
    medir();
    const observador = new ResizeObserver(medir);
    if (marco.current) observador.observe(marco.current);
    return () => observador.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: marco, offset: ["start end", "end start"] });
  const avance = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);
  const x = useSpring(
    useTransform(avance, (t) => -t * Math.max(recorrido.current, 0)),
    transicion.suave,
  );

  return (
    <div
      ref={marco}
      className={cn(reducir ? "overflow-x-auto" : "overflow-hidden", className)}
      {...(reducir && { tabIndex: 0, role: "region", "aria-label": etiqueta })}
    >
      <m.div ref={fila} style={reducir ? undefined : { x }} className="flex w-max items-start gap-6 px-10 pt-12 lg:gap-8">
        {pantallas.map((pantalla, i) => (
          // Una arriba y una abajo, para que la fila no sea una regla.
          <div key={i} className={cn("w-44 shrink-0 lg:w-56", i % 2 === 1 && "mt-16")}>
            {pantalla}
          </div>
        ))}
      </m.div>
    </div>
  );
}
