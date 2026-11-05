import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import MenuDePanel from "./MenuDePanel";

/*
 * El marco de un panel de trabajo, fuera del sitio: el del local (/mi-local) y
 * el del equipo (/admin). En la compu, una barra clara a la izquierda con la
 * identidad arriba, las secciones y la cuenta abajo; el resto es el área de
 * trabajo, a todo el ancho. En el teléfono, una barra arriba con un menú.
 *
 * Con `pestanas`, las secciones del teléfono van abajo, como en la app, y el
 * menú lleva sólo la cuenta. Sin ellas, el menú lleva las secciones y la
 * cuenta.
 */
export default function MarcoDePanel({
  identidad,
  barra = identidad,
  secciones,
  cuenta,
  pestanas,
  menu,
  children,
}: {
  /** Lo de arriba de la barra lateral. */
  identidad: ReactNode;
  /** Lo de la barra de arriba del teléfono, al lado del menú. Si falta, la identidad. */
  barra?: ReactNode;
  secciones: ReactNode;
  cuenta: ReactNode;
  pestanas?: ReactNode;
  /** Los textos del botón del menú. */
  menu: { abrir: string; cerrar: string };
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 overflow-y-auto border-r border-line px-3 py-6 lg:flex">
        {identidad}
        {secciones}
        <div className="mt-auto border-t border-line pt-4">{cuenta}</div>
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-line bg-page px-4 lg:hidden">
        {barra}
        <MenuDePanel abrir={menu.abrir} cerrar={menu.cerrar}>
          {pestanas ? (
            cuenta
          ) : (
            <>
              {secciones}
              <div className="mt-4 border-t border-line pt-4">{cuenta}</div>
            </>
          )}
        </MenuDePanel>
      </header>

      {/* Con pestañas, abajo queda lugar para ellas en el teléfono. */}
      <div className={cn("min-w-0 px-4 pt-6 pb-8 md:px-8 md:pt-8", pestanas ? "pb-24 lg:pb-8" : undefined)}>{children}</div>
      {pestanas}
    </div>
  );
}
