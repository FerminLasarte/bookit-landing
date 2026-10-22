"use client";

import { usePathname } from "next/navigation";
import EnlaceDeSeccion from "@/components/ui/EnlaceDeSeccion";
import { miLocal } from "@/content/mi-local";

/** Las secciones del panel. La agenda es también la sección de lo que cuelga de ella, como cargar un turno. */
export default function SeccionesDelPanel() {
  const ruta = usePathname();
  const { secciones, navegacion } = miLocal.panel;
  const actual = secciones.findLast((s) => ruta === s.href || ruta.startsWith(`${s.href}/`));

  return (
    <nav aria-label={navegacion}>
      <ul className="flex flex-col gap-1">
        {secciones.map((s) => (
          <li key={s.href}>
            <EnlaceDeSeccion href={s.href} activa={s === actual}>
              {s.label}
            </EnlaceDeSeccion>
          </li>
        ))}
      </ul>
    </nav>
  );
}
