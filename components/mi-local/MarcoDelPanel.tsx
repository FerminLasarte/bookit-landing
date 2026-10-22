import type { ReactNode } from "react";
import Anchor from "@/components/ui/Anchor";
import Wordmark from "@/components/ui/Wordmark";
import { miLocal } from "@/content/mi-local";
import type { MiLocal } from "@/lib/mi-local/agenda";
import IdentidadDelLocal from "./IdentidadDelLocal";
import MenuDelPanel from "./MenuDelPanel";
import Salir from "./Salir";
import SeccionesDelPanel from "./SeccionesDelPanel";

/*
 * El marco del panel del local: un sistema propio, fuera del sitio (plan del
 * panel, D1–D5). En la compu, una barra clara a la izquierda con el local
 * arriba, las secciones y la cuenta abajo; el resto es el área de trabajo, a
 * todo el ancho. En el teléfono, una barra arriba con el mismo contenido en un
 * menú.
 */

/** Lo que va en la barra y en el menú, debajo del local. */
function Contenido() {
  const copy = miLocal.panel;
  return (
    <>
      <SeccionesDelPanel />
      <div className="mt-6 flex flex-col gap-3 border-t border-line px-4 pt-4 lg:mt-auto">
        <Anchor href="/planes" className="ring-focus self-start text-small text-muted hover:text-fg">
          {copy.tuPlan}
        </Anchor>
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
    </>
  );
}

export default function MarcoDelPanel({ local, children }: { local: MiLocal; children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r border-line px-3 py-6 lg:flex">
        <IdentidadDelLocal local={local} className="px-2" />
        <Contenido />
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-line bg-page px-4 lg:hidden">
        <IdentidadDelLocal local={local} />
        <MenuDelPanel>
          <Contenido />
        </MenuDelPanel>
      </header>

      <div className="min-w-0 px-4 py-6 md:px-8 md:py-8">{children}</div>
    </div>
  );
}
