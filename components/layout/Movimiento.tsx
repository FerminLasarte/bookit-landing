"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { LazyMotion, MotionConfig } from "motion/react";
import { useMagnetismo } from "@/lib/useMagnetismo";

const cargarFunciones = () => import("@/lib/motion-funciones").then((m) => m.default);

/** Si el splash ya se fue y la página puede arrancar sus entradas. */
const IntroContext = createContext<{ lista: boolean; terminar: () => void }>({
  lista: true,
  terminar: () => {},
});

export const useIntro = () => useContext(IntroContext);

/**
 * La base del movimiento del sitio. `reducedMotion="user"` apaga las
 * transformaciones de toda animación de `motion` cuando el sistema pide
 * Reducir movimiento; `strict` obliga a usar `m.*`, que no trae el motor entero.
 */
export default function Movimiento({ children }: { children: ReactNode }) {
  useMagnetismo();
  const [lista, setLista] = useState(false);
  const intro = useMemo(() => ({ lista, terminar: () => setLista(true) }), [lista]);

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={cargarFunciones} strict>
        <IntroContext value={intro}>{children}</IntroContext>
      </LazyMotion>
    </MotionConfig>
  );
}
