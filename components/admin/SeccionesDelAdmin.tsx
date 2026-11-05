"use client";

import { House, ScrollText, ShieldCheck, Store, Users, Wallet, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import EnlaceDeSeccion from "@/components/ui/EnlaceDeSeccion";
import { gruposAdmin, inicioAdmin, marcoAdmin, seccionesAdmin, type SeccionAdmin } from "@/content/admin";
import { cn } from "@/lib/utils";

const iconos: Record<SeccionAdmin["id"], LucideIcon> = {
  inicio: House,
  comercios: Store,
  personas: Users,
  cobros: Wallet,
  equipo: ShieldCheck,
  registro: ScrollText,
};

/** La sección en la que se está: Inicio sólo en /admin; las otras, también en sus fichas. */
function useSeccionActual() {
  const ruta = usePathname();
  return seccionesAdmin.find((s) => (s.href === "/admin" ? ruta === "/admin" : ruta.startsWith(s.href)));
}

/** Cuánto pide una mano en cada sección, de `admin_para_atender` (paso V). Las que no tienen, sin número. */
export type Contadores = Partial<Record<SeccionAdmin["id"], number>>;

/** Las secciones en sus grupos: en la barra lateral de la compu y en el menú del teléfono. */
export default function SeccionesDelAdmin({ contadores = {} }: { contadores?: Contadores }) {
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
              const cuantos = contadores[s.id] ?? 0;
              return (
                <li key={s.id}>
                  <EnlaceDeSeccion href={s.href} activa={activa} className="gap-3">
                    <Icono aria-hidden className="size-[1.125rem] shrink-0" strokeWidth={activa ? 2.25 : 1.75} />
                    {s.label}
                    {cuantos > 0 && (
                      <span
                        className={cn(
                          "num ml-auto min-w-6 rounded-pill px-1.5 text-center text-micro font-semibold",
                          activa ? "bg-page/20 text-page" : "bg-accent/20 text-fg",
                        )}
                      >
                        <span aria-hidden>{cuantos}</span>
                        <span className="sr-only">{inicioAdmin.pendientes(cuantos)}</span>
                      </span>
                    )}
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
