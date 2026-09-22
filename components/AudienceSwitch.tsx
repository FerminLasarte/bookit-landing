"use client";

import { FieldError, labelClasses } from "./Field";
import { waitlistCopy, type Audience } from "@/content/waitlist";
import { cn } from "@/lib/utils";

/**
 * Segmented control Cliente / Local con radios reales por debajo:
 * navegable con flechas, anunciado como grupo, y sin depender de JS para
 * que el valor viaje en el form.
 *
 * LO ELEGIDO SE MARCA CON TINTA, NO CON ÁMBAR. Era el patrón que
 * `docs/MARCA.md` nombra textualmente en *Lo que no se hace* —"cards de opción
 * con borde naranja"— y los números decían lo mismo:
 *
 * - El relleno era `bg-amber-50`, y encima iba la aclaración en `ink-500`:
 *   **4,500:1**, o sea AA al ras. Ese par exacto ya se había sacado TRES veces
 *   del repo por este motivo (`LegalDoc`, `ReferralCode` y `HowItWorks` lo
 *   documentan, y `DECISIONES.md` §5 cuenta dos más a 4,49:1). Era la cuarta, y
 *   ninguna de las tres auditorías la había encontrado.
 * - El borde `amber-500` sobre ese relleno daba **2,59:1** y sobre la card
 *   **2,78:1**, contra los 3:1 que WCAG 1.4.11 pide para la señal visual de un
 *   estado. O sea que lo que marcaba la elección no llegaba a verse.
 *
 * Ahora la opción elegida lleva el borde en tinta plena —**14,68:1** en claro y
 * **12,44:1** en oscuro, contra el 1,205:1 del filete al 10% de la que no está
 * elegida— y además sube de peso, para que el estado no dependa sólo del color.
 * Es el mismo recurso con el que el nav marca la sección activa. Sin relleno:
 * no hace falta, y un relleno claro no separa nada (1,027:1).
 */
export default function AudienceSwitch({
  value,
  onChange,
  name = "user_type",
  disabled = false,
  error,
}: {
  value: Audience | null;
  onChange: (value: Audience) => void;
  name?: string;
  disabled?: boolean;
  error?: string | null;
}) {
  const options = Object.keys(waitlistCopy) as Audience[];

  return (
    <fieldset disabled={disabled} aria-describedby={error ? "wl-user-type-error" : undefined}>
      <legend className={labelClasses}>¿Cómo vas a usar Bookit?</legend>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const copy = waitlistCopy[option];
          const checked = value === option;
          return (
            <label
              key={option}
              className={cn(
                "group relative flex min-h-11 cursor-pointer flex-col justify-center rounded-field border bg-paper px-4 py-3 transition-colors duration-150 dark:bg-ink-800",
                checked
                  ? "border-ink-900 dark:border-bone-100"
                  : "border-ink-900/10 hover:border-ink-900/25 dark:border-white/10 dark:hover:border-white/25",
                error && !checked && "border-error dark:border-error-dark",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={checked}
                required
                onChange={() => onChange(option)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-field peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-cream-50 dark:peer-focus-visible:ring-offset-ink-950"
              />
              <span
                className={cn(
                  "text-small text-ink-900 dark:text-bone-100",
                  checked ? "font-bold" : "font-semibold",
                )}
              >
                {copy.tab}
              </span>
              <span className="text-xs text-ink-500 dark:text-bone-300">{copy.tabHint}</span>
            </label>
          );
        })}
      </div>

      <FieldError id="wl-user-type-error" message={error} />
    </fieldset>
  );
}
