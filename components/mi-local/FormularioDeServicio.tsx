"use client";

import { useActionState, useState } from "react";
import { guardarServicio, type EstadoDeServicio } from "@/app/mi-local/(panel)/servicios/acciones";
import Field, { labelClasses } from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { enviarSinBorrar } from "@/lib/formularios";
import type { Incluye, Servicio, TipoDeSena } from "@/lib/mi-local/gestion";
import { cn } from "@/lib/utils";
import { claseDeOpcion } from "./Opciones";
import RespuestaDeAccion from "./RespuestaDeAccion";

/**
 * Crear o editar un servicio: nombre, descripción, precio, duración y la seña.
 * La seña se ofrece si el plan la incluye (`niveles.cobro_mp`); si no, se dice
 * desde qué plan está, como la app. Lo que no va lo dice la base.
 */
export default function FormularioDeServicio({
  servicio,
  sena,
}: {
  /** El que se edita, o nada para uno nuevo. */
  servicio?: Servicio;
  sena: Incluye;
}) {
  const copy = miLocal.servicio;
  const [estado, enviar, enviando] = useActionState<EstadoDeServicio, FormData>(guardarServicio, { error: null });
  const [pide, setPide] = useState(Boolean(servicio?.sena));
  const [tipo, setTipo] = useState<TipoDeSena>(servicio?.sena?.tipo ?? "porcentaje");

  return (
    <form onSubmit={enviarSinBorrar(enviar)} className="flex flex-col gap-5">
      {servicio && <input type="hidden" name="id" value={servicio.id} />}

      <Field id="servicio-nombre" label={copy.nombre}>
        {(props) => <input {...props} name="nombre" type="text" defaultValue={servicio?.nombre} maxLength={100} autoComplete="off" />}
      </Field>
      <Field id="servicio-descripcion" label={copy.descripcion} optional>
        {(props) => (
          <textarea {...props} name="descripcion" defaultValue={servicio?.descripcion ?? ""} maxLength={500} rows={2} />
        )}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="servicio-precio" label={copy.precio}>
          {(props) => (
            <input {...props} name="precio" type="number" inputMode="numeric" min={1} step="any" defaultValue={servicio?.precio} />
          )}
        </Field>
        <Field id="servicio-duracion" label={copy.duracion}>
          {(props) => (
            <input {...props} name="duracion" type="number" inputMode="numeric" min={1} step={1} defaultValue={servicio?.duracion} />
          )}
        </Field>
      </div>

      <fieldset className="flex flex-col gap-4 border-t border-line pt-5">
        <legend className="sr-only">{copy.sena.titulo}</legend>
        {sena.incluida ? (
          <>
            {/* Sin esta marca, la acción no toca la seña: un plan sin seña no la borra. */}
            <input type="hidden" name="con_sena" value="1" />
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="pide_sena"
                checked={pide}
                onChange={(e) => setPide(e.target.checked)}
                className="ring-focus mt-1 size-4 accent-fg"
              />
              <span>
                <span className="block font-semibold text-fg">{copy.sena.pide}</span>
                <span className="block text-small text-muted">{copy.sena.bajada}</span>
              </span>
            </label>
            {pide && (
              <div className="flex flex-col gap-4 sm:pl-7">
                <div role="radiogroup" aria-label={copy.sena.tipo} className="flex flex-wrap gap-2">
                  {(["porcentaje", "fijo"] as const).map((t) => (
                    <label key={t} className={cn(claseDeOpcion(tipo === t), "cursor-pointer")}>
                      <input
                        type="radio"
                        name="tipo_sena"
                        value={t}
                        checked={tipo === t}
                        onChange={() => setTipo(t)}
                        className="sr-only"
                      />
                      {copy.sena[t]}
                    </label>
                  ))}
                </div>
                <Field id="servicio-sena" label={copy.sena.valor[tipo]}>
                  {(props) => (
                    <input
                      {...props}
                      name="valor_sena"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={tipo === "porcentaje" ? 100 : undefined}
                      step="any"
                      defaultValue={servicio?.sena?.valor}
                    />
                  )}
                </Field>
              </div>
            )}
          </>
        ) : (
          <div>
            <p className={labelClasses}>{copy.sena.titulo}</p>
            <p className="mt-1 text-small text-muted">
              {sena.desde ? copy.sena.bloqueada(sena.desde) : copy.sena.bajada}{" "}
              <TextLink href="/planes">{copy.sena.verPlanes}</TextLink>
            </p>
          </div>
        )}
      </fieldset>

      <RespuestaDeAccion estado={estado} />
      <Button type="submit" disabled={enviando} className="w-full sm:w-auto sm:self-start">
        {enviando ? copy.guardando : servicio ? copy.guardar : copy.crear}
      </Button>
    </form>
  );
}
