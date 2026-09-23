"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * De estas secciones, la que cruza el centro de la pantalla. Vuelve a mirar al
 * cambiar de ruta; si ninguna está en la página, `null`. `ids` tiene que ser
 * estable (una constante de módulo).
 */
export function useSeccionEnFoco(ids: readonly string[]) {
  const pathname = usePathname();
  const [enFoco, setEnFoco] = useState<string | null>(null);

  useEffect(() => {
    setEnFoco(null);
    const secciones = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (secciones.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setEnFoco(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    secciones.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, pathname]);

  return enFoco;
}
