"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Resaltado, { useResaltado } from "@/components/ui/Resaltado";
import Tile from "@/components/ui/Tile";
import { cn } from "@/lib/utils";

const TECLAS: Record<string, (i: number, total: number) => number> = {
  ArrowDown: (i, total) => (i + 1) % total,
  ArrowRight: (i, total) => (i + 1) % total,
  ArrowUp: (i, total) => (i - 1 + total) % total,
  ArrowLeft: (i, total) => (i - 1 + total) % total,
  Home: () => 0,
  End: (_, total) => total - 1,
};

/**
 * Pestañas verticales que cambian la pantalla de un tile. La pestaña activa
 * muestra su bajada; las demás, sólo el título. En móvil el tile va arriba.
 */
export default function SelectorPantallas({
  items,
  pantallas,
}: {
  items: readonly { title: string; body: string }[];
  /** Una pantalla por ítem, en el mismo orden. */
  pantallas: readonly ReactNode[];
}) {
  const id = useId();
  const [activa, setActiva] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const { caja, medir } = useResaltado();

  // El resaltado sigue a la pestaña activa mientras se abre y cuando cambia el ancho.
  useEffect(() => {
    const el = tabs.current[activa];
    if (!el) return;
    medir(el);
    const observer = new ResizeObserver(() => medir(el));
    observer.observe(el);
    return () => observer.disconnect();
  }, [activa, medir]);

  const onKeyDown = (event: KeyboardEvent) => {
    const siguiente = TECLAS[event.key]?.(activa, items.length);
    if (siguiente === undefined) return;
    event.preventDefault();
    setActiva(siguiente);
    tabs.current[siguiente]?.focus();
  };

  return (
    <div className="mx-auto grid max-w-[36rem] gap-10 lg:max-w-[66rem] lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16">
      <div
        role="tablist"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="relative flex flex-col gap-1"
      >
        <Resaltado caja={caja} className="rounded-card bg-surface shadow-tile" />
        {items.map((item, i) => {
          const esActiva = i === activa;
          return (
            <button
              key={item.title}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={esActiva}
              aria-controls={`${id}-panel`}
              aria-labelledby={`${id}-titulo-${i}`}
              aria-describedby={esActiva ? `${id}-bajada-${i}` : undefined}
              tabIndex={esActiva ? 0 : -1}
              onClick={() => setActiva(i)}
              className="ring-focus relative rounded-card px-6 py-4 text-left"
            >
              <span
                id={`${id}-titulo-${i}`}
                className={cn(
                  "block text-title font-bold transition-colors duration-(--duration-chico)",
                  esActiva ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.title}
              </span>
              <span
                aria-hidden={!esActiva}
                className={cn(
                  "grid transition-[grid-template-rows] duration-(--duration-entrada) ease-out-cubic",
                  esActiva ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <span className="overflow-hidden">
                  <span id={`${id}-bajada-${i}`} className="block pt-1.5 text-pretty text-small text-muted">
                    {item.body}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${activa}`}
        className="order-first lg:order-none"
      >
        <Tile bleed tone="niebla">
          {/* Todas en la misma celda: la activa aparece encima de las demás. */}
          <div className="grid w-[55%] max-w-80">
            {pantallas.map((pantalla, i) => (
              <div
                key={items[i]?.title}
                aria-hidden={i !== activa}
                className={cn(
                  "[grid-area:1/1] transition-[opacity,transform] duration-(--duration-tab) ease-out-cubic",
                  i === activa ? "opacity-100" : "translate-y-1.5 opacity-0",
                )}
              >
                {pantalla}
              </div>
            ))}
          </div>
        </Tile>
      </div>
    </div>
  );
}
