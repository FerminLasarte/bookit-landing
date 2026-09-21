"use client";

import { waitlistCopy, type Audience } from "@/content/waitlist";
import { cn } from "@/lib/utils";

/**
 * Segmented control Cliente / Local con radios reales por debajo:
 * navegable con flechas, anunciado como grupo, y sin depender de JS para
 * que el valor viaje en el form.
 */
export default function AudienceSwitch({
  value,
  onChange,
  name = "user_type",
  disabled = false,
}: {
  value: Audience | null;
  onChange: (value: Audience) => void;
  name?: string;
  disabled?: boolean;
}) {
  const options = Object.keys(waitlistCopy) as Audience[];

  return (
    <fieldset disabled={disabled}>
      <legend className="text-small font-semibold text-ink-900 dark:text-bone-100">
        ¿Cómo vas a usar Bookit? <span className="text-amber-700 dark:text-amber-300">*</span>
      </legend>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const copy = waitlistCopy[option];
          const checked = value === option;
          return (
            <label
              key={option}
              className={cn(
                "group relative flex min-h-11 cursor-pointer flex-col justify-center rounded-field border px-4 py-3 transition-colors duration-150",
                checked
                  ? "border-amber-500 bg-amber-50 dark:border-amber-500 dark:bg-amber-500/10"
                  : "border-ink-900/12 bg-paper hover:border-ink-900/25 dark:border-white/12 dark:bg-ink-800 dark:hover:border-white/25",
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
              <span className="text-small font-semibold text-ink-900 dark:text-bone-100">
                {copy.tab}
              </span>
              <span className="text-xs text-ink-500 dark:text-bone-300">{copy.tabHint}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
