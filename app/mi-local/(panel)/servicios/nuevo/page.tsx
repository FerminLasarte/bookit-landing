import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Encabezado from "@/components/mi-local/Encabezado";
import FormularioDeServicio from "@/components/mi-local/FormularioDeServicio";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { leerPlanDelLocal } from "@/lib/mi-local/gestion";
import { leerLocalDelDuenio } from "@/lib/mi-local/lugar";

export const metadata: Metadata = { title: miLocal.servicio.nuevo };

export default async function NuevoServicioPage() {
  const local = (await leerLocalDelDuenio()) ?? redirect("/mi-local");
  const copy = miLocal.servicio;
  const plan = await leerPlanDelLocal(local.suscripcion.nivel);

  return (
    // Un formulario no se estira: ancho de lectura, a la izquierda (D2 del plan del panel).
    <div className="flex max-w-2xl flex-col gap-6 md:gap-8">
      <Encabezado titulo={copy.nuevo} accion={<TextLink href="/mi-local/servicios">{copy.volver}</TextLink>} />
      <Superficie tone="surface" className="p-5 md:p-6">
        <FormularioDeServicio sena={plan.cobroMp} />
      </Superficie>
    </div>
  );
}
