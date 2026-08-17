import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Label chico de sección.
 *
 * Antes era el "micro-label" del brief: 11px, mayúsculas, mono, tracking 0.2em.
 * Ese tratamiento se lee acartonado y genérico, así que acá va más cerca de cómo
 * lo hace Apple: caja baja, tipografía de texto, semibold, tracking apretado y el
 * color haciendo el trabajo de jerarquía en lugar del espaciado.
 *
 * - `section` (default): acento ámbar, para abrir una sección.
 * - `label`: gris, para rótulos utilitarios (columnas del footer, índices, cajas).
 */
export default function Eyebrow({
  children,
  className = "",
  onDark = false,
  variant = "section",
}: {
  children: ReactNode;
  className?: string;
  onDark?: boolean;
  variant?: "section" | "label";
}) {
  const tone =
    variant === "section"
      ? onDark
        ? "text-amber-300"
        : "text-amber-700 dark:text-amber-300"
      : onDark
        ? "text-bone-300"
        : "text-ink-500 dark:text-bone-300";

  return (
    <p
      className={cn(
        "font-semibold tracking-[-0.01em]",
        variant === "section" ? "text-[0.9375rem]" : "text-[0.8125rem]",
        tone,
        className,
      )}
    >
      {children}
    </p>
  );
}
