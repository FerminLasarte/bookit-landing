import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import ActividadDelProfesional from "@/components/mi-local/ActividadDelProfesional";
import Avatar from "@/components/mi-local/Avatar";
import DatosDelProfesional from "@/components/mi-local/DatosDelProfesional";
import Encabezado from "@/components/mi-local/Encabezado";
import ErrorDeLectura from "@/components/mi-local/ErrorDeLectura";
import ServiciosDelProfesional from "@/components/mi-local/ServiciosDelProfesional";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { leerLocalQueEntra } from "@/lib/mi-local/agenda";
import {
  leerMiCuenta,
  leerMiembro,
  leerPlanDelLocal,
  leerPreciosLibres,
  leerResumenDeBaja,
  leerServicios,
  leerServiciosAsignados,
  loEditaElDuenio,
} from "@/lib/mi-local/gestion";

export const metadata: Metadata = { title: miLocal.equipo.titulo };

/**
 * Un profesional del equipo: sus datos, sus servicios y si recibe turnos. Lo
 * del dueño y lo de los que no tienen cuenta se edita; lo de los que tienen
 * cuenta, se ve (D2 del plan de la fase 3).
 */
export default async function ProfesionalPage({ params }: PageProps<"/mi-local/equipo/[id]">) {
  const { id } = await params;
  const local = (await leerLocalQueEntra()) ?? redirect("/mi-local");
  const copy = miLocal.profesional;
  const volver = <TextLink href="/mi-local/equipo">{copy.volver}</TextLink>;

  const lectura = await (async () => {
    const cuenta = await leerMiCuenta();
    const miembro = await leerMiembro(local.id, id, cuenta.id);
    if (!miembro) return null;
    const [servicios, asignados, preciosLibres, plan, resumen] = await Promise.all([
      leerServicios(local.id),
      leerServiciosAsignados(miembro.id),
      leerPreciosLibres(local.id),
      leerPlanDelLocal(local.suscripcion.nivel),
      miembro.activo ? leerResumenDeBaja(miembro.id) : null,
    ]);
    return { miembro, servicios, asignados, resumen, conPrecio: preciosLibres && plan.preciosPorProfesional.incluida };
  })().catch((error: unknown) => {
    console.error("mi-local/profesional:", error);
    return undefined;
  });

  if (lectura === null) notFound();
  if (!lectura) {
    return (
      <div className="flex max-w-3xl flex-col gap-6 md:gap-8">
        <Encabezado titulo={miLocal.equipo.titulo} accion={volver} />
        <ErrorDeLectura>{copy.error}</ErrorDeLectura>
      </div>
    );
  }

  const { miembro, servicios, asignados, resumen, conPrecio } = lectura;
  const editable = loEditaElDuenio(miembro);

  return (
    <div className="flex max-w-3xl flex-col gap-6 md:gap-8">
      <div className="flex items-center gap-4">
        <Avatar nombre={miembro.nombre} foto={miembro.foto} />
        <div className="min-w-0 flex-1">
          <Encabezado titulo={miembro.nombre} bajada={miembro.email ?? undefined} accion={volver} />
        </div>
      </div>

      <Bloque titulo={copy.datos.titulo}>
        {editable ? (
          <DatosDelProfesional miembro={miembro} />
        ) : (
          <>
            {miembro.bio && <p className="text-body text-fg">{miembro.bio}</p>}
            <p className="text-small text-muted">{copy.datos.soloLectura}</p>
          </>
        )}
      </Bloque>

      <Bloque titulo={copy.servicios.titulo} bajada={copy.servicios.bajada}>
        {servicios.length > 0 ? (
          <ServiciosDelProfesional
            idProfesional={miembro.id}
            servicios={servicios}
            asignados={asignados}
            editable={editable}
            conPrecio={conPrecio}
          />
        ) : (
          <p className="text-small text-muted">
            {copy.servicios.ninguno} <TextLink href="/mi-local/servicios/nuevo">{copy.servicios.cargarServicios}</TextLink>
          </p>
        )}
      </Bloque>

      <Bloque titulo={copy.horarios.titulo} bajada={copy.horarios.bajada}>
        <TextLink href={`/mi-local/horarios?profesional=${miembro.id}`} className="self-start">
          {editable ? copy.horarios.editar : copy.horarios.ver}
        </TextLink>
      </Bloque>

      <Superficie tone="surface" className="p-5 md:p-6">
        <ActividadDelProfesional miembro={miembro} resumen={resumen} />
      </Superficie>
    </div>
  );
}

function Bloque({ titulo, bajada, children }: { titulo: string; bajada?: string; children: ReactNode }) {
  return (
    <Superficie tone="surface" className="flex flex-col gap-4 p-5 md:p-6">
      <div>
        <h2 className="font-semibold text-fg">{titulo}</h2>
        {bajada && <p className="mt-1 text-small text-muted">{bajada}</p>}
      </div>
      {children}
    </Superficie>
  );
}
