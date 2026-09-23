import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Etiqueta chica: "Pronto en Tandil", "Ejemplo". Nunca en mayúsculas sostenidas. */
export default function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill bg-fg px-2.5 py-1 font-mono text-micro leading-none whitespace-nowrap text-page",
        className,
      )}
    >
      {children}
    </span>
  );
}
