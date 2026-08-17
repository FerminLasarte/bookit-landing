import { cn } from "@/lib/utils";

/**
 * Motivo §4.6.4 — el wordmark `Book·it`.
 * "Book" en tinta, "it" en ámbar. Es el logo hasta que haya uno definitivo.
 *
 * Sobre papel el "it" va en `amber-600` y no en el `amber-500` de marca: a los
 * 20px del nav, #D78A1D sobre cream-50 da 2,64:1 y no llega al 3:1 que pide AA
 * para texto grande. #C67D19 da 3,15:1 y sigue leyéndose como el ámbar de Bookit.
 * Sobre fondo oscuro no hay problema (6,66:1), así que ahí se usa el de marca.
 */
export default function Wordmark({
  className = "",
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span
      className={cn(
        "font-display font-extrabold tracking-[-0.04em]",
        onDark ? "text-bone-100" : "text-ink-900 dark:text-bone-100",
        className,
      )}
    >
      Book
      {/*
       * El punto medio es decorativo: `aria-hidden` para que el nombre accesible
       * sea "Bookit" y no "Book·it" (que además se lee raro en un lector de pantalla).
       */}
      <span aria-hidden="true" className="text-amber-500/70">
        ·
      </span>
      <span className={onDark ? "text-amber-500" : "text-amber-600 dark:text-amber-500"}>it</span>
    </span>
  );
}
