"use client";

import { Activity, ShieldCheck, Store, Users, Wallet, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import EnlaceDeSeccion from "@/components/ui/EnlaceDeSeccion";
import { gruposAdmin, marcoAdmin } from "@/content/admin";

type Seccion = (typeof gruposAdmin)[number]["secciones"][number];

const iconos: Record<Seccion["id"], LucideIcon> = {
  pulso: Activity,
  comercios: Store,
  personas: Users,
  cobros: Wallet,
  equipo: ShieldCheck,
};

const secciones = gruposAdmin.flatMap((g): readonly Seccion[] => g.secciones);

/** La sección en la que se está: Pulso sólo en /admin; las otras, también en sus fichas. */
function useSeccionActual() {
  const ruta = usePathname();
  return secciones.find((s) => (s.href === "/admin" ? ruta === "/admin" : ruta.startsWith(s.href)));
}

/** Las secciones en sus grupos: en la barra lateral de la compu y en el menú del teléfono. */
export default function SeccionesDelAdmin() {
  const actual = useSeccionActual();

  return (
    <nav aria-label={marcoAdmin.navegacion} className="flex flex-col gap-5">
      {gruposAdmin.map((grupo) => (
        <div key={grupo.rotulo} className="flex flex-col gap-1">
          <p className="px-4 text-micro font-semibold text-muted">{grupo.rotulo}</p>
          <ul className="flex flex-col gap-1">
            {grupo.secciones.map((s) => {
              const Icono = iconos[s.id];
              const activa = s.id === actual?.id;
              return (
                <li key={s.id}>
                  <EnlaceDeSeccion href={s.href} activa={activa} className="gap-3">
                    <Icono aria-hidden className="size-[1.125rem] shrink-0" strokeWidth={activa ? 2.25 : 1.75} />
                    {s.label}
                  </EnlaceDeSeccion>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** El nombre de la sección, en la barra de arriba del teléfono: la lateral no se ve. */
export function SeccionActual() {
  const actual = useSeccionActual();
  return actual ? <span className="truncate font-bold text-fg">{actual.label}</span> : null;
}
