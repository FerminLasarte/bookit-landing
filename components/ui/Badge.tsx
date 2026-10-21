import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Lo que dice un estado: si es una buena noticia, si pide atención o si está
 * mal. `neutro` es un dato sin juicio. Lo usan el panel y la agenda del local.
 */
export type TonoDeBadge = "bien" | "atencion" | "mal" | "neutro";

const tonos: Record<TonoDeBadge, string> = {
  bien: "bg-fg/8 text-fg",
  atencion: "bg-accent/20 text-accent-fg",
  mal: "bg-danger/12 text-danger",
  neutro: "bg-fg/6 text-fg",
};

/**
 * Etiqueta chica: "Pronto en Tandil", "Ejemplo". Nunca en mayúsculas sostenidas.
 * Con `tono`, un estado; sin él, la etiqueta plena del sitio.
 */
export default function Badge({
  children,
  tono,
  className,
}: {
  children: ReactNode;
  tono?: TonoDeBadge;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill bg-fg px-2.5 py-1.5 text-micro leading-none font-semibold whitespace-nowrap text-page",
        tono && tonos[tono],
        className,
      )}
    >
      {children}
    </span>
  );
}
