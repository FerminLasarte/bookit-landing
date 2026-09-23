"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, m, useMotionValue } from "motion/react";
import Herramienta from "@/components/ui/Herramienta";
import { herramientaPorDefecto, herramientaPorSeccion } from "@/content/cursor";
import { duracion, PUNTERO_FINO, transicion } from "@/lib/movimiento";
import { useSeccionEnFoco } from "@/lib/useSeccionEnFoco";

const SECCIONES = Object.keys(herramientaPorSeccion) as (keyof typeof herramientaPorSeccion)[];
const TOCABLE = 'a, button, [role="tab"], label, summary, [data-magnetico]';
const ESCRIBIBLE = 'input:not([type="radio"], [type="checkbox"]), textarea, select, [contenteditable="true"]';

type Sobre = "nada" | "tocable" | "texto";

/** Grados que abre la tijera en cada caso: cerrada al apretar, bien abierta sobre algo que se toca. */
const APERTURA = { apretado: 0, tocable: 24, nada: 10 } as const;

/**
 * El cursor es una herramienta de peluquería o estética, y cambia con la
 * sección: tijera, peine, secador… La punta es el punto exacto del click,
 * así que sigue al puntero sin retraso. Sobre algo que se toca crece y la
 * tijera se abre; al apretar, corta. Sobre un campo de texto vuelve el
 * cursor del sistema. Sólo con mouse, y nunca en alto contraste forzado.
 */
export default function Cursor() {
  const [activo, setActivo] = useState(false);
  const [visible, setVisible] = useState(false);
  const [sobre, setSobre] = useState<Sobre>("nada");
  const [apretado, setApretado] = useState(false);
  const x = useMotionValue(-64);
  const y = useMotionValue(-64);

  const seccion = useSeccionEnFoco(SECCIONES);
  const tipo = seccion ? herramientaPorSeccion[seccion as keyof typeof herramientaPorSeccion] : herramientaPorDefecto;

  useEffect(() => {
    if (!window.matchMedia(`${PUNTERO_FINO} and (forced-colors: none)`).matches) return;
    const raiz = document.documentElement;
    raiz.dataset.cursor = "propio";
    setActivo(true);

    const mover = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };
    const encima = (event: PointerEvent) => {
      const el = event.target as Element;
      setSobre(el.closest(ESCRIBIBLE) ? "texto" : el.closest(TOCABLE) ? "tocable" : "nada");
    };
    const apretar = () => setApretado(true);
    const soltar = () => setApretado(false);
    const salir = () => setVisible(false);

    const eventos = [
      [document, "pointermove", mover],
      [document, "pointerover", encima],
      [document, "pointerdown", apretar],
      [document, "pointerup", soltar],
      [raiz, "pointerleave", salir],
    ] as const;
    eventos.forEach(([blanco, nombre, fn]) => blanco.addEventListener(nombre, fn as EventListener, { passive: true }));
    return () => {
      delete raiz.dataset.cursor;
      eventos.forEach(([blanco, nombre, fn]) => blanco.removeEventListener(nombre, fn as EventListener));
    };
  }, [x, y]);

  if (!activo) return null;

  const estado = apretado ? "apretado" : sobre === "tocable" ? "tocable" : "nada";

  return (
    <m.div
      aria-hidden="true"
      style={{ x, y }}
      animate={{ opacity: visible && sobre !== "texto" ? 1 : 0 }}
      transition={{ duration: duracion.chico }}
      className="pointer-events-none fixed top-0 left-0 z-200"
    >
      <AnimatePresence initial={false}>
        <m.div
          key={tipo}
          initial={{ scale: 0, rotate: -120 }}
          animate={{ scale: { apretado: 0.85, tocable: 1.2, nada: 1 }[estado], rotate: apretado ? -12 : 0 }}
          exit={{ scale: 0, rotate: 120 }}
          transition={transicion.resorte}
          style={{ "--apertura": APERTURA[estado] } as CSSProperties}
          className="absolute top-0 left-0 origin-top-left transition-[--apertura] duration-(--duration-chico) ease-out-cubic"
        >
          <Herramienta tipo={tipo} className="-translate-2" />
        </m.div>
      </AnimatePresence>
    </m.div>
  );
}
