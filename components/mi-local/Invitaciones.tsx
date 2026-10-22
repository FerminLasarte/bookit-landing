"use client";

import { useActionState, useRef } from "react";
import { reenviarInvitacion, revocarInvitacion, type EstadoDeEquipo } from "@/app/mi-local/(panel)/equipo/acciones";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Dialogo, { Volver } from "@/components/ui/Dialogo";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import type { Invitacion } from "@/lib/mi-local/gestion";
import RespuestaDeAccion from "./RespuestaDeAccion";

/** Las invitaciones que esperan respuesta, como `InvitacionCard`: reenviar la vencida y revocar con confirmación. */
export default function Invitaciones({ invitaciones }: { invitaciones: Invitacion[] }) {
  return (
    <Superficie tone="surface">
      <ul className="divide-y divide-line">
        {invitaciones.map((i) => (
          <Fila key={i.id} invitacion={i} />
        ))}
      </ul>
    </Superficie>
  );
}

function Fila({ invitacion }: { invitacion: Invitacion }) {
  const copy = miLocal.equipo.invitaciones;
  const dialogo = useRef<HTMLDialogElement>(null);
  const titulo = `revocar-${invitacion.id}`;
  const [reenvio, reenviar, reenviando] = useActionState<EstadoDeEquipo, FormData>(reenviarInvitacion, { error: null });
  const [revocacion, revocar, revocando] = useActionState<EstadoDeEquipo, FormData>(revocarInvitacion, { error: null });

  return (
    <li className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
      <div className="min-w-0">
        <p className="truncate font-semibold text-fg">{invitacion.email}</p>
        <div className="mt-1">
          <Badge tono={invitacion.vencida ? "mal" : "neutro"}>{invitacion.vencida ? copy.vencida : copy.esperando}</Badge>
        </div>
        <RespuestaDeAccion estado={reenvio} className="mt-2" />
      </div>
      <div className="flex shrink-0 items-center gap-4">
        {invitacion.vencida && (
          <form action={reenviar}>
            <input type="hidden" name="id" value={invitacion.id} />
            <Button type="submit" size="compact" variant="secondary" disabled={reenviando}>
              {reenviando ? copy.reenviando : copy.reenviar}
            </Button>
          </form>
        )}
        <button
          type="button"
          onClick={() => dialogo.current?.showModal()}
          className="ring-focus rounded-[4px] px-1 text-small font-semibold text-danger underline-offset-2 hover:underline"
        >
          {copy.revocar}
        </button>
      </div>

      <Dialogo ref={dialogo} etiqueta={titulo}>
        <h2 id={titulo} className="text-title font-bold text-fg">
          {copy.revocar}
        </h2>
        <p className="mt-3 text-body text-fg">{copy.confirmarRevocar(invitacion.email)}</p>
        <form action={revocar} className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <input type="hidden" name="id" value={invitacion.id} />
          <Button type="submit" variant="secondary" disabled={revocando} className="flex-1">
            {revocando ? copy.revocando : copy.revocarSi}
          </Button>
          <Volver onClick={() => dialogo.current?.close()} className="flex-1">
            {copy.volver}
          </Volver>
        </form>
        <RespuestaDeAccion estado={revocacion} className="mt-3 text-center" />
      </Dialogo>
    </li>
  );
}
