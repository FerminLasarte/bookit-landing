"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Contenido que aparece (§8 del manual): sube 16px, 560ms, escalonado 60ms,
 * una vez y no en loop.
 *
 * El componente decide CUÁNDO; el cuánto y el cómo viven en la utilidad
 * `reveal` de `globals.css`, que lee `--duration-reveal` y `--ease-reveal`.
 * Antes el componente escribía `duration: 0.7` a mano y su propio docstring
 * citaba 700ms, mientras el token valía 560: era el D6 de la auditoría, y un
 * valor de movimiento que vive en JavaScript no puede ser el token del sitio.
 *
 * Con *Reducir movimiento* la utilidad no hace nada —ni siquiera el estado
 * inicial—, así que el contenido está visible desde el primer cuadro y no
 * depende de que el observer llegue a correr.
 */
export default function Reveal({
  children,
  id,
  /** Índice dentro de un grupo, para el escalonado de 60ms. */
  index = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  id?: string;
  index?: number;
  className?: string;
  as?: "div" | "li" | "section" | "header";
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        // O está entrando, o ya quedó arriba: si la página carga con el scroll
        // restaurado o en un ancla, lo que quedó por encima nunca entra a la
        // vista y se quedaría invisible.
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
          setVisible(true);
          obs.disconnect();
        }
      },
      // El mismo margen que tenía el `viewport` anterior: el bloque entra
      // cuando ya está 64px dentro de la pantalla, no al asomar.
      { rootMargin: "-64px", threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);

  return (
    <Tag
      id={id}
      ref={ref as never}
      className={cn("reveal", className)}
      style={{ "--reveal-i": index } as CSSProperties}
      data-revealed={visible ? "" : undefined}
    >
      {children}
    </Tag>
  );
}
