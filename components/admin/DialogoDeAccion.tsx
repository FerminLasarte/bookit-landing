"use client";

import { useId, useRef, type ReactNode } from "react";
import Button from "@/components/ui/Button";
import Dialogo, { Volver } from "@/components/ui/Dialogo";
import { textLinkClasses } from "@/components/ui/TextLink";
import { acciones } from "@/content/admin";
import { formularioSinBorrar } from "@/lib/formularios";
import { useAccionQueCierra, type Respuesta } from "@/lib/mi-local/respuesta";

/**
 * Una acción del panel: el link que la abre y el diálogo con su formulario.
 * Si sale bien se cierra y la página vuelve releída; si no, queda con lo
 * escrito y la frase de la base.
 */
export default function DialogoDeAccion({
  boton,
  titulo,
  bajada,
  confirmar,
  enviando,
  accion,
  children,
}: {
  boton: string;
  titulo: string;
  bajada?: ReactNode;
  confirmar: string;
  enviando: string;
  accion: (antes: Respuesta, datos: FormData) => Promise<Respuesta>;
  children: ReactNode;
}) {
  const id = useId();
  const dialogo = useRef<HTMLDialogElement>(null);
  const cerrar = () => dialogo.current?.close();
  const [estado, enviar, ocupado] = useAccionQueCierra(accion, cerrar);

  return (
    <>
      <button type="button" onClick={() => dialogo.current?.showModal()} className={textLinkClasses()}>
        {boton}
      </button>

      <Dialogo ref={dialogo} etiqueta={id}>
        <h2 id={id} className="text-title font-bold text-fg">
          {titulo}
        </h2>
        {bajada && <div className="mt-2 flex flex-col gap-2 text-small text-muted">{bajada}</div>}
        <form {...formularioSinBorrar(enviar)} className="mt-5 flex flex-col gap-4">
          {children}
          {estado.error && (
            <p role="alert" className="text-small font-medium text-danger">
              {estado.error}
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button type="submit" disabled={ocupado} className="flex-1">
              {ocupado ? enviando : confirmar}
            </Button>
            <Volver onClick={cerrar} className="flex-1">
              {acciones.volver}
            </Volver>
          </div>
        </form>
      </Dialogo>
    </>
  );
}
