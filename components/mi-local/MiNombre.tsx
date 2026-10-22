"use client";

import { useActionState } from "react";
import { guardarMiNombre } from "@/app/mi-local/(panel)/perfil/acciones";
import Field from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import { miLocal } from "@/content/mi-local";
import { formularioSinBorrar } from "@/lib/formularios";
import type { Respuesta } from "@/lib/mi-local/respuesta";
import RespuestaDeAccion from "./RespuestaDeAccion";

/** El nombre con el que los clientes ven al profesional en ese local, como "Nombre visible" de la app. */
export default function MiNombre({ nombre }: { nombre: string }) {
  const copy = miLocal.miPerfil;
  const [estado, enviar, enviando] = useActionState<Respuesta, FormData>(guardarMiNombre, { error: null });

  return (
    <form {...formularioSinBorrar(enviar)} className="flex flex-col gap-4">
      <Field id="mi-nombre" label={copy.nombre}>
        {(props) => (
          <input {...props} key={nombre} name="nombre" type="text" defaultValue={nombre} maxLength={80} autoComplete="name" required />
        )}
      </Field>
      <RespuestaDeAccion estado={estado} />
      <Button type="submit" size="compact" disabled={enviando} className="self-start">
        {enviando ? copy.guardando : copy.guardar}
      </Button>
    </form>
  );
}
