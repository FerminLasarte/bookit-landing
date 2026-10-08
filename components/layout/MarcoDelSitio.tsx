"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Lo que rodea a cada página del sitio: splash, cursor, nav y footer. El panel
 * de /admin tiene su propio nav y no lleva nada de esto: es una herramienta,
 * no una página para recorrer.
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
  if (usePathname().startsWith("/admin")) {
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
