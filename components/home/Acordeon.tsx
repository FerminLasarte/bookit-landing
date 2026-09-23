"use client";

import { useId, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import Plegable from "@/components/ui/Plegable";
import { cn } from "@/lib/utils";

/** Preguntas entre filetes: abrir una cierra la anterior, y las dos se mueven a la vez. */
export default function Acordeon({ items }: { items: readonly { pregunta: string; respuesta: ReactNode }[] }) {
  const id = useId();
  const [abierta, setAbierta] = useState<number | null>(null);

  return (
    <ul className="border-t border-line">
      {items.map((item, i) => {
        const estaAbierta = i === abierta;
        return (
          <li key={item.pregunta} className="border-b border-line">
            <h3>
              <button
                type="button"
                id={`${id}-pregunta-${i}`}
                aria-expanded={estaAbierta}
                aria-controls={`${id}-respuesta-${i}`}
                onClick={() => setAbierta(estaAbierta ? null : i)}
                className="ring-focus group flex w-full items-start justify-between gap-6 rounded-card py-6 text-left"
              >
                <span className="text-title font-semibold text-fg">{item.pregunta}</span>
                <Plus
                  className={cn(
                    "mt-1 size-5 shrink-0 text-muted transition-[rotate,color] duration-(--duration-entrada) ease-out-cubic group-hover:text-fg",
                    estaAbierta && "rotate-45 text-fg",
                  )}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <Plegable
              abierto={estaAbierta}
              id={`${id}-respuesta-${i}`}
              role="region"
              aria-labelledby={`${id}-pregunta-${i}`}
              className="pr-11 pb-7 text-pretty text-muted"
            >
              {item.respuesta}
            </Plegable>
          </li>
        );
      })}
    </ul>
  );
}
