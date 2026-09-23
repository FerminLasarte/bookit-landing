import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TileTone = "arena" | "niebla" | "miel";

const tones: Record<TileTone, string> = {
  arena: "bg-tile-arena",
  niebla: "bg-tile-niebla",
  miel: "bg-tile-miel",
};

/**
 * Un medio sobre un fondo plano, con título y bajada debajo. El medio se
 * recorta contra la card: lo que se asoma del borde es a propósito.
 */
export default function Tile({
  tone = "arena",
  title,
  body,
  aside,
  bleed = false,
  children,
  className,
  mediaClassName,
}: {
  tone?: TileTone;
  title: ReactNode;
  body?: ReactNode;
  /** Algo que acompaña al título en la misma línea, como un `Badge`. */
  aside?: ReactNode;
  /** El medio arranca arriba, centrado, y sigue de largo por el borde de abajo. */
  bleed?: boolean;
  children: ReactNode;
  className?: string;
  mediaClassName?: string;
}) {
  return (
    <article className={cn("text-center", className)}>
      <div
        className={cn(
          "relative isolate overflow-hidden rounded-card shadow-tile",
          tones[tone],
          bleed && "flex aspect-4/3 items-start justify-center pt-10 md:pt-12",
          mediaClassName,
        )}
      >
        {children}
      </div>
      <h3 className="mt-7 flex items-center justify-center gap-3 text-title font-bold text-fg">
        {title}
        {aside}
      </h3>
      {body && <p className="mx-auto mt-2 max-w-[38ch] text-pretty text-small text-muted">{body}</p>}
    </article>
  );
}
