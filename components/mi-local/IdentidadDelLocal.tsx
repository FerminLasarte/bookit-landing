import Link from "next/link";
import { cn } from "@/lib/utils";
import Avatar from "./Avatar";

/**
 * El local arriba de todo: su logo, el mismo círculo que en la app, y su
 * nombre. Sin logo, las iniciales. Lleva a la agenda (D3 del plan del panel).
 */
export default function IdentidadDelLocal({
  nombre,
  logo,
  className,
}: {
  nombre: string;
  logo: string | null;
  className?: string;
}) {
  return (
    <Link href="/mi-local" className={cn("ring-focus flex min-w-0 items-center gap-3 rounded-pill", className)}>
      <Avatar nombre={nombre} foto={logo} />
      <span className="truncate font-bold text-fg">{nombre}</span>
    </Link>
  );
}
