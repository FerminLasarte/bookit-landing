import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import Encabezado from "@/components/mi-local/Encabezado";
import ErrorDeLectura from "@/components/mi-local/ErrorDeLectura";
import FormularioDePremio from "@/components/mi-local/FormularioDePremio";
import PausarYEliminar from "@/components/mi-local/PausarYEliminar";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { leerPremio } from "@/lib/mi-local/cupones";
import { leerServicios } from "@/lib/mi-local/gestion";
import { leerLocalDelDuenio } from "@/lib/mi-local/lugar";

export const metadata: Metadata = { title: miLocal.premio.editar };

/** Editar un premio y, abajo, pausarlo o eliminarlo. Uno de otro local es un 404. */
export default async function EditarPremioPage({ params }: PageProps<"/mi-local/crecimiento/recompensas/[id]">) {
  const { id } = await params;
  const local = (await leerLocalDelDuenio()) ?? redirect("/mi-local");
  if (!z.uuid().safeParse(id).success) notFound();

  const copy = miLocal.premio;
  const [premio, servicios] = await Promise.all([
    // `undefined`: no se pudo leer, que no es lo mismo que no existir.
    leerPremio(local.id, id).catch((error: unknown) => {
      console.error("mi-local/editar-premio:", error);
      return undefined;
    }),
    leerServicios(local.id).catch(() => []),
  ]);
  if (premio === null) notFound();

  const volver = <TextLink href="/mi-local/crecimiento/recompensas">{copy.volver}</TextLink>;
  if (!premio) {
    return (
      <div className="flex max-w-2xl flex-col gap-6 md:gap-8">
        <Encabezado titulo={copy.editar} accion={volver} />
        <ErrorDeLectura>{copy.errorDeLectura}</ErrorDeLectura>
      </div>
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6 md:gap-8">
      <Encabezado titulo={copy.editar} bajada={premio.titulo} accion={volver} />
      <Superficie tone="surface" className="p-5 md:p-6">
        <FormularioDePremio premio={premio} servicios={servicios} />
      </Superficie>
      <PausarYEliminar cual="premio" id={premio.id} nombre={premio.titulo} activo={premio.activo} />
    </div>
  );
}
