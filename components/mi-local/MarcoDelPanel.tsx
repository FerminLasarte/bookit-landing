import type { ReactNode } from "react";
import Anchor from "@/components/ui/Anchor";
import Wordmark from "@/components/ui/Wordmark";
import { miLocal } from "@/content/mi-local";
import type { Lugar } from "@/lib/mi-local/lugar";
import CambiarDeLugar from "./CambiarDeLugar";
import IdentidadDelLocal from "./IdentidadDelLocal";
import MenuDelPanel from "./MenuDelPanel";
import PestanasDelPanel from "./PestanasDelPanel";
import Salir from "./Salir";
import SeccionesDelPanel from "./SeccionesDelPanel";

/*
 * El marco del panel del local: un sistema propio, fuera del sitio (plan del
 * panel, D1–D5). En la compu, una barra clara a la izquierda con el local
 * arriba, las secciones y la cuenta abajo; el resto es el área de trabajo, a
 * todo el ancho. En el teléfono, una barra arriba con la cuenta en un menú, y
 * las secciones en pestañas abajo (D1 del plan de la fase 3). Un profesional
 * del equipo ve sus secciones y no el plan (D2 del plan del equipo).
 */

/**
 * La cuenta: cambiar de local, el plan, salir y la firma. Abajo de la barra en
 * la compu; en el menú del teléfono. El plan es del dueño: `mi_plan_web()` no
 * conoce el local ajeno.
 */
function Cuenta({ lugar }: { lugar: Lugar }) {
  const copy = miLocal.panel;
  return (
    <div className="flex flex-col gap-3 px-4 lg:mt-auto lg:border-t lg:border-line lg:pt-4">
      <CambiarDeLugar lugares={lugar.lugares} actual={lugar.clave} />
      {lugar.rol === "duenio" && (
        <Anchor href="/planes" className="ring-focus self-start text-small text-muted hover:text-fg">
          {copy.tuPlan}
        </Anchor>
      )}
      <Salir>{copy.salir}</Salir>
      <Anchor
        href="/"
        aria-label={copy.irALaWeb}
        className="ring-focus mt-3 flex items-center gap-1.5 self-start rounded-pill text-micro text-muted hover:text-fg"
      >
        <Wordmark isotipo className="size-4" />
        {copy.firma}
      </Anchor>
    </div>
  );
}

export default function MarcoDelPanel({ lugar, children }: { lugar: Lugar; children: ReactNode }) {
  const secciones = miLocal.panel.secciones.filter((s) => s.para === "todos" || s.para === lugar.rol);
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r border-line px-3 py-6 lg:flex">
        <IdentidadDelLocal nombre={lugar.nombre} logo={lugar.logo} className="px-2" />
        <SeccionesDelPanel secciones={secciones} />
        <Cuenta lugar={lugar} />
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-line bg-page px-4 lg:hidden">
        <IdentidadDelLocal nombre={lugar.nombre} logo={lugar.logo} />
        <MenuDelPanel>
          <Cuenta lugar={lugar} />
        </MenuDelPanel>
      </header>

      {/* Abajo, lugar para las pestañas del teléfono. */}
      <div className="min-w-0 px-4 pt-6 pb-24 md:px-8 md:pt-8 lg:pb-8">{children}</div>
      <PestanasDelPanel secciones={secciones} />
    </div>
  );
}
