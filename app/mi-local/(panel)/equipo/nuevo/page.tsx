import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AltaDeProfesional from "@/components/mi-local/AltaDeProfesional";
import Encabezado from "@/components/mi-local/Encabezado";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { leerLocalQueEntra } from "@/lib/mi-local/agenda";
import { leerEquipo, leerMiCuenta, leerPlanDelLocal } from "@/lib/mi-local/gestion";

export const metadata: Metadata = { title: miLocal.sumar.titulo };

/** Sumar a alguien al equipo. "Agregarme" sólo aparece si el dueño todavía no atiende. */
export default async function SumarProfesionalPage() {
  const local = (await leerLocalQueEntra()) ?? redirect("/mi-local");
  const copy = miLocal.sumar;

  const [cuenta, plan] = await Promise.all([leerMiCuenta().catch(() => null), leerPlanDelLocal(local.suscripcion.nivel)]);
  // Sin saber si ya está, no se le ofrece sumarse: la base lo frenaría igual (uno por persona y local).
  const yaAtiende = cuenta
    ? await leerEquipo(local.id, cuenta.id)
        .then((equipo) => equipo.some((m) => m.esDuenio))
        .catch(() => true)
    : true;

  return (
    <div className="flex max-w-2xl flex-col gap-6 md:gap-8">
      <Encabezado titulo={copy.titulo} bajada={copy.bajada} accion={<TextLink href="/mi-local/equipo">{copy.volver}</TextLink>} />
      <AltaDeProfesional forma="sinCuenta" />
      <AltaDeProfesional forma="conCuenta" plan={plan.cuentasStaff} />
      {!yaAtiende && <AltaDeProfesional forma="yo" nombre={cuenta?.nombre} />}
    </div>
  );
}
