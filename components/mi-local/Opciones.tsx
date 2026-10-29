import type { InputHTMLAttributes, ReactNode } from "react";
import Anchor from "@/components/ui/Anchor";
import { cn } from "@/lib/utils";

/*
 * Elegir entre opciones con enlaces: funcionan sin JavaScript y lo elegido
 * queda en la URL. Los usa la carga de un turno; la agenda filtra en el
 * navegador con botones, pero con la misma píldora (`claseDeOpcion`).
 */

/** Un rótulo y sus opciones, en una fila que se parte. */
export function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <nav aria-label={titulo} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-small font-semibold text-fg">{titulo}</span>
      {children}
    </nav>
  );
}

/** La píldora de una opción; la elegida va llena. */
export const claseDeOpcion = (activa: boolean) =>
  cn(
    "ring-focus inline-flex min-h-9 items-center rounded-pill px-3.5 text-small font-semibold transition-colors duration-(--duration-chico)",
    activa ? "bg-fg text-page" : "bg-fg/6 text-fg hover:bg-fg/12",
  );

/** Una casilla con la píldora de las opciones: un checkbox común, anda sin JavaScript. */
export function Casilla({
  children,
  ...casilla
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "children"> & { children: string }) {
  return (
    <label
      className={cn(
        claseDeOpcion(false),
        "cursor-pointer gap-2 has-checked:bg-fg has-checked:text-page has-disabled:cursor-not-allowed has-disabled:opacity-50",
      )}
    >
      <input {...casilla} type="checkbox" className="size-4 accent-fg" />
      {children}
    </label>
  );
}

export function Opcion({
  href,
  activa,
  className,
  children,
}: {
  href: string;
  activa: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Anchor href={href} aria-current={activa ? "true" : undefined} className={cn(claseDeOpcion(activa), className)}>
      {children}
    </Anchor>
  );
}
