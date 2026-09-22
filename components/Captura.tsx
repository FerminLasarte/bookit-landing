import { getImageProps, type StaticImageData } from "next/image";
import { cn } from "@/lib/utils";

/**
 * Una captura de la app, encuadrada.
 *
 * Reemplaza al `Device` de `HowItWorks` — el teléfono dibujado a mano, ~500
 * líneas de HTML que replicaban la app con locales inventados y que se
 * desincronizaban en cada release. Con él se van el último `rgba()` suelto del
 * sitio y los dos radios arbitrarios (`rounded-[2.5rem]` y `rounded-[1.75rem]`),
 * así que este borrado cierra la deuda que `docs/MARCA.md` dejaba anotada.
 *
 * NO DIBUJA UN TELÉFONO. Es un panel: borde, radio de pieza grande y adentro
 * los píxeles reales. Volver a dibujar un marco sería reponer lo que se acaba
 * de sacar, y además obligaría a mostrar la pantalla entera — que es justo lo
 * que el encuadre evita.
 *
 * ── El encuadre ──────────────────────────────────────────────────────────
 *
 * `recorte` es una ventana en píxeles del archivo original (1206 × 2622, iPhone
 * @3x). Existe por dos motivos medidos:
 *
 * 1. **La barra de estado se va siempre.** Su batería es `#34C759`, un verde
 *    que la web no tiene tokenizado — `exito` es `#16A34A`— y aparece en las 30
 *    capturas, entre las filas y=75 e y=120. El pre-flight del contrato pide
 *    que ninguna captura deje ver un color sin tokenizar, así que el recorte
 *    arranca en y=160: saca la barra entera con 60 px de margen y no toca el
 *    contenido de la app, que en la más alta empieza en y=221. De paso se va el
 *    "9:41", que es cromo de sistema y no producto.
 * 2. **El fondo muerto se va donde lo hay.** En `04_cliente_elegir_horario` el
 *    40 % de abajo es superficie vacía: encuadrada, la grilla de horarios pasa
 *    de 1206 × 2462 a 1206 × 1560, y dos capturas de formatos distintos son
 *    mejor composición que dos rectángulos iguales.
 *
 * La regla de color vale para la INTERFAZ, no para la fotografía: las fotos de
 * locales de `01` y `02` traen los colores que traiga un local de Tandil, y son
 * material aprobado por la auditoría justamente por eso. Lo que no puede
 * aparecer es un color de UI que el `@theme` no tenga. El único caso conocido
 * es el `#3B82F6` de "Confirmado" de `10_comercio_agenda_dia`, que ocupa 12.580
 * px entre las filas y=855 e y=2209: ahí no hay encuadre que lo deje afuera sin
 * quedarse con el encabezado solo, así que esa captura no se usa hasta que el
 * azul se tokenice.
 *
 * ── El tema: un `<picture>`, no dos `<Image>` ────────────────────────────
 *
 * El sitio elige el tema con `prefers-color-scheme` y sin estado en JS, así que
 * cada captura existe dos veces y hay que bajar UNA. `next/image` no renderiza
 * `<picture>`, y su receta documentada para esto —dos `<Image>`, una con
 * `display: none`— **baja las dos**: medido en este repo, 81 KB de descarte
 * sobre 164 KB en esta sección sola. La doc lo da por resuelto con el
 * `loading="lazy"` por default, y no alcanza: el diferido de Chrome arranca
 * recién a más de ~1200 px del pliegue, y esta sección empieza a 880 px, así
 * que las cuatro imágenes salen igual con el scroll en cero. El número está en
 * `docs/DECISIONES.md` §3 undecies, con cómo se midió.
 *
 * La salida es `getImageProps`, que devuelve el `srcSet` que `next/image`
 * armaría y deja meterlo en un `<picture>` de verdad. Ahí la elección la hace
 * el algoritmo de selección del navegador, que baja exactamente una: no es una
 * heurística de carga diferida, es la regla del formato. El `<img>` conserva el
 * tema claro como fallback, que es el mismo default que el `color-scheme` de
 * `globals.css`.
 *
 * Lo que cuesta: `getImageProps` no admite `placeholder="blur"` —el placeholder
 * no se quitaría nunca—. No es pérdida: la caja tiene su `aspect-ratio` y su
 * borde reservados, así que no hay salto de layout, y lo que se ve mientras
 * carga es un panel vacío. Es literalmente lo que pide el manual — "si tarda
 * menos de 400 ms no se dibuja nada para no hacer un parpadeo gris".
 *
 * ── `onDark`: la superficie manda sobre el tema ──────────────────────────
 *
 * El `<picture>` elige por `prefers-color-scheme`, o sea por el tema de quien
 * mira. Eso es correcto mientras la captura se apoye sobre una superficie que
 * TAMBIÉN cambia con el tema, que es el caso normal. No lo es cuando la
 * superficie está fija: la mitad oscura de `Audiences` es `ink-950` en los dos
 * temas, y ahí, en claro, el `<picture>` metía la captura clara —un rectángulo
 * blanco dentro del medio negro de la card, más luminoso que la mitad clara de
 * al lado, que es justo lo que el corte de color de esa pieza tiene que decir.
 *
 * Así que la superficie se declara, igual que en `Button`, `Eyebrow` y
 * `Hairline`: con `onDark` no hay `<picture>` ni elección, va la captura
 * oscura siempre. Y como la clara deja de importarse, tampoco se emite en el
 * build — el tipo la prohíbe para que no quede un import muerto.
 */
