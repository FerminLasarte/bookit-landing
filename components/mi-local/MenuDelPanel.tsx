"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";
import { miLocal } from "@/content/mi-local";

/**
 * El menú del teléfono: abre debajo de la barra lo mismo que la barra lateral
 * de la compu. Se cierra al cambiar de página y con Escape.
 */
export default function MenuDelPanel({ children }: { children: ReactNode }) {
  const copy = miLocal.panel;
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();
  const id = useId();

  useEffect(() => setAbierto(false), [ruta]);
  useEffect(() => {
    if (!abierto) return;
    const alApretar = (evento: KeyboardEvent) => evento.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", alApretar);
    return () => window.removeEventListener("keydown", alApretar);
  }, [abierto]);

  return (
    <>
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls={id}
        aria-label={abierto ? copy.cerrarMenu : copy.menu}
        onClick={() => setAbierto((a) => !a)}
        className="ring-focus -mr-2 flex size-11 items-center justify-center rounded-pill text-fg hover:bg-fg/6"
      >
        {abierto ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
      </button>
      <div
        id={id}
        hidden={!abierto}
        className="absolute inset-x-0 top-full border-b border-line bg-page px-4 py-4 shadow-float"
      >
        {children}
      </div>
    </>
  );
}
