import type { ReactNode } from "react";
import Anchor from "@/components/ui/Anchor";
import MarcoDePanel from "@/components/ui/MarcoDePanel";
import Wordmark from "@/components/ui/Wordmark";
import { miLocal } from "@/content/mi-local";
import type { Lugar } from "@/lib/mi-local/lugar";
import CambiarDeLugar from "./CambiarDeLugar";
import IdentidadDelLocal from "./IdentidadDelLocal";
import PestanasDelPanel from "./PestanasDelPanel";
import Salir from "./Salir";
import SeccionesDelPanel from "./SeccionesDelPanel";

/*
 * El marco del panel del local (plan del panel, D1–D5), sobre el de los
 * paneles (`ui/MarcoDePanel`): el local arriba, las secciones y la cuenta. En
 * el teléfono las secciones van en pestañas abajo (D1 del plan de la fase 3).
 * Un profesional del equipo ve sus secciones y no el plan (D2 del plan del
 * equipo).
 */

/**
 * La cuenta: cambiar de local, el plan, salir y la firma. Abajo de la barra en
 * la compu; en el menú del teléfono. El plan es del dueño: `mi_plan_web()` no
 * conoce el local ajeno.
 */
function Cuenta({ lugar }: { lugar: Lugar }) {
  const copy = miLocal.panel;
  return (
    <div className="flex flex-col gap-3 px-4">
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
  const copy = miLocal.panel;
  return (
    <MarcoDePanel
      identidad={<IdentidadDelLocal nombre={lugar.nombre} logo={lugar.logo} className="px-2" />}
      barra={<IdentidadDelLocal nombre={lugar.nombre} logo={lugar.logo} />}
      secciones={<SeccionesDelPanel secciones={secciones} />}
      cuenta={<Cuenta lugar={lugar} />}
      pestanas={<PestanasDelPanel secciones={secciones} />}
      menu={{ abrir: copy.menu, cerrar: copy.cerrarMenu }}
    >
      {children}
    </MarcoDePanel>
  );
}
