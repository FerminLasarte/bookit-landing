import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Encabezado from "@/components/mi-local/Encabezado";
import ErrorDeLectura from "@/components/mi-local/ErrorDeLectura";
import Invitaciones from "@/components/mi-local/Invitaciones";
import ListaDelEquipo from "@/components/mi-local/ListaDelEquipo";
import PreciosLibres from "@/components/mi-local/PreciosLibres";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { leerEquipo, leerInvitaciones, leerMiCuenta, leerPlanDelLocal, leerPreciosLibres } from "@/lib/mi-local/gestion";
import { leerLocalDelDuenio } from "@/lib/mi-local/lugar";

export const metadata: Metadata = { title: miLocal.equipo.titulo };

/*
 * El equipo del local (fase 3, docs/PLAN-MI-LOCAL-FASE-3.md): los miembros,
 * las invitaciones que esperan y "Precios libres", como Gestión › Equipo de la
 * app. Cada profesional tiene su página; sumar a alguien, también.
 */
export default async function EquipoPage() {
  const local = (await leerLocalDelDuenio()) ?? redirect("/mi-local");
  const copy = miLocal.equipo;

  const [lectura, plan] = await Promise.all([
    (async () => {
      const cuenta = await leerMiCuenta();
      return Promise.all([leerEquipo(local.id, cuenta.id), leerInvitaciones(local.id), leerPreciosLibres(local.id)]);
    })().catch((error: unknown) => {
      console.error("mi-local/equipo:", error);
      return null;
    }),
    leerPlanDelLocal(local.suscripcion.nivel),
  ]);

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <Encabezado
        titulo={copy.titulo}
        bajada={plan.tope !== null ? copy.tope(plan.tope) : undefined}
        accion={
          <Button href="/mi-local/equipo/nuevo" size="compact">
            {copy.agregar}
          </Button>
        }
      />

      {!lectura ? (
        <ErrorDeLectura>{copy.error}</ErrorDeLectura>
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold text-fg">{copy.miembros}</h2>
              {/* Elegir sólo tiene sentido si hay a quién sumar: alguien pausado. */}
              {plan.tope !== null && lectura[0].some((m) => !m.activo) && (
                <TextLink href="/mi-local/equipo/quienes-siguen">{copy.elegirQuienesSiguen}</TextLink>
              )}
            </div>
            {lectura[0].length > 0 ? (
              <ListaDelEquipo equipo={lectura[0]} />
            ) : (
              <Superficie tone="surface" className="p-6 text-center">
                <p className="font-semibold text-fg">{copy.vacio.titulo}</p>
                <p className="mt-1 text-small text-muted">{copy.vacio.bajada}</p>
              </Superficie>
            )}
          </section>

          {lectura[1].length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-semibold text-fg">{copy.invitaciones.titulo}</h2>
              <Invitaciones invitaciones={lectura[1]} />
            </section>
          )}

          <PreciosLibres prendido={lectura[2]} plan={plan.preciosPorProfesional} />
        </>
      )}
    </div>
  );
}
