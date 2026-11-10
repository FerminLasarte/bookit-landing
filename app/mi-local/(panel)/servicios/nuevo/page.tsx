import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Encabezado from "@/components/mi-local/Encabezado";
import FormularioDeServicio from "@/components/mi-local/FormularioDeServicio";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { leerPlanDelLocal } from "@/lib/mi-local/gestion";
import { leerLocalDelDuenio } from "@/lib/mi-local/lugar";
import { leerCategoriasConNombre } from "@/lib/mi-local/perfil";

export const metadata: Metadata = { title: miLocal.servicio.nuevo };

export default async function NuevoServicioPage() {
  const local = (await leerLocalDelDuenio()) ?? redirect("/mi-local");
  const copy = miLocal.servicio;
  const [plan, categorias] = await Promise.all([
    leerPlanDelLocal(local.suscripcion.nivel),
    // Sin las categorías el servicio se guarda igual: la base le pone la principal.
    leerCategoriasConNombre(local.id).catch((error: unknown) => {
      console.error("mi-local/categorias-del-servicio:", error);
      return [];
    }),
  ]);

  return (
    // Un formulario no se estira: ancho de lectura, a la izquierda (D2 del plan del panel).
    <div className="flex max-w-2xl flex-col gap-6 md:gap-8">
      <Encabezado titulo={copy.nuevo} accion={<TextLink href="/mi-local/servicios">{copy.volver}</TextLink>} />
      <Superficie tone="surface" className="p-5 md:p-6">
        <FormularioDeServicio sena={plan.cobroMp} categorias={categorias} />
      </Superficie>
    </div>
  );
}
