"use client";

import { usePathname, useRouter } from "next/navigation";
import { useId } from "react";
import Button from "@/components/ui/Button";
import { fieldClasses } from "@/components/forms/Field";
import { filtrosAdmin } from "@/content/admin";
import { cn } from "@/lib/utils";

/** Un filtro de la lista: su nombre en la URL, lo que dice y sus opciones. La primera, sin valor, es "todos". */
export type Filtro = {
  nombre: string;
  etiqueta: string;
  valor?: string;
  opciones: { valor: string; label: string }[];
};

/**
 * Los filtros de una lista del panel (docs/PLAN-ADMIN-V5.md, paso U): un GET
 * a la misma página, así queda en la URL. Con JavaScript se aplica al elegir,
 * sin recargar y sin los filtros vacíos; sin JavaScript, con "Aplicar".
 * `conservar`: lo que sigue puesto (la búsqueda, el estado). Cambiar un
 * filtro vuelve a la primera página.
 */
export default function Filtros({
  filtros,
  conservar,
}: {
  filtros: Filtro[];
  conservar: Record<string, string | undefined>;
}) {
  const id = useId();
  const router = useRouter();
  const ruta = usePathname();

  const aplicar = (formulario: HTMLFormElement) => {
    const params = new URLSearchParams();
    for (const [k, v] of new FormData(formulario)) if (typeof v === "string" && v) params.set(k, v);
    const query = params.toString();
    router.push(query ? `${ruta}?${query}` : ruta);
  };

  return (
    <form aria-label={filtrosAdmin.titulo} className="flex flex-wrap items-end gap-3">
      {Object.entries(conservar).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
      {filtros.map((f) => (
        <label key={f.nombre} htmlFor={`${id}-${f.nombre}`} className="flex min-w-36 flex-col gap-1">
          <span className="text-micro font-semibold text-muted">{f.etiqueta}</span>
          <select
            id={`${id}-${f.nombre}`}
            name={f.nombre}
            defaultValue={f.valor ?? ""}
            onChange={(e) => e.currentTarget.form && aplicar(e.currentTarget.form)}
            className={cn(fieldClasses, "min-h-10 py-1.5 text-small")}
          >
            {f.opciones.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      <noscript>
        <Button type="submit" variant="secondary" size="compact">
          {filtrosAdmin.aplicar}
        </Button>
      </noscript>
    </form>
  );
}
