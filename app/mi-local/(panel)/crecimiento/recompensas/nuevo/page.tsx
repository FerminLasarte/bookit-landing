import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Encabezado from "@/components/mi-local/Encabezado";
import FormularioDePremio from "@/components/mi-local/FormularioDePremio";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { leerProgramaDePuntos } from "@/lib/mi-local/cupones";
import { leerServicios } from "@/lib/mi-local/gestion";
import { leerLocalDelDuenio } from "@/lib/mi-local/lugar";

export const metadata: Metadata = { title: miLocal.premio.nuevo };

/** Un premio nuevo. Con el programa apagado no se ofrece, como en la app. */
export default async function NuevoPremioPage() {
  const local = (await leerLocalDelDuenio()) ?? redirect("/mi-local");
  const copy = miLocal.premio;
  const [prendido, servicios] = await Promise.all([
    leerProgramaDePuntos(local.id).catch(() => false),
    // Sin la lista, el premio vale en todos, que es lo que quiere decir no elegir ninguno.
    leerServicios(local.id).catch(() => []),
  ]);
  if (!prendido) redirect("/mi-local/crecimiento/recompensas");

  return (
    // Un formulario no se estira: ancho de lectura, a la izquierda (D2 del plan del panel).
    <div className="flex max-w-2xl flex-col gap-6 md:gap-8">
      <Encabezado titulo={copy.nuevo} accion={<TextLink href="/mi-local/crecimiento/recompensas">{copy.volver}</TextLink>} />
      <Superficie tone="surface" className="p-5 md:p-6">
        <FormularioDePremio servicios={servicios} />
      </Superficie>
    </div>
  );
}
