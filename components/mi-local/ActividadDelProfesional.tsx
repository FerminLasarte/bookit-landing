"use client";

import { useRef, type ReactNode } from "react";
import { cambiarActividad } from "@/app/mi-local/(panel)/equipo/acciones";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Dialogo, { Volver } from "@/components/ui/Dialogo";
import { miLocal } from "@/content/mi-local";
import type { Miembro, ResumenDeBaja } from "@/lib/mi-local/gestion";
import { useAccionQueCierra } from "@/lib/mi-local/respuesta";
import RespuestaDeAccion from "./RespuestaDeAccion";

/**
 * "Recibe turnos", el switch de la tarjeta del equipo en la app. Desactivar
 * pide confirmación con lo que pasa: cuántos turnos se cancelan, a quién le
 * llega el aviso y si se devuelve lo pagado (`resumen_de_desactivar`).
 * Activar va directo; si no entra en el plan, la base lo dice.
 */
export default function ActividadDelProfesional({ miembro, resumen }: { miembro: Miembro; resumen: ResumenDeBaja | null }) {
  const copy = miLocal.profesional.actividad;
  const dialogo = useRef<HTMLDialogElement>(null);
  const [estado, enviar, enviando] = useAccionQueCierra(cambiarActividad, () => dialogo.current?.close());
  const titulo = `baja-${miembro.id}`;

  const formulario = (activo: boolean, boton: ReactNode, className?: string) => (
    <form action={enviar} className={className}>
      <input type="hidden" name="id" value={miembro.id} />
      <input type="hidden" name="activo" value={activo ? "1" : "0"} />
      {boton}
    </form>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-semibold text-fg">
            {copy.titulo}
            {!miembro.activo && <Badge tono="atencion">{miLocal.equipo.pausado}</Badge>}
          </p>
          <p className="mt-1 text-small text-muted">{miembro.activo ? copy.activo : copy.pausado}</p>
        </div>
        {miembro.activo ? (
          <Button size="compact" variant="secondary" onClick={() => dialogo.current?.showModal()}>
            {copy.desactivar}
          </Button>
        ) : (
          formulario(
            true,
            <Button type="submit" size="compact" disabled={enviando}>
              {enviando ? miLocal.profesional.guardando : copy.activar}
            </Button>,
          )
        )}
      </div>
      {!miembro.activo && <RespuestaDeAccion estado={estado} />}

      <Dialogo ref={dialogo} etiqueta={titulo}>
        <h2 id={titulo} className="text-title font-bold text-fg">
          {copy.confirmarTitulo(miembro.nombre)}
        </h2>
        <p className="mt-3 text-body text-fg">{resumen ? copy.confirmar(resumen) : copy.sinResumen}</p>
        {formulario(
          false,
          <>
            <Button type="submit" variant="secondary" disabled={enviando} className="flex-1">
              {enviando ? miLocal.profesional.guardando : copy.desactivar}
            </Button>
            <Volver onClick={() => dialogo.current?.close()} className="flex-1">
              {copy.volver}
            </Volver>
          </>,
          "mt-6 flex flex-col gap-2 sm:flex-row-reverse",
        )}
        <RespuestaDeAccion estado={estado} className="mt-3 text-center" />
      </Dialogo>
    </div>
  );
}
