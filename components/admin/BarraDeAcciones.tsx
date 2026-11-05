"use client";

import { createContext, type ReactNode } from "react";

/**
 * Si una acción está en la barra de arriba de la ficha: ahí su botón es una
 * píldora y no un link de texto. Lo lee `DialogoDeAccion`, así cada acción
 * sigue igual y no sabe dónde la pusieron.
 */
export const EnLaBarra = createContext(false);

/** Las acciones de un local, siempre a la vista arriba de la ficha (docs/PLAN-ADMIN-V5.md, paso T). */
export default function BarraDeAcciones({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <EnLaBarra value>
      <div role="group" aria-label={etiqueta} className="flex flex-wrap gap-2">
        {children}
      </div>
    </EnLaBarra>
  );
}
