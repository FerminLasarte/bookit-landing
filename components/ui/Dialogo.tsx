import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";
import Button from "./Button";

/*
 * El diálogo del sitio: un `<dialog>` nativo, que se abre con `showModal()` y
 * se cierra con Escape sin código propio. La card que flota, sobre la página
 * oscurecida. Lo usan la baja del débito en /planes y la ficha del turno en
 * /mi-local.
 */
export default function Dialogo({
  ref,
  etiqueta,
  onClose,
  className,
  children,
}: {
  ref: Ref<HTMLDialogElement>;
  /** El id del texto que nombra el diálogo. */
  etiqueta: string;
  onClose?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <dialog
      ref={ref}
      aria-labelledby={etiqueta}
      onClose={onClose}
      className={cn(
        "m-auto w-[min(24rem,calc(100%-2.5rem))] rounded-card bg-surface p-6 text-fg shadow-float backdrop:bg-ink-950/50",
        className,
      )}
    >
      {children}
    </dialog>
  );
}

/** El botón que sale del diálogo sin hacer nada: al lado del que sí hace. */
export function Volver({ onClick, className, children }: { onClick: () => void; className?: string; children: ReactNode }) {
  return (
    <Button onClick={onClick} className={cn("border border-line bg-surface text-fg hover:bg-fg/6", className)}>
      {children}
    </Button>
  );
}
