"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import Button from "@/components/ui/Button";
import Dialogo, { Volver } from "@/components/ui/Dialogo";
import { textLinkClasses } from "@/components/ui/TextLink";
import { acciones } from "@/content/admin";
import { formularioSinBorrar } from "@/lib/formularios";
import { useAccionQueCierra, type Respuesta } from "@/lib/mi-local/respuesta";

/** Lo que una acción tiene para decir después de salir bien. */
type Aviso = { titulo: string; texto: string };

/**
 * Una acción del panel: lo que la abre y el diálogo con su formulario. Si sale
 * bien se cierra y la página vuelve releída; si no, queda con lo escrito y la
 * frase de la base. Lo abre un link con `boton`, o lo que dibuje `disparador`.
 * Con `aviso`, lo que sale bien y tiene algo para decir deja el diálogo
 * abierto con eso y un "Listo".
 */
export default function DialogoDeAccion<R extends Respuesta>({
  boton,
  disparador,
  titulo,
  bajada,
  confirmar,
  enviando,
  accion,
  aviso: avisoDe,
  children,
}: {
  boton?: string;
  disparador?: (abrir: () => void) => ReactNode;
  titulo: string;
  bajada?: ReactNode;
  confirmar: string;
  enviando: string;
  accion: (antes: R, datos: FormData) => Promise<R>;
  aviso?: (respuesta: R) => Aviso | null;
  children: ReactNode;
}) {
  const id = useId();
  const dialogo = useRef<HTMLDialogElement>(null);
  const abrir = () => dialogo.current?.showModal();
  const cerrar = () => dialogo.current?.close();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [estado, enviar, ocupado] = useAccionQueCierra(accion, cerrar, (respuesta) => {
    const a = avisoDe?.(respuesta) ?? null;
    setAviso(a);
    return !a;
  });

  return (
    <>
      {disparador ? (
        disparador(abrir)
      ) : (
        <button type="button" onClick={abrir} className={textLinkClasses()}>
          {boton}
        </button>
      )}

      <Dialogo ref={dialogo} etiqueta={id} onClose={() => setAviso(null)}>
        {aviso ? (
          <>
            <h2 id={id} className="text-title font-bold text-fg">
              {aviso.titulo}
            </h2>
            <p role="status" className="mt-2 text-small text-fg">
              {aviso.texto}
            </p>
            <Button onClick={cerrar} className="mt-5 w-full">
              {acciones.listo}
            </Button>
          </>
        ) : (
          <>
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
          </>
        )}
      </Dialogo>
    </>
  );
}
