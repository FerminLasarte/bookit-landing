"use client";

import { useActionState, useRef } from "react";
import {
  cambiarEstadoDeCupon,
  cambiarEstadoDePremio,
  eliminarCupon,
  eliminarPremio,
  type EstadoDeCrecimiento,
} from "@/app/mi-local/(panel)/crecimiento/acciones";
import Button from "@/components/ui/Button";
import Dialogo, { Volver } from "@/components/ui/Dialogo";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { claseDeBotonDeTexto } from "./HorasDelDia";
import RespuestaDeAccion from "./RespuestaDeAccion";

const piezas = {
  cupon: { copy: miLocal.cupon, cambiar: cambiarEstadoDeCupon, eliminar: eliminarCupon },
  premio: { copy: miLocal.premio, cambiar: cambiarEstadoDePremio, eliminar: eliminarPremio },
};

/**
 * Lo que en la app va en el menú de cada tarjeta: pausar o activar, y
 * eliminar con confirmación. Un premio que alguien canjeó no se borra (D6): el
 * diálogo lo dice y ofrece pausarlo ahí mismo.
 */
export default function PausarYEliminar({
  cual,
  id,
  nombre,
  activo,
  conEstado = true,
}: {
  cual: keyof typeof piezas;
  id: string | number;
  nombre: string;
  activo: boolean;
  /** Un cupón en un plan sin promociones no se pausa ni se activa, como en la app: la base ya lo tiene pausado. */
  conEstado?: boolean;
}) {
  const { copy, cambiar, eliminar } = piezas[cual];
  const dialogo = useRef<HTMLDialogElement>(null);
  const inicial: EstadoDeCrecimiento = { error: null };
  const [estado, enviarEstado, cambiando] = useActionState(cambiar, inicial);
  const [baja, enviarBaja, eliminando] = useActionState(eliminar, inicial);
  const [pausa, enviarPausa, pausando] = useActionState(cambiar, inicial);

  return (
    <>
      {conEstado && (
        <Superficie tone="surface" className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <p className="font-semibold text-fg">{activo ? copy.estado.pausar : copy.estado.activar}</p>
            <p className="mt-1 text-small text-muted">{activo ? copy.estado.pausarBajada : copy.estado.activarBajada}</p>
            <RespuestaDeAccion estado={{ ...estado, listo: false }} className="mt-2" />
          </div>
          <form action={enviarEstado} className="shrink-0">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="activo" value={activo ? "0" : "1"} />
            <Button type="submit" size="compact" variant="secondary" disabled={cambiando}>
              {cambiando ? copy.estado.guardando : activo ? copy.estado.pausar : copy.estado.activar}
            </Button>
          </form>
        </Superficie>
      )}

      <button type="button" onClick={() => dialogo.current?.showModal()} className={`${claseDeBotonDeTexto("danger")} self-start`}>
        {copy.baja.boton}
      </button>

      <Dialogo ref={dialogo} etiqueta={`baja-de-${cual}`}>
        <h2 id={`baja-de-${cual}`} className="text-title font-bold text-fg">
          {copy.baja.titulo}
        </h2>
        <p className="mt-3 text-body text-fg">{copy.baja.texto(nombre)}</p>
        <form action={enviarBaja} className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <input type="hidden" name="id" value={id} />
          <Button type="submit" disabled={eliminando} variant="secondary" className="flex-1">
            {eliminando ? copy.baja.eliminando : copy.baja.confirmar}
          </Button>
          <Volver onClick={() => dialogo.current?.close()} className="flex-1">
            {copy.baja.volver}
          </Volver>
        </form>
        <RespuestaDeAccion estado={baja} className="mt-3 text-center" />
        {baja.canjeado && activo && !pausa.listo && "pausar" in copy.baja && (
          <form action={enviarPausa} className="mt-3 flex justify-center">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="activo" value="0" />
            <Button type="submit" size="compact" disabled={pausando}>
              {pausando ? copy.estado.guardando : copy.baja.pausar}
            </Button>
          </form>
        )}
        <RespuestaDeAccion estado={pausa} className="mt-2 text-center" />
      </Dialogo>
    </>
  );
}
