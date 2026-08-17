import { cn } from "@/lib/utils";

/**
 * Separador del sistema (§4.3): línea fina con un tick ámbar de 2px al inicio.
 * Reemplaza a las cards cuando sólo hace falta separar.
 */
export default function Hairline({
  className = "",
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative border-t",
        onDark ? "border-white/8" : "border-ink-900/8 dark:border-white/8",
        className,
      )}
    >
      <span className="absolute -top-px left-0 h-0.5 w-10 bg-amber-500" />
    </div>
  );
}
