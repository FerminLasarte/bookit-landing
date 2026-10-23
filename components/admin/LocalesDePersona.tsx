import Link from "next/link";
import { roles } from "@/content/admin";
import type { LocalDePersona } from "@/lib/admin/datos";
import { cn } from "@/lib/utils";

/** Los locales de una persona, con su rol y el link a la ficha. Los dados de baja, tachados. */
export default function LocalesDePersona({ locales, vacio }: { locales: LocalDePersona[]; vacio: string }) {
  if (locales.length === 0) return <span className="text-muted">{vacio}</span>;
  return (
    <ul className="flex flex-col gap-1">
      {locales.map((l) => (
        <li key={`${l.id_comercio}-${l.rol}`}>
          <Link
            href={`/admin/comercios/${l.id_comercio}`}
            className={cn("ring-focus rounded-[4px] font-semibold hover:underline", l.dado_de_baja_el ? "text-muted line-through" : "text-fg")}
          >
            {l.nombre}
          </Link>
          <span className="text-muted"> · {roles[l.rol] ?? l.rol}</span>
        </li>
      ))}
    </ul>
  );
}
