"use client";

import { useActionState, useState, useTransition } from "react";
import {
  crearCuenta,
  entrarConMail,
  reenviarMail,
  type EstadoDeCrearCuenta,
  type EstadoDeEntrar,
} from "@/app/planes/acciones";
import Field from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import TextLink, { textLinkClasses } from "@/components/ui/TextLink";
import { planes } from "@/content/planes";
import type { Destino } from "@/lib/destinos";
import { formularioSinBorrar } from "@/lib/formularios";

/*
 * Entrar con la cuenta de la app, o crearla: Google, Apple o mail y
 * contraseña, el mismo Supabase Auth. Con Google o Apple la cuenta se crea al
 * entrar; con mail, la crea `enviar_email_auth` y se confirma desde el mail
 * (BooKit, docs/web-en-pesos.md §9).
 *
 * Lo usan /planes y /mi-local, con la misma sesión: `destino` dice adónde
 * vuelve. /mi-local no ofrece crear la cuenta: quien no tiene cuenta tampoco
 * tiene local, y el alta está en /planes.
 */

type Modo = "entrar" | "crear";

export default function Entrar({
  error,
  destino = "/planes",
  conAlta = true,
}: {
  error: string | null;
  destino?: Destino;
  conAlta?: boolean;
}) {
  const { entrar: copyEntrar, crear: copyCrear } = planes.sinSesion;
  const [modo, setModo] = useState<Modo>("entrar");
  const [alEntrar, entrar, entrando] = useActionState<EstadoDeEntrar, FormData>(entrarConMail, { error: null });
  const [alCrear, crear, creando] = useActionState<EstadoDeCrearCuenta, FormData>(crearCuenta, {
    error: null,
    enviadoA: null,
  });
  // El aviso que se descartó con "Usar otro mail". Cada respuesta es un objeto nuevo, así que el próximo envío se ve.
  const [descartado, setDescartado] = useState<EstadoDeCrearCuenta | null>(null);

  if (alCrear.enviadoA && alCrear !== descartado) {
    return <MailEnviado mail={alCrear.enviadoA} onOtroMail={() => setDescartado(alCrear)} />;
  }

  const copy = modo === "entrar" ? copyEntrar : copyCrear;
  const mensaje = modo === "entrar" ? (alEntrar.error ?? error) : alCrear.error;

  return (
    <Superficie tone="surface" className="mx-auto flex w-full max-w-[24rem] flex-col gap-5 p-6 md:p-8">
      <div className="text-center">
        <h2 className="text-title font-bold text-fg">{copy.titulo}</h2>
        <p className="mt-1 text-small text-muted">{copy.bajada}</p>
      </div>

      <div className="flex flex-col gap-2">
        <form action="/planes/auth/google" method="post">
          <input type="hidden" name="destino" value={destino} />
          <Button type="submit" variant="secondary" className="w-full">
            {copyEntrar.google}
          </Button>
        </form>
        <form action="/planes/auth/apple" method="post">
          <input type="hidden" name="destino" value={destino} />
          <Button type="submit" variant="secondary" className="w-full">
            {copyEntrar.apple}
          </Button>
        </form>
      </div>

      <p className="flex items-center gap-3 text-micro text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
        {copyEntrar.separador}
      </p>

      <form
        key={modo}
        {...formularioSinBorrar(modo === "entrar" ? entrar : crear)}
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="destino" value={destino} />
        {modo === "crear" && (
          <Field id="crear-nombre" label={copyCrear.nombre}>
            {(props) => <input {...props} name="nombre" type="text" autoComplete="name" required />}
          </Field>
        )}
        <Field id={`${modo}-email`} label={copyEntrar.mail}>
          {(props) => <input {...props} name="email" type="email" autoComplete="email" required />}
        </Field>
        <Field id={`${modo}-password`} label={copyEntrar.contrasena}>
          {(props) => (
            <input
              {...props}
              name="password"
              type="password"
              autoComplete={modo === "entrar" ? "current-password" : "new-password"}
              minLength={modo === "crear" ? 6 : undefined}
              required
            />
          )}
        </Field>
        {mensaje && (
          <p role="alert" className="text-small font-medium text-danger">
            {mensaje}
          </p>
        )}
        <Button type="submit" disabled={entrando || creando} className="w-full">
          {modo === "entrar" ? copyEntrar.boton : creando ? copyCrear.creando : copyCrear.boton}
        </Button>
        {modo === "entrar" ? (
          <p className="text-center text-micro text-muted">{copyEntrar.olvido}</p>
        ) : (
          <p className="text-center text-micro text-muted">
            {copyCrear.legal} <TextLink href="/legal/terminos">{planes.pie.terminos}</TextLink> y la{" "}
            <TextLink href="/legal/privacidad">{planes.pie.privacidad}</TextLink>.
          </p>
        )}
      </form>

      {conAlta && (
        <button
          type="button"
          className={`${textLinkClasses()} self-center text-small`}
          onClick={() => setModo(modo === "entrar" ? "crear" : "entrar")}
        >
          {modo === "entrar" ? copyEntrar.aCrear : copyCrear.aEntrar}
        </button>
      )}
    </Superficie>
  );
}

/** Después de pedir la cuenta: que busque el mail, con reenvío. */
function MailEnviado({ mail, onOtroMail }: { mail: string; onOtroMail: () => void }) {
  const copy = planes.sinSesion.enviado;
  const [aviso, setAviso] = useState<string | null>(null);
  const [reenviando, reenviar] = useTransition();

  return (
    <Superficie
      tone="surface"
      className="mx-auto flex w-full max-w-[24rem] flex-col items-center gap-5 p-6 text-center md:p-8"
    >
      <div>
        <h2 className="text-title font-bold text-fg">{copy.titulo}</h2>
        <p className="mt-1 text-small text-muted">{copy.bajada(mail)}</p>
      </div>
      <Button
        variant="secondary"
        className="w-full"
        disabled={reenviando}
        onClick={() =>
          reenviar(async () => {
            const { error } = await reenviarMail(mail);
            setAviso(error ?? copy.reenviado);
          })
        }
      >
        {copy.reenviar}
      </Button>
      {aviso && (
        <p role="status" className="text-small text-muted">
          {aviso}
        </p>
      )}
      <button type="button" className={`${textLinkClasses()} text-small`} onClick={onOtroMail}>
        {copy.otro}
      </button>
    </Superficie>
  );
}
