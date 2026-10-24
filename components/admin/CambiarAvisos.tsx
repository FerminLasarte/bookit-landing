"use client";

import { useActionState } from "react";
import { cambiarAvisos } from "@/app/admin/(panel)/acciones";
import { claseDeOpcion } from "@/components/mi-local/Opciones";
import { acciones } from "@/content/admin";
import type { Respuesta } from "@/lib/mi-local/respuesta";

/**
 * Si un admin recibe los mails del equipo. La opción vigente va llena y la
 * otra lo cambia en el acto, sin diálogo ni nota: es una preferencia. Si la
 * base no deja (el último que recibe), lo dice abajo.
 */
export default function CambiarAvisos({ idUsuario, email, recibe }: { idUsuario: string; email: string; recibe: boolean }) {
  const copy = acciones.equipo.avisos;
  const [estado, enviar, ocupado] = useActionState<Respuesta, FormData>(cambiarAvisos, { error: null });
  const opciones = [
    { valor: true, label: copy.recibe },
    { valor: false, label: copy.noRecibe },
  ];

  return (
    <form action={enviar} className="flex flex-col gap-1">
      <input type="hidden" name="id_usuario" value={idUsuario} />
      <input type="hidden" name="recibe" value={String(!recibe)} />
      <div role="group" aria-label={copy.de(email)} className="flex gap-2">
        {opciones.map((o) =>
          o.valor === recibe ? (
            <span key={o.label} aria-current="true" className={claseDeOpcion(true)}>
              {o.label}
            </span>
          ) : (
            <button key={o.label} type="submit" disabled={ocupado} className={claseDeOpcion(false)}>
              {o.label}
            </button>
          ),
        )}
      </div>
      {estado.error && (
        <p role="alert" className="max-w-56 text-micro font-medium text-danger">
          {estado.error}
        </p>
      )}
    </form>
  );
}
