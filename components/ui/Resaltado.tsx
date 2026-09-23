"use client";

import { m } from "motion/react";
import { transicion } from "@/lib/movimiento";
import { cn } from "@/lib/utils";

/**
 * Un fondo que se desliza entre los ítems de una lista. Va adentro del ítem
 * activo (que es `relative isolate`); al pasar a otro, `layoutId` lo lleva
 * de uno al otro. `grupo` tiene que ser único en la página.
 */
export default function Resaltado({ grupo, className }: { grupo: string; className?: string }) {
  return (
    <m.span
      layoutId={grupo}
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transicion.entrada}
      className={cn("absolute inset-0 -z-10 rounded-pill bg-fg/6", className)}
    />
  );
}
