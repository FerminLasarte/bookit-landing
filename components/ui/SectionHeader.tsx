import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";

/**
 * Título `display`, bajada y, si hay, los botones: centrados. El mismo tamaño
 * en todas las secciones. `escalonado` los hace aparecer uno detrás del otro
 * al entrar en pantalla.
 */
export default function SectionHeader({
  id,
  as: Heading = "h2",
  title,
  lede,
  actions,
  escalonado = false,
  className,
}: {
  id?: string;
  as?: "h1" | "h2";
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  escalonado?: boolean;
  className?: string;
}) {
  const pieza = (index: number, children: ReactNode) =>
    escalonado ? <Reveal index={index}>{children}</Reveal> : children;

  return (
    <div className={cn("mx-auto max-w-[52rem] text-center", className)}>
      {pieza(
        0,
        <Heading id={id} className="text-display font-bold break-words text-fg">
          {title}
        </Heading>,
      )}
      {lede && pieza(1, <p className="mx-auto mt-6 max-w-[46ch] text-pretty text-muted">{lede}</p>)}
      {actions &&
        pieza(
          2,
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">{actions}</div>,
        )}
    </div>
  );
}
