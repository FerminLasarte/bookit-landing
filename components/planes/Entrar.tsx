"use client";

import { useActionState } from "react";
import { entrarConMail, type EstadoDeEntrar } from "@/app/planes/acciones";
import Field from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import { planes } from "@/content/planes";

/*
 * Entrar con la cuenta de la app: Google, Apple o mail y contraseña, el mismo
 * Supabase Auth. No hay alta: la cuenta se crea en la app.
 */
export default function Entrar({ error }: { error: string | null }) {
  const copy = planes.sinSesion.entrar;
  const [estado, enviar, enviando] = useActionState<EstadoDeEntrar, FormData>(entrarConMail, { error: null });
  const mensaje = estado.error ?? error;

  return (
    <Superficie tone="surface" className="mx-auto flex w-full max-w-[24rem] flex-col gap-5 p-6 md:p-8">
      <div className="text-center">
        <h2 className="text-title font-bold text-fg">{copy.titulo}</h2>
        <p className="mt-1 text-small text-muted">{copy.bajada}</p>
      </div>

      <div className="flex flex-col gap-2">
        <form action="/planes/auth/google" method="post">
          <Button type="submit" variant="secondary" className="w-full">
            {copy.google}
          </Button>
        </form>
        <form action="/planes/auth/apple" method="post">
          <Button type="submit" variant="secondary" className="w-full">
            {copy.apple}
          </Button>
        </form>
      </div>

      <p className="flex items-center gap-3 text-micro text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
        {copy.separador}
      </p>

      <form action={enviar} className="flex flex-col gap-4">
        <Field id="entrar-email" label={copy.mail}>
          {(props) => <input {...props} name="email" type="email" autoComplete="email" required />}
        </Field>
        <Field id="entrar-password" label={copy.contrasena}>
          {(props) => <input {...props} name="password" type="password" autoComplete="current-password" required />}
        </Field>
        {mensaje && (
          <p role="alert" className="text-small font-medium text-danger">
            {mensaje}
          </p>
        )}
        <Button type="submit" disabled={enviando} className="w-full">
          {copy.boton}
        </Button>
        <p className="text-center text-micro text-muted">{copy.olvido}</p>
      </form>
    </Superficie>
  );
}
