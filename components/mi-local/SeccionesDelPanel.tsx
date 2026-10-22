"use client";

import { usePathname } from "next/navigation";
import EnlaceDeSeccion from "@/components/ui/EnlaceDeSeccion";
import { miLocal } from "@/content/mi-local";

/** La sección en la que se está. La agenda es también la sección de lo que cuelga de ella, como cargar un turno. */
export function useSeccionActual() {
  const ruta = usePathname();
  return miLocal.panel.secciones.findLast((s) => ruta === s.href || ruta.startsWith(`${s.href}/`));
}

/** Las secciones del panel, en la barra de la compu. */
export default function SeccionesDelPanel() {
  const { secciones, navegacion } = miLocal.panel;
  const actual = useSeccionActual();

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
