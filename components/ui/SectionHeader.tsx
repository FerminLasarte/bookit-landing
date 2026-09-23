import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Título `display` y bajada, centrados. El mismo tamaño en todas las secciones. */
export default function SectionHeader({
  id,
  as: Heading = "h2",
  title,
  lede,
  className,
}: {
  id?: string;
  as?: "h1" | "h2";
  title: ReactNode;
  lede?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-[52rem] text-center", className)}>
      <Heading id={id} className="text-display font-bold text-fg">
        {title}
      </Heading>
      {lede && <p className="mx-auto mt-6 max-w-[46ch] text-pretty text-muted">{lede}</p>}
    </div>
  );
}
