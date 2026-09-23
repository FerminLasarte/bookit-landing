import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tono = "arena" | "niebla" | "miel";

const tonos: Record<Tono, string> = {
  arena: "bg-tile-arena",
  niebla: "bg-tile-niebla",
  miel: "bg-tile-miel",
};

/**
 * La card del sitio: 24 px, un fondo plano de la paleta y la sombra de tile.
 * Sobre los tonos claros `muted` no llega a AA; el texto de adentro va en `fg`.
 */
export default function Superficie({
  tone = "arena",
  as: Component = "div",
  children,
  className,
}: {
  tone?: Tono;
  as?: "div" | "figure";
  children: ReactNode;
  className?: string;
}) {
  return (
    <Component className={cn("relative isolate overflow-hidden rounded-card shadow-tile", tonos[tone], className)}>
      {children}
    </Component>
  );
}
