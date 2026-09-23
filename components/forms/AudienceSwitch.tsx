"use client";

import { FieldError, labelClasses } from "./Field";
import { waitlistCopy, type Audience } from "@/content/waitlist";
import { cn } from "@/lib/utils";

/**
 * Cliente / Local con radios reales: navegable con flechas, anunciado como
 * grupo y sin depender de JS para que el valor viaje en el form.
 *
 * Lo elegido se marca con tinta y peso, no con ámbar: el borde ámbar sobre un
 * relleno claro da 2,59:1 y no llega a los 3:1 de un estado (MARCA, *Lo que no
 * se hace*).
 *
 * El radio es transparente y cubre la opción entera, así el anillo de foco es
 * el `ring-focus` de siempre, dibujado sobre el propio control.
 */
export default function AudienceSwitch({
  value,
  onChange,
  name = "user_type",
  error,
}: {
  value: Audience | null;
  onChange: (value: Audience) => void;
  name?: string;
  error?: string | null;
}) {
  const options = Object.keys(waitlistCopy) as Audience[];

  return (
    <fieldset aria-describedby={error ? "wl-user-type-error" : undefined}>
      <legend className={labelClasses}>¿Cómo vas a usar Bookit?</legend>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const copy = waitlistCopy[option];
          const checked = value === option;
          return (
            <label
              key={option}
              className={cn(
                "relative flex min-h-11 flex-col justify-center rounded-field border bg-surface px-4 py-3 transition-colors duration-(--duration-chico)",
                checked ? "border-fg" : "border-line hover:border-fg/25",
                error && !checked && "border-danger",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={checked}
                required
                onChange={() => onChange(option)}
                className="ring-focus absolute inset-0 cursor-pointer appearance-none rounded-field"
              />
              <span className={cn("text-small text-fg", checked ? "font-bold" : "font-semibold")}>
                {copy.tab}
              </span>
              <span className="text-micro text-muted">{copy.tabHint}</span>
            </label>
          );
        })}
      </div>

      <FieldError id="wl-user-type-error" message={error} />
    </fieldset>
  );
}
