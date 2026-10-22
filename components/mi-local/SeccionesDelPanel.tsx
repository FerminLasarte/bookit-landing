"use client";

import { usePathname } from "next/navigation";
import EnlaceDeSeccion from "@/components/ui/EnlaceDeSeccion";
import { miLocal } from "@/content/mi-local";

/**
 * El `href` de la sección en la que se está. La agenda es también la sección
 * de lo que cuelga de ella, como cargar un turno. Va el `href` y no la sección:
 * las que dibuja la barra llegan del marco, un componente del servidor, como
 * copias, y nunca serían el mismo objeto.
 */
export function useSeccionActual() {
  const ruta = usePathname();
  return miLocal.panel.secciones.findLast((s) => ruta === s.href || ruta.startsWith(`${s.href}/`))?.href;
}

/** Una sección del panel, con su enlace. */
export type Seccion = (typeof miLocal.panel.secciones)[number];

/** Las secciones del panel que ve quien entra, en la barra de la compu. */
export default function SeccionesDelPanel({ secciones }: { secciones: Seccion[] }) {
  const { navegacion } = miLocal.panel;
  const actual = useSeccionActual();

  return (
    <nav aria-label={navegacion}>
      <ul className="flex flex-col gap-1">
        {secciones.map((s) => (
          <li key={s.href}>
            <EnlaceDeSeccion href={s.href} activa={s.href === actual}>
              {s.label}
            </EnlaceDeSeccion>
          </li>
        ))}
      </ul>
    </nav>
  );
}
