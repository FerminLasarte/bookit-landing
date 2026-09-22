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
  /*
   * La banda de sección. En oscuro va sólido sobre `ink-850`, no `ink-800/40`:
   * al 40% sobre `ink-950` la diferencia era de un par de puntos de luminancia
   * y la sección no se distinguía de la página.
   *
   * EN CLARO LA BANDA SE COMPONE EN TINTA PLENA. `cream-100` no sostiene texto
   * chico —`ink-500` 4,35:1, `amber-700` 4,38:1— y no se arregla aclarándola:
   * al valor que sostiene `ink-500` ya no se ve como banda. La regla, con sus
   * números, está escrita junto al token en `globals.css`; en una línea: acá
   * van `ink-900` y acentos a tamaño grande, y no van bajadas en `ink-500` ni
   * letra chica. Es el D2 de la auditoría, resuelto como estructura.
   *
   * No es una restricción sino una densidad: la banda es donde la página habla
   * a tinta plena, y el papel es donde tiene bajadas y letra chica. El contrato
   * lo habilita — "que dos secciones contiguas tengan densidades distintas a
   * propósito". En oscuro la regla no aplica: `bone-300` sobre `ink-850` da
   * 10,14:1.
   */
  tint: "bg-cream-100 dark:bg-ink-850",
  /*
   * El lienzo de marca: `marcaProfunda`, el mismo en los dos temas. Es el
   * dispositivo que `docs/MARCA.md` describe en "Piezas fuera de la app", y la
   * página lo usa en el hero y en el cierre. Vive acá y no suelto en cada
   * sección porque ya iba por la tercera copia.
   */
  /*
   * En oscuro lleva además un filo arriba y abajo. Todo el rango de superficies
   * oscuras del manual vive entre `marca-profunda` (#140E03) e `ink-800`
   * (#24211E): 1,2:1 de punta a punta. Dentro de ese rango, ningún relleno
   * separa un lienzo de la página —el par real da 1,036:1— y bajar el lienzo
   * en oscuro violaría el manual, que fija que `marcaProfunda` no cambia con
   * el tema. El borde no toca ningún color canónico y rinde 1,24:1 al 10%, más
   * que cualquier escalón de relleno disponible (el mejor es `ink-800` sobre
   * `ink-950`, 1,157:1). §3 bis lo había puesto al 12% (1,32:1); el 10% es el
   * valor del manual y sigue cumpliendo el criterio con el que se eligió, así
   * que D4 cierra sin excepciones. En claro no hace falta: ahí el par da 17:1.
   */
  canvas: "bg-marca-profunda dark:border-y dark:border-white/10",
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
      // El nav lee esto para saber cuándo tiene un lienzo de marca detrás.
      data-canvas={tone === "canvas" ? "" : undefined}
      aria-labelledby={labelledBy}
      className={cn("relative isolate", rhythmClasses[rhythm], className)}
    >
      {tone !== "paper" && (
        <div
          aria-hidden="true"
          data-canvas-capa
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
