"use client";

import { useActionState } from "react";
import { invitar, sumarProfesional, type EstadoDeEquipo } from "@/app/mi-local/(panel)/equipo/acciones";
import Field from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { enviarSinBorrar } from "@/lib/formularios";
import type { Incluye } from "@/lib/mi-local/gestion";
import RespuestaDeAccion from "./RespuestaDeAccion";

type Forma = "sinCuenta" | "conCuenta" | "yo";

/**
 * Una forma de sumar a alguien: sin cuenta (sólo el nombre), con su cuenta (una
 * invitación por mail) o el dueño mismo. Cada una es su propio formulario,
 * como los caminos de `AddProfessionalBottomSheet`.
 */
export default function AltaDeProfesional({
  forma,
  plan,
  nombre,
}: {
  forma: Forma;
  /** Para invitar: si el plan incluye las cuentas del equipo. */
  plan?: Incluye;
  /** Para "Agregarme": el nombre de la cuenta, ya escrito. */
  nombre?: string | null;
}) {
  const copy = miLocal.sumar;
  const textos = copy[forma];
  const [estado, enviar, enviando] = useActionState<EstadoDeEquipo, FormData>(
    forma === "conCuenta" ? invitar : sumarProfesional,
    { error: null },
  );
  const bloqueada = forma === "conCuenta" && !plan?.incluida;

  return (
    <Superficie tone="surface" className="p-5 md:p-6">
      <h2 className="font-semibold text-fg">{textos.titulo}</h2>
      <p className="mt-1 text-small text-muted">{textos.bajada}</p>
      {bloqueada ? (
        plan?.desde && (
          <p className="mt-4 text-small text-fg">
            {copy.conCuenta.bloqueado(plan.desde)} <TextLink href="/planes">{miLocal.equipo.verPlanes}</TextLink>
          </p>
        )
      ) : (
        <form onSubmit={enviarSinBorrar(enviar)} className="mt-4 flex flex-col gap-4">
          {forma === "yo" && <input type="hidden" name="soy_yo" value="1" />}
          {forma === "conCuenta" ? (
            <Field id="alta-email" label={copy.conCuenta.email}>
              {(props) => <input {...props} name="email" type="email" autoComplete="off" maxLength={200} />}
            </Field>
          ) : (
            <Field id={`alta-nombre-${forma}`} label={forma === "yo" ? copy.yo.nombre : copy.sinCuenta.nombre}>
              {(props) => <input {...props} name="nombre" type="text" autoComplete="off" maxLength={80} defaultValue={nombre ?? ""} />}
            </Field>
          )}
          <RespuestaDeAccion estado={estado} />
          <Button type="submit" size="compact" disabled={enviando} className="self-start">
            {enviando ? copy.enviando : textos.boton}
          </Button>
        </form>
      )}
    </Superficie>
  );
}
