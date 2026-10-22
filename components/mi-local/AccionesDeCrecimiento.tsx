import { ChevronRight, Gift, TicketPercent, type LucideIcon } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { miLocal } from "@/content/mi-local";
import { cn } from "@/lib/utils";

/**
 * Recompensas y Cupones, las dos palancas para crecer, debajo de los números,
 * como `_AccionesCrecimiento` de la app (D3). Si el plan no trae cupones, la
 * fila lo dice con el plan que los trae, como el chip de la app.
 */
export default function AccionesDeCrecimiento({
  cuponesDesde,
  className,
}: {
  /** El plan que trae los cupones, si el del local no. */
  cuponesDesde: string | null;
  className?: string;
}) {
  const { acciones } = miLocal.crecimiento;
  const filas: { href: string; titulo: string; bajada: string; Icono: LucideIcon; plan: string | null }[] = [
    { href: "/mi-local/crecimiento/recompensas", ...acciones.recompensas, Icono: Gift, plan: null },
    { href: "/mi-local/crecimiento/cupones", ...acciones.cupones, Icono: TicketPercent, plan: cuponesDesde },
  ];

  return (
    <nav aria-label={acciones.titulo} className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {filas.map(({ href, titulo, bajada, Icono, plan }) => (
        <Link
          key={href}
          href={href}
          className="ring-focus group flex items-center gap-4 rounded-card border border-line bg-surface p-5 transition-colors duration-(--duration-chico) hover:bg-fg/4 md:p-6"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-field bg-accent/15 text-accent-fg">
            <Icono aria-hidden className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 font-semibold text-fg">
              {titulo}
              {plan && <Badge tono="atencion">{plan}</Badge>}
            </span>
            <span className="block text-small text-muted">{bajada}</span>
          </span>
          <ChevronRight aria-hidden className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </nav>
  );
}
