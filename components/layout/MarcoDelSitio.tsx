"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Las herramientas: cada una tiene su propio marco y no lleva nada del sitio. */
const HERRAMIENTAS = ["/admin", "/mi-local"];

/**
 * Lo que rodea a cada página del sitio: splash, cursor, nav y footer. El panel
 * de /admin y el del local (/mi-local) no llevan nada de esto: son
 * herramientas, no páginas para recorrer.
 *
 * Las piezas llegan armadas desde el layout raíz y no se importan acá: así el
 * footer sigue siendo un componente de servidor. Y vive en el layout raíz en
 * vez de partir `app/` en dos layouts raíz, para que el sitio no cambie de
 * lugar ni de archivos.
 */
export default function MarcoDelSitio({
  arriba,
  abajo,
  children,
}: {
  arriba: ReactNode;
  abajo: ReactNode;
  children: ReactNode;
}) {
  const ruta = usePathname();
  if (HERRAMIENTAS.some((base) => ruta === base || ruta.startsWith(`${base}/`))) {
    return (
      <main id="contenido" className="flex-1">
        {children}
      </main>
    );
  }

  return (
    <>
      {arriba}
      <main id="contenido" className="flex-1 pt-20 md:pt-24">
        {children}
      </main>
      {abajo}
    </>
  );
}
