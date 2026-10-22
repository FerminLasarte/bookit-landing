import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Encabezado from "@/components/mi-local/Encabezado";
import FormularioDeCupon from "@/components/mi-local/FormularioDeCupon";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { hoy } from "@/lib/formato";
import { leerPlanDelLocal, leerServicios } from "@/lib/mi-local/gestion";
import { leerLocalDelDuenio } from "@/lib/mi-local/lugar";

export const metadata: Metadata = { title: miLocal.cupon.nuevo };

/** Un cupón nuevo. Sin promociones en el plan no se ofrece: la base lo frenaría. */
export default async function NuevoCuponPage() {
  const local = (await leerLocalDelDuenio()) ?? redirect("/mi-local");
  const copy = miLocal.cupon;
  const [plan, servicios] = await Promise.all([
    leerPlanDelLocal(local.suscripcion.nivel),
    // Sin la lista, el cupón vale en todos, que es lo que quiere decir no elegir ninguno.
    leerServicios(local.id).catch(() => []),
  ]);
  if (!plan.promociones.incluida) redirect("/mi-local/crecimiento/cupones");

  return (
    // Un formulario no se estira: ancho de lectura, a la izquierda (D2 del plan del panel).
    <div className="flex max-w-2xl flex-col gap-6 md:gap-8">
      <Encabezado titulo={copy.nuevo} accion={<TextLink href="/mi-local/crecimiento/cupones">{copy.volver}</TextLink>} />
      <Superficie tone="surface" className="p-5 md:p-6">
        <FormularioDeCupon servicios={servicios} hoy={hoy()} />
      </Superficie>
    </div>
  );
}
