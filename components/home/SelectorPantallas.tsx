"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Plegable from "@/components/ui/Plegable";
import Resaltado from "@/components/ui/Resaltado";
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
 * muestra su bajada; las demás, sólo el título. Con el mouse, pasar por una
 * pestaña ya asoma su pantalla. En móvil el tile va arriba.
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
  const [asomada, setAsomada] = useState<number | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const visible = asomada ?? activa;

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
        onPointerLeave={() => setAsomada(null)}
        className="flex flex-col gap-1"
      >
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
              onPointerEnter={(event) => event.pointerType === "mouse" && setAsomada(i)}
              className="ring-focus group relative isolate rounded-card px-6 py-4 text-left"
            >
              {esActiva && <Resaltado grupo={`${id}-resaltado`} className="rounded-card bg-surface shadow-tile" />}
              <span
                id={`${id}-titulo-${i}`}
                className={cn(
                  "block text-title font-bold transition-colors duration-(--duration-chico)",
                  esActiva ? "text-fg" : "text-muted group-hover:text-fg",
                )}
              >
                {item.title}
              </span>
              <Plegable as="span" abierto={esActiva} className="pt-1.5 text-pretty text-small text-muted">
                <span id={`${id}-bajada-${i}`}>{item.body}</span>
              </Plegable>
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
          {/* Todas en la misma celda: la visible sube a su lugar, las demás esperan abajo. */}
          <div className="grid w-[55%] max-w-80">
            {pantallas.map((pantalla, i) => (
              <div
                key={items[i]?.title}
                aria-hidden={i !== visible}
                className={cn(
                  "[grid-area:1/1] transition-[opacity,translate,scale] duration-(--duration-entrada) ease-out-cubic",
                  i === visible ? "opacity-100" : "translate-y-3 scale-98 opacity-0",
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