type Comun = {
  alt: string;
  /** Ventana vertical en píxeles del archivo original. */
  recorte: { top: number; bottom: number };
  /** Ancho de render, para que el `srcset` no baje una imagen de 1206 px. */
  sizes: string;
  className?: string;
};

/**
 * Sobre una superficie que cambia con el tema van las dos y elige el
 * `<picture>`; sobre una superficie fija en oscuro va sólo la oscura, y la
 * clara no se puede pasar para que no se importe un archivo que nadie emite.
 */
type Props = Comun & { oscuro: StaticImageData } & (
    | { onDark: true; claro?: never }
    | { onDark?: false; claro: StaticImageData }
  );

export default function Captura(props: Props) {
  const { oscuro, alt, recorte, sizes, className = "" } = props;
  // La desestructuración pierde la discriminación de la unión, así que la
  // fuente se elige sobre `props`, que es donde el tipo todavía sabe cuál de
  // las dos formas llegó.
  const onDark = props.onDark === true;
  const fuente = props.onDark ? oscuro : props.claro;
  const alto = recorte.bottom - recorte.top;
  const sobrante = fuente.height - alto;
  /*
   * `object-cover` escala por el ancho —el archivo es más angosto que la
   * ventana— y deja `sobrante` píxeles de desborde vertical. El porcentaje de
   * `object-position` reparte ese desborde, así que la fila `recorte.top` queda
   * pegada al borde de arriba. Sin desborde el valor da igual.
   */
  const posicion = sobrante > 0 ? (recorte.top / sobrante) * 100 : 0;

  const comun = { alt, fill: true, sizes };
  const { props: base } = getImageProps({ ...comun, src: fuente });
  const pixeles = (
    <img
      {...base}
      className="object-cover"
      style={{ ...base.style, objectPosition: `50% ${posicion}%` }}
    />
  );

  return (
    <div
      /*
       * Borde, no sombra (`docs/MARCA.md`, *Divergencia 7*). Y hace falta: en
       * claro la superficie base de la app es `#FBFCFD`, que es exactamente
       * `cream-50` — sin borde la captura no tiene canto contra la página.
       * `rounded-card` nombra un tamaño, no un rol: esto es un panel, no una
       * card (§3 sexies).
       */
      className={cn(
        "relative overflow-hidden rounded-card border border-ink-900/10 dark:border-white/10",
        className,
      )}
      style={{ aspectRatio: `${fuente.width} / ${alto}` }}
    >
      {onDark ? (
        pixeles
      ) : (
        <picture>
          <source
            media="(prefers-color-scheme: dark)"
            srcSet={getImageProps({ ...comun, src: oscuro }).props.srcSet}
            sizes={sizes}
          />
          {pixeles}
        </picture>
      )}
    </div>
  );
}
