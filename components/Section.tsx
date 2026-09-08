import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Rhythm = "normal" | "breath";
/** Color de fondo de la sección. `paper` = el fondo de la página, sin capa. */
type Tone = "paper" | "tint";

const rhythmClasses: Record<Rhythm, string> = {
  // Ritmo vertical estándar (§4.3)
  normal: "py-24 md:py-36",
  // La única sección de respiro, antes del CTA final
  breath: "py-32 md:py-44",
};

const toneClasses: Record<Tone, string> = {
  paper: "",
  tint: "bg-cream-100 dark:bg-ink-800/40",
};

/**
 * Envoltorio de sección: aplica el ritmo vertical y el container.
 *
 * El color va en una capa aparte, detrás del contenido, con `fade-y`: el fondo
 * entra y sale con un degradé en vez de cortar con una línea recta. Por eso el
 * color no puede ir en el `<section>` — la máscara se heredaría al texto.
 */
export default function Section({
  id,
  children,
  rhythm = "normal",
  tone = "paper",
  className = "",
  labelledBy,
}: {
  id?: string;
  children: ReactNode;
  rhythm?: Rhythm;
  tone?: Tone;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("relative isolate", rhythmClasses[rhythm], className)}
    >
      {tone !== "paper" && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 fade-y",
            // El degradé arranca donde termina el padding: el texto nunca cae
            // sobre la parte semitransparente.
            rhythm === "breath" ? "[--fade-y:8rem]" : "[--fade-y:6rem]",
            toneClasses[tone],
          )}
        />
      )}
      <div className="wrap">{children}</div>
    </section>
  );
}
