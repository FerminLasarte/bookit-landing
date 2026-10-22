import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Encabezado from "@/components/mi-local/Encabezado";
import ErrorDeLectura from "@/components/mi-local/ErrorDeLectura";
import FormularioDeCupon from "@/components/mi-local/FormularioDeCupon";
import PausarYEliminar from "@/components/mi-local/PausarYEliminar";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { hoy } from "@/lib/formato";
import { leerCupon } from "@/lib/mi-local/cupones";
import { leerPlanDelLocal, leerServicios } from "@/lib/mi-local/gestion";
import { leerLocalDelDuenio } from "@/lib/mi-local/lugar";

export const metadata: Metadata = { title: miLocal.cupon.editar };

/**
 * Editar un cupón y, abajo, pausarlo o eliminarlo. En un plan sin
 * promociones no se edita ni se activa, como en la app: prometería un cupón
 * que nadie puede usar. Eliminar sigue. Uno de otro local es un 404.
 */
export default async function EditarCuponPage({ params }: PageProps<"/mi-local/crecimiento/cupones/[id]">) {
  const { id } = await params;
  const local = (await leerLocalDelDuenio()) ?? redirect("/mi-local");

  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) notFound();

  const copy = miLocal.cupon;
  const [cupon, plan, servicios] = await Promise.all([
    // `undefined`: no se pudo leer, que no es lo mismo que no existir.
    leerCupon(local.id, numero).catch((error: unknown) => {
      console.error("mi-local/editar-cupon:", error);
      return undefined;
    }),
    leerPlanDelLocal(local.suscripcion.nivel),
    leerServicios(local.id).catch(() => []),
  ]);
  if (cupon === null) notFound();

  const volver = <TextLink href="/mi-local/crecimiento/cupones">{copy.volver}</TextLink>;
  if (!cupon) {
    return (
      <div className="flex max-w-2xl flex-col gap-6 md:gap-8">
        <Encabezado titulo={copy.editar} accion={volver} />
        <ErrorDeLectura>{copy.errorDeLectura}</ErrorDeLectura>
      </div>
    );
  }

  const bloqueado = !plan.promociones.incluida;
  return (
    <div className="flex max-w-2xl flex-col gap-6 md:gap-8">
      <Encabezado titulo={copy.editar} bajada={cupon.codigo} accion={volver} />
      {bloqueado ? (
        <Superficie tone="surface" className="p-5 md:p-6">
          <p className="text-small text-fg">
            {copy.bloqueado(plan.promociones.desde ?? miLocal.crecimiento.bloqueado.otroPlan)}{" "}
            <TextLink href="/planes">{miLocal.cupones.verPlanes}</TextLink>
          </p>
        </Superficie>
      ) : (
        <Superficie tone="surface" className="p-5 md:p-6">
          <FormularioDeCupon cupon={cupon} servicios={servicios} hoy={hoy()} />
        </Superficie>
      )}
      <PausarYEliminar cual="cupon" id={cupon.id} nombre={cupon.nombre || cupon.codigo} activo={cupon.activo} conEstado={!bloqueado} />
    </div>
  );
}
