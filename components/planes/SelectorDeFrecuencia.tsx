"use client";

import { frecuencias } from "@/content/planes";
import type { Frecuencia } from "@/lib/planes";
import { cn } from "@/lib/utils";

/*
 * Mensual o anual: el `SegmentedSelector` de la app, una píldora con la
 * opción elegida flotando adentro. El texto apagado va en `muted` entero y no
 * al 75 % como en la app: así llega a AA.
 */
export default function SelectorDeFrecuencia({
  valor,
  onCambiar,
}: {
  valor: Frecuencia;
  onCambiar: (frecuencia: Frecuencia) => void;
}) {
  const indice = frecuencias.findIndex((f) => f.valor === valor);

  return (
    <div
      role="radiogroup"
      aria-label="Frecuencia"
      className="relative mx-auto grid h-[2.9rem] w-full max-w-[22.9rem] grid-cols-2 rounded-pill bg-fg/3.5 p-[0.37rem]"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-[0.37rem] left-[0.37rem] w-[calc(50%-0.37rem)] rounded-pill bg-surface shadow-[0_2px_10px_var(--plan-sombra)] transition-transform duration-[260ms] ease-out-cubic"
        style={{ transform: `translateX(${indice * 100}%)` }}
      />
      {frecuencias.map((f) => {
        const activo = f.valor === valor;
        return (
          <button
            key={f.valor}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onCambiar(f.valor)}
            className={cn(
              "ring-focus relative rounded-pill text-[0.95rem] transition-colors duration-[260ms]",
              activo ? "font-semibold text-fg" : "font-medium text-muted",
            )}
          >
            {f.rotulo}
          </button>
        );
      })}
    </div>
  );
}
