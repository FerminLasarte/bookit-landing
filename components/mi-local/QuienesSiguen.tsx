"use client";

import { useActionState } from "react";
import { elegirQuienesSiguen, type EstadoDeEquipo } from "@/app/mi-local/(panel)/equipo/acciones";
import Button from "@/components/ui/Button";
import { miLocal } from "@/content/mi-local";
import { formularioSinBorrar } from "@/lib/formularios";
import type { Miembro } from "@/lib/mi-local/gestion";
import Avatar from "./Avatar";
import RespuestaDeAccion from "./RespuestaDeAccion";

/** Marcar quiénes siguen recibiendo turnos. El tope lo controla la base, y dice cuántos entran si se pasa. */
export default function QuienesSiguen({ equipo }: { equipo: Miembro[] }) {
  const copy = miLocal.quienesSiguen;
  const [estado, enviar, enviando] = useActionState<EstadoDeEquipo, FormData>(elegirQuienesSiguen, { error: null });

  return (
    <form {...formularioSinBorrar(enviar)} className="flex flex-col gap-4">
      <ul className="flex flex-col divide-y divide-line">
        {equipo.map((m) => (
          <li key={m.id} className="py-3 first:pt-0">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" name="activos" value={m.id} defaultChecked={m.activo} className="ring-focus size-4 accent-fg" />
              <Avatar nombre={m.nombre} foto={m.foto} tamano="chico" />
              <span className="font-semibold text-fg">{m.nombre}</span>
            </label>
          </li>
        ))}
      </ul>
      <RespuestaDeAccion estado={estado} />
      <Button type="submit" size="compact" disabled={enviando} className="self-start">
        {enviando ? copy.guardando : copy.guardar}
      </Button>
    </form>
  );
}
