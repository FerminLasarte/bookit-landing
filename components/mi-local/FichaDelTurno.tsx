"use client";

import { X } from "lucide-react";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { cambiarEstado } from "@/app/mi-local/acciones";
import Button from "@/components/ui/Button";
import Dialogo, { Volver } from "@/components/ui/Dialogo";
import { miLocal } from "@/content/mi-local";
import { hora, pesos } from "@/lib/formato";
import type { AccionDeTurno, AccionesDelTurno, Turno } from "@/lib/mi-local/agenda";
import EstadoDelTurno from "./EstadoDelTurno";

/**
 * La fila del turno es el botón que abre su ficha: el detalle y lo que se le
 * puede hacer, como la hoja del turno de la app. Qué se ofrece lo calcula el
 * servidor (`accionesDelTurno`); la que decide es la base. Al guardar, la
 * acción vuelve con la agenda ya releída y la ficha se cierra.
 */
export default function FichaDelTurno({
  turno,
  cliente,
  acciones,
  sinMarcar,
  className,
  children,
}: {
  turno: Turno;
  /** El nombre que se muestra, ya resuelto: el del turno, "de mostrador" o "sin nombre". */
  cliente: string;
  acciones: AccionesDelTurno;
  sinMarcar: boolean;
  className?: string;
  /** Lo que se ve en la fila. */
  children: ReactNode;
}) {
  const copy = miLocal.ficha;
  const dialogo = useRef<HTMLDialogElement>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedido, setPedido] = useState<AccionDeTurno | null>(null);
  const [guardando, empezar] = useTransition();
  const titulo = `ficha-${turno.id}`;

  const abrir = () => {
    setConfirmando(false);
    setError(null);
    dialogo.current?.showModal();
  };

  const cambiar = (estado: AccionDeTurno) => {
    setPedido(estado);
    setError(null);
    empezar(async () => {
      const { error } = await cambiarEstado(turno.id, estado);
      if (error) return setError(error);
      dialogo.current?.close();
    });
  };

  const textoDe = (estado: AccionDeTurno, texto: string, enCurso = copy.guardando) =>
    guardando && pedido === estado ? enCurso : texto;

  const detalle = [turno.profesional?.nombre && copy.con(turno.profesional.nombre), turno.precio > 0 && pesos(turno.precio)]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <button type="button" onClick={abrir} aria-label={`${copy.abrir}: ${cliente}, ${hora(turno.inicio)}`} className={className}>
        {children}
      </button>

      <Dialogo ref={dialogo} etiqueta={titulo}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titulo} className="text-title font-bold text-fg">
              {cliente}
            </h2>
            {turno.esManual && <p className="mt-0.5 text-small text-muted">{copy.aMano}</p>}
          </div>
          <button
            type="button"
            onClick={() => dialogo.current?.close()}
            aria-label={copy.cerrar}
            className="ring-focus -m-2 shrink-0 rounded-pill p-2 text-muted hover:text-fg"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <div className="mt-5">
          <p className="font-semibold text-fg tabular-nums">
            {hora(turno.inicio)}–{hora(turno.fin)}
          </p>
          {turno.servicio && <p className="text-body text-fg">{turno.servicio}</p>}
          {detalle && <p className="text-small text-muted">{detalle}</p>}
          <div className="mt-3">
            <EstadoDelTurno estado={turno.estado} sinMarcar={sinMarcar} />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {!acciones ? (
            <Nota>{copy.cerrado[turno.estado as keyof typeof copy.cerrado] ?? null}</Nota>
          ) : confirmando ? (
            <>
              <p className="text-body text-fg">
                {copy.cancelacion.texto(turno.cliente, turno.pagadoPorMp > 0 ? pesos(turno.pagadoPorMp) : null)}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row-reverse">
                <Button onClick={() => cambiar("cancelado")} disabled={guardando} variant="secondary" className="flex-1">
                  {textoDe("cancelado", copy.cancelacion.confirmar, copy.cancelacion.cancelando)}
                </Button>
                <Volver onClick={() => setConfirmando(false)} className="flex-1">
                  {copy.cancelacion.volver}
                </Volver>
              </div>
            </>
          ) : (
            <>
              {acciones.asistencia ? (
                <>
                  <Button onClick={() => cambiar("completado")} disabled={guardando}>
                    {textoDe("completado", copy.completar)}
                  </Button>
                  <Button onClick={() => cambiar("ausente")} disabled={guardando} variant="secondary">
                    {textoDe("ausente", copy.ausente)}
                  </Button>
                </>
              ) : (
                <Nota>{copy.todaviaNo}</Nota>
              )}
              {/* Cancelar deshace el turno en vez de cerrarlo: va como texto, y pasa por confirmación. */}
              {acciones.cancelar && (
                <button
                  type="button"
                  onClick={() => setConfirmando(true)}
                  disabled={guardando}
                  className="ring-focus mx-auto mt-1 rounded-[4px] px-1 text-small font-semibold text-danger underline-offset-2 hover:underline disabled:opacity-55"
                >
                  {copy.cancelar}
                </button>
              )}
            </>
          )}
          {error && (
            <p role="alert" className="mt-2 text-center text-small font-medium text-danger">
              {error}
            </p>
          )}
        </div>
      </Dialogo>
    </>
  );
}

/** Una línea gris en el lugar de las acciones, cuando no hay ninguna o todavía no se puede. */
function Nota({ children }: { children: ReactNode }) {
  return <p className="py-2 text-center text-small text-muted">{children}</p>;
}
