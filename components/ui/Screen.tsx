import { getImageProps } from "next/image";
import { capturas, type CapturaId } from "@/content/capturas";
import { cn } from "@/lib/utils";

/** Alto original de las capturas. Un recorte se expresa en esos píxeles. */
const ALTO = 2622;

/**
 * Una pantalla de la app en un marco, con su versión clara y oscura: el
 * navegador baja sólo la del tema activo. El marco sigue la fórmula
 * concéntrica del manual: 24 afuera = 16 adentro + 8 de marco.
 */
export default function Screen({
  id,
  sizes,
  crop,
  eager = false,
  className,
}: {
  id: CapturaId;
  /** El `sizes` de la imagen: cuánto ocupa en cada ancho. */
  sizes: string;
  /** Qué franja vertical mostrar, en píxeles de la captura. Por defecto, entera. */
  crop?: { top: number; bottom: number };
  /** Para la captura que está sobre el pliegue. */
  eager?: boolean;
  className?: string;
}) {
  const { claro, oscuro, alt } = capturas[id];
  const { top, bottom } = crop ?? { top: 0, bottom: ALTO };
  const sobrante = ALTO - (bottom - top);
  const posicion = sobrante > 0 ? (top / sobrante) * 100 : 0;

  // Dentro de un <picture> el navegador baja sólo la fuente elegida, así que
  // `eager` no trae las dos versiones.
  const carga = eager ? ({ loading: "eager", fetchPriority: "high" } as const) : {};
  const common = { alt, fill: true, sizes, ...carga };
  const { props: img } = getImageProps({ ...common, src: claro });
  const { props: dark } = getImageProps({ ...common, src: oscuro });

  return (
    <div className={cn("rounded-card bg-surface p-2 shadow-tile", className)}>
      <div
        className="relative overflow-hidden rounded-toast"
        style={{ aspectRatio: `${claro.width} / ${bottom - top}` }}
      >
        <picture>
          <source media="(prefers-color-scheme: dark)" srcSet={dark.srcSet} sizes={sizes} />
          <img
            {...img}
            alt={alt}
            className="object-cover"
            style={{ ...img.style, objectPosition: `50% ${posicion}%` }}
          />
        </picture>
      </div>
    </div>
  );
}
