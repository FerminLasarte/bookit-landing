import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Encabezado from "@/components/mi-local/Encabezado";
import ErrorDeLectura from "@/components/mi-local/ErrorDeLectura";
import QuienesSiguen from "@/components/mi-local/QuienesSiguen";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { leerEquipo, leerMiCuenta, leerPlanDelLocal } from "@/lib/mi-local/gestion";
import { leerLocalDelDuenio } from "@/lib/mi-local/lugar";

export const metadata: Metadata = { title: miLocal.quienesSiguen.titulo };

/** Elegir quiénes siguen dentro del tope del plan. Un plan sin tope no tiene nada que elegir: vuelve al equipo. */
export default async function QuienesSiguenPage() {
  const local = (await leerLocalDelDuenio()) ?? redirect("/mi-local");
  const copy = miLocal.quienesSiguen;
  const plan = await leerPlanDelLocal(local.suscripcion.nivel);
  if (plan.tope === null) redirect("/mi-local/equipo");

  const equipo = await leerMiCuenta()
    .then((cuenta) => leerEquipo(local.id, cuenta.id))
    .catch((error: unknown) => {
      console.error("mi-local/quienes-siguen:", error);
      return null;
    });

  return (
    <div className="flex max-w-2xl flex-col gap-6 md:gap-8">
      <Encabezado
        titulo={copy.titulo}
        bajada={copy.bajada(plan.tope)}
        accion={<TextLink href="/mi-local/equipo">{copy.volver}</TextLink>}
      />
      {equipo ? (
        <Superficie tone="surface" className="p-5 md:p-6">
          <QuienesSiguen equipo={equipo} />
        </Superficie>
      ) : (
        <ErrorDeLectura>{miLocal.equipo.error}</ErrorDeLectura>
      )}
    </div>
  );
}
