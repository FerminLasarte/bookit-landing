"use client";

import { useActionState, useRef } from "react";
import { darDeBajaServicio, type EstadoDeServicio } from "@/app/mi-local/(panel)/servicios/acciones";
import Button from "@/components/ui/Button";
import Dialogo, { Volver } from "@/components/ui/Dialogo";
import { miLocal } from "@/content/mi-local";
import RespuestaDeAccion from "./RespuestaDeAccion";

/**
 * Eliminar un servicio, con confirmación: dice cuántos turnos tiene por venir,
 * que siguen en pie (`EliminarServicioBoton` de la app). Va como texto, como
 * cancelar en la ficha del turno: deshace, no guarda.
 */
export default function BajaDeServicio({ id, nombre, reservados }: { id: number; nombre: string; reservados: number | null }) {
  const copy = miLocal.servicio.baja;
  const dialogo = useRef<HTMLDialogElement>(null);
  const [estado, enviar, enviando] = useActionState<EstadoDeServicio, FormData>(darDeBajaServicio, { error: null });

  return (
    <>
      <button
        type="button"
        onClick={() => dialogo.current?.showModal()}
        className="ring-focus self-start rounded-[4px] px-1 text-small font-semibold text-danger underline-offset-2 hover:underline"
      >
        {copy.boton}
      </button>

      <Dialogo ref={dialogo} etiqueta="baja-de-servicio">
        <h2 id="baja-de-servicio" className="text-title font-bold text-fg">
          {copy.titulo}
        </h2>
        <p className="mt-3 text-body text-fg">{copy.texto(nombre, reservados)}</p>
        <form action={enviar} className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <input type="hidden" name="id" value={id} />
          <Button type="submit" disabled={enviando} variant="secondary" className="flex-1">
            {enviando ? copy.eliminando : copy.confirmar}
          </Button>
          <Volver onClick={() => dialogo.current?.close()} className="flex-1">
            {copy.volver}
          </Volver>
        </form>
        <RespuestaDeAccion estado={estado} className="mt-3 text-center" />
      </Dialogo>
    </>
  );
}
