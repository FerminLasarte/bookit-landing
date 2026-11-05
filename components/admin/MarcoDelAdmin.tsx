import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import type { ReactNode } from "react";
import Anchor from "@/components/ui/Anchor";
import Badge from "@/components/ui/Badge";
import MarcoDePanel from "@/components/ui/MarcoDePanel";
import Wordmark from "@/components/ui/Wordmark";
import { marcoAdmin } from "@/content/admin";
import { leerParaAtender, leerQuienEntro } from "@/lib/admin/datos";
import Atajos, { BotonBuscar } from "./Atajos";
import { cuantosParaAtender } from "./ParaAtender";
import SeccionesDelAdmin, { SeccionActual, type Contadores } from "./SeccionesDelAdmin";

/*
 * El marco del panel del equipo, sobre el de los paneles (`ui/MarcoDePanel`):
 * la marca arriba, las secciones en sus grupos y la cuenta abajo
 * (docs/PLAN-ADMIN-V5.md, paso Q). En el teléfono, las secciones van en el
 * menú: son demasiadas para pestañas. Arriba de las secciones, "Buscar", que
 * abre lo mismo que ⌘K (paso R). Inicio y Cobros llevan cuánto pide una mano
 * (paso V).
 */

/**
 * Los contadores de la barra. Si la lectura falla, el panel sigue sin
 * números: no vale tirar todas las páginas por un contador. La redirección de
 * quien no es del equipo sí sigue su curso.
 */
async function contadores(): Promise<Contadores> {
  try {
    const d = await leerParaAtender();
    return { inicio: cuantosParaAtender(d), cobros: d.incidencias_abiertas + d.debitos_con_problemas };
  } catch (error) {
    unstable_rethrow(error);
    console.error("admin/contadores:", error);
    return {};
  }
}

/** Quién entró, la salida y la vuelta al sitio. */
function Cuenta({ email }: { email: string | null }) {
  return (
    <div className="flex flex-col gap-3 px-4">
      {email && <p className="truncate text-small text-fg" title={email}>{email}</p>}
      <form action="/admin/auth/salir" method="post">
        <button type="submit" className="ring-focus text-small text-muted hover:text-fg">
          {marcoAdmin.salir}
        </button>
      </form>
      <Anchor
        href="/"
        className="ring-focus mt-3 flex items-center gap-1.5 self-start rounded-pill text-micro text-muted hover:text-fg"
      >
        <Wordmark isotipo className="size-4" />
        {marcoAdmin.irALaWeb}
      </Anchor>
    </div>
  );
}

export default async function MarcoDelAdmin({ children }: { children: ReactNode }) {
  const [{ email }, cuantos] = await Promise.all([leerQuienEntro(), contadores()]);

  return (
    <Atajos>
      <MarcoDePanel
        identidad={
          <Link href="/admin" className="ring-focus flex items-center gap-3 self-start rounded-pill px-2">
            <Wordmark className="h-7" />
            <Badge>{marcoAdmin.insignia}</Badge>
          </Link>
        }
        barra={
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/admin" aria-label="Inicio" className="ring-focus shrink-0 rounded-pill">
              <Wordmark isotipo className="size-7" />
            </Link>
            <SeccionActual />
          </div>
        }
        secciones={
          <div className="flex flex-col gap-5">
            <BotonBuscar />
            <SeccionesDelAdmin contadores={cuantos} />
          </div>
        }
        cuenta={<Cuenta email={email} />}
        menu={{ abrir: marcoAdmin.menu, cerrar: marcoAdmin.cerrarMenu }}
      >
        {children}
      </MarcoDePanel>
    </Atajos>
  );
}
