"use client";

import { useActionState, useState } from "react";
import { guardarPremio, type EstadoDeCrecimiento } from "@/app/mi-local/(panel)/crecimiento/acciones";
import Field from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import { miLocal } from "@/content/mi-local";
import { formularioSinBorrar } from "@/lib/formularios";
import type { Premio } from "@/lib/mi-local/cupones";
import Disponibilidad from "./Disponibilidad";
import { Apartado, ElegirUno } from "./HorasDelDia";
import RespuestaDeAccion from "./RespuestaDeAccion";

/**
 * Crear o editar un premio, como `CreateRewardScreen`: qué se lleva el
 * cliente, cuántos puntos y visitas pide, y dónde y cuándo vale. "Servicio
 * gratis" no lleva número. Editar no reactiva uno pausado.
 */
export default function FormularioDePremio({
  premio,
  servicios,
}: {
  /** El que se edita, o nada para uno nuevo. */
  premio?: Premio;
  servicios: { id: number; nombre: string }[];
}) {
  const copy = miLocal.premio;
  const [estado, enviar, enviando] = useActionState<EstadoDeCrecimiento, FormData>(guardarPremio, { error: null });
  const [tipo, setTipo] = useState<Premio["tipo"]>(premio?.tipo ?? "gratis");

  return (
    <form {...formularioSinBorrar(enviar)} className="flex flex-col gap-6">
      {premio && <input type="hidden" name="id" value={premio.id} />}

      <Apartado titulo={copy.elPremio}>
        <p className="-mt-2 text-small text-muted">{copy.elPremioNota}</p>
        <Field id="premio-titulo" label={copy.titulo}>
          {(props) => (
            <input
              {...props}
              name="titulo"
              type="text"
              defaultValue={premio?.titulo}
              placeholder={copy.tituloEjemplo}
              maxLength={100}
              autoComplete="off"
            />
          )}
        </Field>
        <Field id="premio-descripcion" label={copy.descripcion} optional>
          {(props) => (
            <input
              {...props}
              name="descripcion"
              type="text"
              defaultValue={premio?.descripcion ?? ""}
              placeholder={copy.descripcionEjemplo}
              maxLength={120}
              autoComplete="off"
            />
          )}
        </Field>
        <ElegirUno
          etiqueta={copy.beneficio}
          nombre="tipo"
          opciones={(["gratis", "porcentaje", "monto"] as const).map((t) => ({ valor: t, label: copy.tipos[t] }))}
          valor={tipo}
          onChange={setTipo}
        />
        {tipo !== "gratis" && (
          <Field id="premio-valor" label={copy.valor[tipo]}>
            {(props) => (
              <input
                {...props}
                name="valor"
                type="number"
                inputMode="decimal"
                min={0}
                max={tipo === "porcentaje" ? 100 : undefined}
                step="any"
                defaultValue={premio?.tipo === tipo ? premio.valor : undefined}
                placeholder={copy.valorEjemplo[tipo]}
                className={`${props.className} sm:max-w-xs`}
              />
            )}
          </Field>
        )}
      </Apartado>

      <Apartado titulo={copy.cuesta} className="border-t border-line pt-6">
        <p className="-mt-2 text-small text-muted">{copy.cuestaNota}</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="premio-puntos" label={copy.puntos}>
            {(props) => (
              <input
                {...props}
                name="puntos"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                defaultValue={premio?.puntos}
                placeholder={copy.puntosEjemplo}
              />
            )}
          </Field>
          <Field id="premio-visitas" label={copy.visitas} optional>
            {(props) => (
              <input
                {...props}
                name="visitas"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={premio?.visitas || undefined}
                placeholder={copy.visitasEjemplo}
              />
            )}
          </Field>
        </div>
      </Apartado>

      <div className="flex flex-col gap-6 border-t border-line pt-6">
        <Disponibilidad valores={premio} servicios={servicios} />
      </div>

      <RespuestaDeAccion estado={estado} />
      <Button type="submit" disabled={enviando} className="w-full sm:w-auto sm:self-start">
        {enviando ? copy.guardando : premio ? copy.guardar : copy.crear}
      </Button>
    </form>
  );
}
