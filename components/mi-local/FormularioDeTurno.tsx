"use client";

import { useActionState, useState } from "react";
import { cargarTurno, type EstadoDeCarga } from "@/app/mi-local/acciones";
import Field, { fieldClasses, labelClasses } from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { hora } from "@/lib/formato";
import { formularioSinBorrar } from "@/lib/formularios";
import { cn } from "@/lib/utils";
import { claseDeOpcion } from "./Opciones";

const pildora = cn(claseDeOpcion(false), "cursor-pointer tabular-nums has-checked:bg-fg has-checked:text-page has-checked:hover:bg-fg");

/**
 * El último paso de la carga: el horario y el cliente. Lo demás ya se eligió y
 * viaja escondido; la acción lo vuelve a controlar.
 *
 * El horario es uno de los libres o "Otra hora", como en la app. Si la base
 * contesta que cae fuera de la agenda, el formulario pregunta y "Cargar igual"
 * lo manda de nuevo con `forzar`. "Otra hora" se abre con CSS y "Cargar
 * igual" es un envío común: los dos andan sin JavaScript.
 */
export default function FormularioDeTurno({
  dia,
  profesional,
  nombreDelProfesional,
  servicio,
  horarios,
}: {
  dia: string;
  profesional: string;
  /** Para la pregunta de fuera de horario. `null` si el que carga es el mismo profesional: le habla de vos. */
  nombreDelProfesional: string | null;
  servicio: number;
  /** Los inicios libres, como los devuelve la base. */
  horarios: string[];
}) {
  const copy = miLocal.nuevo;
  const [estado, enviar, enviando] = useActionState<EstadoDeCarga, FormData>(cargarTurno, {
    error: null,
    fueraDeHorario: null,
  });
  // La pregunta que se cerró con "Cambiar horario" o tocando el formulario. Cada respuesta es un objeto nuevo.
  const [cerrada, setCerrada] = useState<EstadoDeCarga | null>(null);
  const pregunta = estado.fueraDeHorario && estado !== cerrada ? estado.fueraDeHorario : null;
  const sinLibres = horarios.length === 0;

  return (
    <form {...formularioSinBorrar(enviar)} className="flex flex-col gap-5">
      <input type="hidden" name="dia" value={dia} />
      <input type="hidden" name="profesional" value={profesional} />
      <input type="hidden" name="servicio" value={servicio} />

      {/* Cambiar el horario cierra la pregunta: la respuesta era sobre el otro. */}
      <fieldset className="group" onChange={() => setCerrada(estado)}>
        <legend className="text-small font-semibold text-fg">{copy.horario}</legend>
        {sinLibres && <p className="mt-1 text-small text-muted">{copy.sinHorariosConOtra}</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          {horarios.map((inicio, i) => (
            <label key={inicio} className={pildora}>
              <input type="radio" name="inicio" value={inicio} required={i === 0} className="sr-only" />
              {hora(inicio)}
            </label>
          ))}
          <label className={pildora}>
            <input
              id="nuevo-otra"
              type="radio"
              name="inicio"
              value="otra"
              defaultChecked={sinLibres}
              required={sinLibres}
              className="sr-only"
            />
            {copy.otraHora}
          </label>
        </div>
        <div className="mt-3 hidden max-w-48 group-has-[#nuevo-otra:checked]:block">
          <label htmlFor="nuevo-hora" className={labelClasses}>
            {copy.hora}
          </label>
          <input
            id="nuevo-hora"
            name="hora"
            type="time"
            min="06:00"
            max="23:45"
            step={900}
            aria-describedby="nuevo-hora-bajada"
            className={cn(fieldClasses, "mt-1.5 tabular-nums")}
          />
          <p id="nuevo-hora-bajada" className="mt-1 text-micro text-muted">
            {copy.horaBajada}
          </p>
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

      {pregunta ? (
        <Superficie tone="miel" role="alert" className="flex flex-col gap-4 p-5">
          <div>
            <p className="font-bold text-fg">{copy.fueraDeHorario.titulo}</p>
            <p className="mt-1 text-small text-fg">{copy.fueraDeHorario.motivos[pregunta](nombreDelProfesional)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" name="forzar" value="1" disabled={enviando} size="compact">
              {enviando ? copy.cargando : copy.fueraDeHorario.cargarIgual}
            </Button>
            <Button variant="secondary" size="compact" onClick={() => setCerrada(estado)}>
              {copy.fueraDeHorario.cambiarHorario}
            </Button>
          </div>
        </Superficie>
      ) : (
        <Button type="submit" disabled={enviando} className="w-full sm:w-auto sm:self-start">
          {enviando ? copy.cargando : copy.cargar}
        </Button>
      )}
    </form>
  );
}
