import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Rhythm = "normal" | "breath";
/** Color de fondo de la sección. `paper` = el fondo de la página, sin capa. */
type Tone = "paper" | "tint" | "canvas";

const rhythmClasses: Record<Rhythm, string> = {
  // Ritmo vertical estándar (§4.3)
  normal: "py-24 md:py-36",
  // La única sección de respiro, antes del CTA final
  breath: "py-32 md:py-44",
};

const toneClasses: Record<Tone, string> = {
  paper: "",
  // En oscuro va sólido sobre `ink-850`, no `ink-800/40`: al 40% sobre
  // `ink-950` la diferencia era de un par de puntos de luminancia y la
  // sección no se distinguía de la página.
  tint: "bg-cream-100 dark:bg-ink-850",
  /*
   * El lienzo de marca: `marcaProfunda`, el mismo en los dos temas. Es el
   * dispositivo que `docs/MARCA.md` describe en "Piezas fuera de la app", y la
   * página lo usa en el hero y en el cierre. Vive acá y no suelto en cada
   * sección porque ya iba por la tercera copia.
   */
  canvas: "bg-marca-profunda",
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
            "pointer-events-none absolute inset-0 -z-10",
            // El lienzo corta neto; el tinte entra y sale con degradé.
            tone === "canvas" ? "" : "fade-y",
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
