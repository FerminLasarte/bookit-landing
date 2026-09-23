"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tag = "div" | "li" | "section" | "header" | "article";

/**
 * Aparición al entrar en pantalla, una sola vez. Decide *cuándo*; el cómo vive
 * en la utilidad `reveal` de `globals.css`, que con Reducir movimiento no hace
 * nada y deja el contenido visible desde el primer cuadro.
 */
export default function Reveal({
  children,
  index = 0,
  className,
  as: Component = "div",
  id,
}: {
  children: ReactNode;
  /** Posición dentro de un grupo, para escalonar de a 60 ms. */
  index?: number;
  className?: string;
  as?: Tag;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Lo que ya quedó arriba (scroll restaurado, ancla) también se muestra.
        if (entry && (entry.isIntersecting || entry.boundingClientRect.bottom < 0)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-64px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <Component
      id={id}
      ref={ref as never}
      className={cn("reveal", className)}
      style={{ "--reveal-i": index } as CSSProperties}
      data-revealed={visible ? "" : undefined}
    >
      {children}
    </Component>
  );
}
