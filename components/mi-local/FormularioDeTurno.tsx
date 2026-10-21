"use client";

import { useActionState } from "react";
import { cargarTurno, type EstadoDeCarga } from "@/app/mi-local/acciones";
import Field from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import { miLocal } from "@/content/mi-local";
import { hora } from "@/lib/formato";
import { enviarSinBorrar } from "@/lib/formularios";
import { cn } from "@/lib/utils";
import { claseDeOpcion } from "./Opciones";

/**
 * El último paso de la carga: el horario, entre los libres, y el cliente. Lo
 * demás ya se eligió y viaja escondido; la acción lo vuelve a controlar.
 */
export default function FormularioDeTurno({
  dia,
  profesional,
  servicio,
  horarios,
}: {
  dia: string;
  profesional: string;
  servicio: number;
  /** Los inicios libres, como los devuelve la base. */
  horarios: string[];
}) {
  const copy = miLocal.nuevo;
  const [estado, enviar, enviando] = useActionState<EstadoDeCarga, FormData>(cargarTurno, { error: null });

  return (
    <form onSubmit={enviarSinBorrar(enviar)} className="flex flex-col gap-5">
      <input type="hidden" name="dia" value={dia} />
      <input type="hidden" name="profesional" value={profesional} />
      <input type="hidden" name="servicio" value={servicio} />

      <fieldset>
        <legend className="text-small font-semibold text-fg">{copy.horario}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {horarios.map((inicio, i) => (
            <label
              key={inicio}
              className={cn(claseDeOpcion(false), "cursor-pointer tabular-nums has-checked:bg-fg has-checked:text-page has-checked:hover:bg-fg")}
            >
              <input type="radio" name="inicio" value={inicio} required={i === 0} className="sr-only" />
              {hora(inicio)}
            </label>
          ))}
        </div>
      </fieldset>

      <Field id="nuevo-nombre" label={copy.nombre} optional>
        {(props) => <input {...props} name="nombre" type="text" autoComplete="off" maxLength={80} />}
      </Field>
      <Field id="nuevo-telefono" label={copy.telefono} optional>
        {(props) => <input {...props} name="telefono" type="tel" autoComplete="off" maxLength={30} />}
      </Field>

      {estado.error && (
        <p role="alert" className="text-small font-medium text-danger">
          {estado.error}
        </p>
      )}
      <Button type="submit" disabled={enviando} className="w-full sm:w-auto sm:self-start">
        {enviando ? copy.cargando : copy.cargar}
      </Button>
    </form>
  );
}
