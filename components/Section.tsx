import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Rhythm = "normal" | "breath";

const rhythmClasses: Record<Rhythm, string> = {
  // Ritmo vertical estándar (§4.3)
  normal: "py-24 md:py-36",
  // La única sección de respiro, antes del CTA final
  breath: "py-32 md:py-44",
};

/**
 * Envoltorio de sección: aplica el ritmo vertical y el container.
 * No decide colores — eso lo hace cada sección.
 */
export default function Section({
  id,
  children,
  rhythm = "normal",
  className = "",
  labelledBy,
}: {
  id?: string;
  children: ReactNode;
  rhythm?: Rhythm;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn(rhythmClasses[rhythm], className)}>
      <div className="wrap">{children}</div>
    </section>
  );
}
