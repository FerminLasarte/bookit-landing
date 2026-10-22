import Image from "next/image";
import Link from "next/link";
import type { MiLocal } from "@/lib/mi-local/agenda";
import { cn } from "@/lib/utils";

/**
 * El local arriba de todo: su logo, el mismo círculo que en la app, y su
 * nombre. Sin logo, la inicial. Lleva a la agenda (D3 del plan del panel).
 */
export default function IdentidadDelLocal({ local, className }: { local: Pick<MiLocal, "nombre" | "logo">; className?: string }) {
  return (
    <Link href="/mi-local" className={cn("ring-focus flex min-w-0 items-center gap-3 rounded-pill", className)}>
      {local.logo ? (
        <Image src={local.logo} alt="" width={40} height={40} className="size-10 shrink-0 rounded-full object-cover" />
      ) : (
        <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/20 font-bold text-accent-fg">
          {local.nombre.trim().charAt(0).toUpperCase()}
        </span>
      )}
      <span className="truncate font-bold text-fg">{local.nombre}</span>
    </Link>
  );
}
