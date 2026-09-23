import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Un bloque que se abre creciendo y se cierra encogiendo: la fila de la grilla
 * va de `0fr` a `1fr`, que anima en todos los navegadores. Cerrado queda
 * `inert`: fuera del foco y de los lectores. Con `as="span"` va dentro de un botón.
 */
export default function Plegable({
  abierto,
  as: Component = "div",
  children,
  className,
  ...props
}: {
  abierto: boolean;
  as?: "div" | "span";
  children: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "children">) {
  return (
    <Component
      {...props}
      inert={!abierto}
      className={cn(
        "grid transition-[grid-template-rows] duration-(--duration-entrada) ease-out-cubic",
        abierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <Component className="block min-h-0 overflow-hidden">
        <Component
          className={cn(
            "block transition-[opacity,translate] duration-(--duration-entrada) ease-out-cubic",
            abierto ? "opacity-100" : "-translate-y-1 opacity-0",
            className,
          )}
        >
          {children}
        </Component>
      </Component>
    </Component>
  );
}
