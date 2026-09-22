import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Rhythm = "normal" | "breath" | "apoyo";
/** Color de fondo de la sección. `paper` = el fondo de la página, sin capa. */
type Tone = "paper" | "tint" | "canvas";

const rhythmClasses: Record<Rhythm, string> = {
  // Ritmo vertical estándar (§4.3)
  normal: "py-24 md:py-36",
  // La única sección de respiro, antes del CTA final
  breath: "py-32 md:py-44",
  /*
   * La sección que arranca PEGADA al borde de la pieza de arriba y se queda
   * con el aire de las dos. Existe por el lavado cálido: un degradé anclado en
   * una esquina se corta en el borde que la define, así que su canto de arriba
   * tiene que coincidir con un canto que ya exista —en la home, el borde de
   * abajo del lienzo del hero—. Para eso la pieza de arriba entrega su padding
   * y la sección lo recibe, y el hueco entre las dos sigue siendo mayor al
   * doble del hueco interno que pide el manual.
   */
  apoyo: "pt-32 pb-24 md:pt-48 md:pb-36",
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
   * El lienzo no se pinta acá: es un OBJETO, no una capa. Ver `LIENZO` abajo.
   * Queda vacío para que la tabla siga teniendo los tres tonos y nadie busque
   * el lienzo entre las capas de fondo.
   */
  canvas: "",
};

/**
 * EL LIENZO DE MARCA ES UN OBJETO CON ESQUINAS, NO UNA BANDA A SANGRE.
 *
 * Es la respuesta a la pregunta que la §3 nonies dejó abierta — "si el hero es
 * una card con esquinas, `#puntos` y `#cierre` tienen que decidir si
 * acompañan"— y es que sí. Con esto la página queda con una gramática de dos
 * palabras, y las dos se pueden enunciar:
 *
 *   El color que SE DISUELVE es un campo: va a sangre y entra y sale con
 *   `fade-y`. En la página eso es el tinte de sección.
 *
 *   El color que CORTA es un objeto: vive dentro del `wrap`, tiene esquinas y
 *   se apoya sobre la página. En la página eso son los tres `marca-profunda`.
 *
 * Y resuelve de paso el D10 de la auditoría —"el final de la página es un solo
 * bloque oscuro"—, que no era un problema de color sino de geometría: `#cierre`
 * y el footer daban 1,03:1 y eran dos bandas a sangre pegadas. Con el cierre
 * hecho objeto, el footer pasa a ser el piso sobre el que se apoya, y lo que
 * los separa deja de ser un filete: son los márgenes laterales de la card.
 *
 * El filo sólo en oscuro. Todo el rango de superficies oscuras del manual vive
 * entre `marca-profunda` (#140E03) e `ink-800` (#24211E): 1,2:1 de punta a
 * punta, y contra `ink-950` el lienzo da **1,036:1**. Dentro de ese rango
 * ningún relleno lo separa de la página, y bajarlo violaría el manual, que fija
 * que `marcaProfunda` no cambia con el tema. El borde al 10% compone 1,236:1
 * contra `ink-950`, más que el mejor escalón de relleno disponible (`ink-800`
 * sobre `ink-950`, 1,157:1). En claro no hace falta: ahí el par da **18,69:1**.
 *
 * El padding es el del hero, que es el otro lienzo de la página y no pasa por
 * acá porque tiene su propio alto de pantalla. Los tres miden lo mismo por
 * dentro.
 */
const LIENZO =
  "relative isolate overflow-hidden rounded-card bg-marca-profunda px-5 py-14 md:px-10 md:py-24 dark:border dark:border-white/10";

/**
 * Envoltorio de sección: aplica el ritmo vertical y el container.
 *
 * DOS FORMAS, y el `tone` elige. El **tinte** es un campo: va a sangre, en una
 * capa aparte detrás del contenido, y entra y sale con `fade-y` en vez de
 * cortar con una línea recta — por eso el color no puede ir en el `<section>`,
 * la máscara se heredaría al texto. El **lienzo** es un objeto: vive dentro del
 * `wrap`, tiene esquinas y corta neto. Ver `LIENZO` arriba.
 *
 * El ritmo vertical significa lo mismo en los dos casos, pero cae en lugares
 * distintos: en el tinte es el aire entre el borde de la banda y su texto; en
 * el lienzo es el hueco de página que queda ALREDEDOR de la card, porque el
 * aire de adentro lo pone la card y es el mismo que el del hero.
 */
export default function Section({
  id,
  children,
  rhythm = "normal",
  tone = "paper",
  lavado = false,
  className = "",
  labelledBy,
}: {
  id?: string;
  children: ReactNode;
  rhythm?: Rhythm;
  tone?: Tone;
  /**
   * El lavado cálido detrás del encabezado — el dispositivo que la app apoya
   * bajo cada título y que la Fase B0 construyó para que el modo claro se lea
   * como Bookit. Va acá y no suelto en una sección porque su REGLA DE
   * COLOCACIÓN es la misma que la del tinte: quien elige la superficie es
   * quien tiene que leerla.
   *
   * EN CLARO, SOBRE LA PARTE FUERTE VAN `ink-900` Y LOS PASOS DE DISPLAY
   * (10,73:1). No van la bajada en `ink-500` (3,53:1) ni un rótulo a tamaño de
   * lectura. El alcance es `--lavado-y` —24rem por default, pisable por clase—,
   * así que en la práctica la regla se cumple dejando el texto chico por debajo
   * de ese alcance; los números están junto al token en `globals.css`.
   *
   * En oscuro casi no restringe: `bone-300` sobre el pico da 5,60:1.
   */
  lavado?: boolean;
  className?: string;
  labelledBy?: string;
}) {
  /*
   * `data-canvas` va en la CARD, no en la sección. El nav lo lee para saber si
   * tiene una superficie oscura detrás del header, y la sección es más alta que
   * la card: marcarla ahí vestiría el lockup de claro mientras por detrás
   * todavía hay página. Es lo mismo que hace el hero con su lienzo.
   */
  if (tone === "canvas") {
    return (
      <section
        id={id}
        aria-labelledby={labelledBy}
        className={cn("relative isolate", rhythmClasses[rhythm], className)}
      >
        <div className="wrap">
          <div data-canvas className={LIENZO}>
            {children}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("relative isolate", rhythmClasses[rhythm], className)}
    >
      {(tone !== "paper" || lavado) && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -z-10",
            // El lavado se apoya sobre el color que la sección ya tenga; en
            // `paper` eso es la página pelada, que es como lo hace la app.
            lavado && "lavado",
            /*
             * El lienzo corta neto; el tinte entra y sale con degradé. El
             * lavado tampoco lleva máscara, y no es un detalle: `fade-y`
             * difumina justo el borde de ARRIBA, que es donde el lavado nace,
             * así que lo apagaría exactamente donde tiene que verse.
             */
            tone === "tint" && "fade-y",
            // El degradé arranca donde termina el padding: el texto nunca cae
            // sobre la parte semitransparente.
            tone === "tint" && (rhythm === "breath" ? "[--fade-y:8rem]" : "[--fade-y:6rem]"),
            toneClasses[tone],
          )}
        />
      )}
      <div className="wrap">{children}</div>
    </section>
  );
}
