import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * El campo del sitio: rótulo arriba, control, error abajo.
 *
 * Existe porque el error se podía olvidar, y de hecho estaba olvidado. El
 * formulario marcaba el campo inválido con un borde rojo y un `aria-invalid`,
 * y ponía un único mensaje al pie —"Revisá los campos marcados para
 * continuar"—. Eso rompe tres reglas a la vez:
 *
 * - **WCAG 3.3.1.** Un error tiene que estar descrito *en texto*. Un borde no
 *   es texto, y para quien usa un lector de pantalla el campo anunciaba
 *   "inválido" y nada más: `aria-invalid` sin `aria-describedby` dice que algo
 *   está mal y no dice qué.
 * - **"El color nunca es el único portador de un dato"** (`docs/MARCA.md`).
 *   El borde rojo era el único portador.
 * - **"El error dice qué pasó"** (la tabla de Voz). "Revisá los campos
 *   marcados" es el "Error inesperado" de la columna de la derecha.
 *
 * La salida es que el error deje de ser algo que el formulario agrega y pase a
 * ser parte del campo. Por eso el control se declara con una función: recibe
 * `id`, `className`, `aria-invalid` y `aria-describedby` ya atados entre sí, y
 * si no se los esparce el campo no tiene ni id ni estilo — o sea que la única
 * forma de escribir un campo es la forma que queda bien cableada.
 *
 * CONTRASTE, medido contra el fondo real. El mensaje usa los semánticos del
 * manual: `--color-error` da **6,46:1** sobre la card de `paper` y
 * `--color-error-dark` **9,43:1** sobre `ink-800`. El mismo par sirve de borde,
 * donde el umbral es 3:1.
 */

/**
 * El control. Sin sombra —el manual lo prohíbe en campos— y con el borde al
 * 10%, que es el valor del manual para un borde que acompaña a un relleno.
 *
 * El placeholder va en la tinta secundaria entera y no al 60%: a esa opacidad
 * daba **2,33:1** sobre `paper`, y acá el placeholder no es decoración sino un
 * ejemplo que se lee ("Ej: 2494…" dice el formato del teléfono). En `ink-500`
 * da 4,83:1 y sigue distinguiéndose de lo tipeado, que va en `ink-900`
 * (14,68:1): es el mismo par de tintas que separan un cuerpo de su bajada.
 */
export const fieldClasses =
  "ring-focus min-h-11 w-full rounded-field border border-ink-900/10 bg-paper px-3.5 py-2.5 text-base text-ink-900 placeholder:text-ink-500 transition-colors duration-150 hover:border-ink-900/25 focus:border-amber-500 dark:border-white/10 dark:bg-ink-800 dark:text-bone-100 dark:placeholder:text-bone-300 dark:hover:border-white/25";

export const labelClasses = "block text-small font-semibold text-ink-900 dark:text-bone-100";

export const invalidClasses = "border-error dark:border-error-dark";

/** Lo que el campo le pasa a su control. Sin esparcirlo, el control no funciona. */
export type ControlProps = {
  id: string;
  className: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
};

/**
 * El mensaje. Va suelto para que lo puedan usar los dos controles que no entran
 * en `Field` —el grupo de radios, que lleva `legend` y no `label`, y el
 * checkbox, que lleva el rótulo a la derecha—.
 *
 * Sin `role="alert"`: el mensaje ya está atado al control con
 * `aria-describedby` y el formulario enfoca el primer campo que falló, así que
 * se lee al llegar. Un live region encima lo anunciaría dos veces.
 */
export function FieldError({ id, message }: { id: string; message?: string | null }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-small font-medium text-error dark:text-error-dark">
      {message}
    </p>
  );
}

export default function Field({
  id,
  label,
  /** El único campo que no es obligatorio lo dice; los demás no llevan marca. */
  optional = false,
  error,
  children,
}: {
  id: string;
  label: ReactNode;
  optional?: boolean;
  error?: string | null;
  children: (props: ControlProps) => ReactNode;
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className={labelClasses}>
        {label}
        {optional && (
          <span className="font-normal text-ink-500 dark:text-bone-300"> (opcional)</span>
        )}
      </label>

      {children({
        id,
        className: cn(fieldClasses, "mt-2", error && invalidClasses),
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : undefined,
      })}

      <FieldError id={errorId} message={error} />
    </div>
  );
}
