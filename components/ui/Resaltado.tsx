"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

type Caja = { x: number; y: number; w: number; h: number };

/** La caja de un elemento dentro de su padre, para que el resaltado vaya hasta ahí. */
export function useResaltado() {
  const [caja, setCaja] = useState<Caja | null>(null);

  const medir = useCallback((el: HTMLElement) => {
    setCaja({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
  }, []);

  return { caja, medir, soltar: useCallback(() => setCaja(null), []) };
}

/** Un fondo que se desliza entre los ítems de una lista. El padre va `relative`. */
export default function Resaltado({ caja, className }: { caja: Caja | null; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute top-0 left-0 rounded-pill bg-fg/6 transition-[transform,width,height,opacity] duration-(--duration-entrada) ease-out-cubic",
        caja ? "opacity-100" : "opacity-0",
        className,
      )}
      style={
        caja ? { width: caja.w, height: caja.h, transform: `translate(${caja.x}px, ${caja.y}px)` } : undefined
      }
    />
  );
}
