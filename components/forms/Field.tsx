import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * Sin sombra (MARCA: un campo nunca lleva) y con el borde al 10 %. El
 * placeholder va en `muted` entero y no atenuado: es un ejemplo que se lee
 * ("Ej: 2494…" dice el formato), y al 60 % daba 2,33:1.
 */
export const fieldClasses =
  "ring-focus min-h-11 w-full rounded-field border border-line bg-surface px-3.5 py-2.5 text-base text-fg placeholder:text-muted transition-colors duration-(--duration-chico) hover:border-fg/25 focus:border-accent";

export const labelClasses = "block text-small font-semibold text-fg";

const invalidClasses = "border-danger hover:border-danger";

/** Lo que el campo le pasa a su control. Sin esparcirlo, el control no tiene id ni estilo. */
export type ControlProps = {
  id: string;
  className: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
};

/**
 * El mensaje de un campo. Suelto para los dos controles que no entran en
 * `Field`: el grupo de radios, que lleva `legend`, y el checkbox.
 *
 * Sin `role="alert"`: ya está atado con `aria-describedby` y el formulario
 * enfoca el primer campo que falló, así que se lee al llegar.
 */
export function FieldError({ id, message }: { id: string; message?: string | null }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-small font-medium text-danger">
      {message}
    </p>
  );
}

/**
 * Rótulo, control y error. El control se declara con una función para que el
 * error no se pueda olvidar: la única forma de escribir un campo es la que ata
 * el mensaje al control (WCAG 3.3.1, MARCA: "Un error por campo").
 */
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
        {optional && <span className="font-normal text-muted"> (opcional)</span>}
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
