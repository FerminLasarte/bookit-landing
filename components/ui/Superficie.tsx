import type { HTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

export type Tono = "arena" | "niebla" | "miel" | "surface";

/*
 * Los tres tonos de tile muestran y llevan sombra. `surface` es lo que se toma
 * —un formulario, un código—, y eso lleva borde en vez de sombra: MARCA,
 * Divergencia 7.
 */
const tonos: Record<Tono, string> = {
  arena: "bg-tile-arena shadow-tile",
  niebla: "bg-tile-niebla shadow-tile",
  miel: "bg-tile-miel shadow-tile",
  surface: "border border-line bg-surface [--ring-hueco:var(--surface)]",
};

/**
 * La card del sitio: 24 px y un fondo plano de la paleta.
 * Sobre los tonos claros de tile `muted` no llega a AA; el texto de adentro va en `fg`.
 */
export default function Superficie({
  tone = "arena",
  as: Component = "div",
  children,
  className,
  ref,
  ...props
}: {
  tone?: Tono;
  as?: "div" | "figure" | "button";
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "children">) {
  return (
    <Component
      ref={ref as never}
      {...(Component === "button" && { type: "button" as const })}
      {...props}
      className={cn("relative isolate overflow-hidden rounded-card", tonos[tone], className)}
    >
      {children}
    </Component>
  );
}
