import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import BajaDeServicio from "@/components/mi-local/BajaDeServicio";
import Encabezado from "@/components/mi-local/Encabezado";
import ErrorDeLectura from "@/components/mi-local/ErrorDeLectura";
import FormularioDeServicio from "@/components/mi-local/FormularioDeServicio";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { leerLocalQueEntra } from "@/lib/mi-local/agenda";
import { contarTurnosPorVenir, leerSenaDelPlan, leerServicio } from "@/lib/mi-local/gestion";

export const metadata: Metadata = { title: miLocal.servicio.editar };

/** Editar un servicio y, abajo, eliminarlo. Uno de otro local o ya dado de baja es un 404. */
export default async function EditarServicioPage({ params }: PageProps<"/mi-local/servicios/[id]">) {
  const { id } = await params;
  const local = (await leerLocalQueEntra()) ?? redirect("/mi-local");

  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) notFound();

  const copy = miLocal.servicio;
  const [servicio, sena, reservados] = await Promise.all([
    // `undefined`: no se pudo leer, que no es lo mismo que no existir.
    leerServicio(local.id, numero).catch((error: unknown) => {
      console.error("mi-local/editar-servicio:", error);
      return undefined;
    }),
    leerSenaDelPlan(local.suscripcion.nivel),
    contarTurnosPorVenir(numero),
  ]);
  if (servicio === null) notFound();

  if (!servicio) {
    return (
      <div className="flex max-w-2xl flex-col gap-6 md:gap-8">
        <Encabezado titulo={copy.editar} accion={<TextLink href="/mi-local/servicios">{copy.volver}</TextLink>} />
        <ErrorDeLectura>{copy.errorDeLectura}</ErrorDeLectura>
      </div>
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6 md:gap-8">
      <Encabezado
        titulo={copy.editar}
        bajada={servicio.nombre}
        accion={<TextLink href="/mi-local/servicios">{copy.volver}</TextLink>}
      />
      <Superficie tone="surface" className="p-5 md:p-6">
        <FormularioDeServicio servicio={servicio} sena={sena} />
      </Superficie>
      <BajaDeServicio id={servicio.id} nombre={servicio.nombre} reservados={reservados} />
    </div>
  );
}
