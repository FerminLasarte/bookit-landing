"use client";

import { usePathname } from "next/navigation";
import EnlaceDeSeccion from "@/components/ui/EnlaceDeSeccion";
import { miLocal } from "@/content/mi-local";

/** Una sección del panel, con su enlace. */
export type Seccion = (typeof miLocal.panel.secciones)[number];

/**
 * El `id` de la sección en la que se está, de las que ve quien entra. La
 * agenda es también la sección de lo que cuelga de ella, como cargar un turno,
 * y Gestión la de sus tres partes. Va el `id` y no la sección: las que dibuja
 * la barra llegan del marco, un componente del servidor, como copias, y nunca
 * serían el mismo objeto.
 */
export function useSeccionActual(secciones: Seccion[]) {
  const ruta = usePathname();
  return secciones.findLast((s) => s.rutas.some((base) => ruta === base || ruta.startsWith(`${base}/`)))?.id;
}

/** Las secciones del panel que ve quien entra, en la barra de la compu. */
export default function SeccionesDelPanel({ secciones }: { secciones: Seccion[] }) {
  const { navegacion } = miLocal.panel;
  const actual = useSeccionActual(secciones);

  return (
    <nav aria-label={navegacion}>
      <ul className="flex flex-col gap-1">
        {secciones.map((s) => (
          <li key={s.id}>
            <EnlaceDeSeccion href={s.href} activa={s.id === actual}>
              {s.label}
            </EnlaceDeSeccion>
          </li>
        ))}
      </ul>
    </nav>
  );
}
