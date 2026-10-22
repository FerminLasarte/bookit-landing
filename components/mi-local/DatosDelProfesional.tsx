"use client";

import { useActionState } from "react";
import { guardarDatosDelProfesional, type EstadoDeEquipo } from "@/app/mi-local/(panel)/equipo/acciones";
import Field from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import { miLocal } from "@/content/mi-local";
import { formularioSinBorrar } from "@/lib/formularios";
import type { Miembro } from "@/lib/mi-local/gestion";
import RespuestaDeAccion from "./RespuestaDeAccion";

/** El nombre y la presentación de un profesional que maneja el dueño (D2 del plan de la fase 3). */
export default function DatosDelProfesional({ miembro }: { miembro: Miembro }) {
  const copy = miLocal.profesional;
  const [estado, enviar, enviando] = useActionState<EstadoDeEquipo, FormData>(guardarDatosDelProfesional, { error: null });

  return (
    <form {...formularioSinBorrar(enviar)} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={miembro.id} />
      <Field id="profesional-nombre" label={copy.datos.nombre}>
        {(props) => <input {...props} name="nombre" type="text" defaultValue={miembro.nombre} maxLength={80} autoComplete="off" />}
      </Field>
      <Field id="profesional-bio" label={copy.datos.bio} optional>
        {(props) => <textarea {...props} name="bio" defaultValue={miembro.bio ?? ""} maxLength={300} rows={2} />}
      </Field>
      <RespuestaDeAccion estado={estado} />
      <Button type="submit" size="compact" disabled={enviando} className="self-start">
        {enviando ? copy.guardando : copy.datos.guardar}
      </Button>
    </form>
  );
}
