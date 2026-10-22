"use client";

import { useActionState, useState } from "react";
import { guardarCupon, type EstadoDeCrecimiento } from "@/app/mi-local/(panel)/crecimiento/acciones";
import Field from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import { miLocal } from "@/content/mi-local";
import { formularioSinBorrar } from "@/lib/formularios";
import type { Cupon } from "@/lib/mi-local/cupones";
import Disponibilidad from "./Disponibilidad";
import { Apartado, ElegirUno } from "./HorasDelDia";
import RespuestaDeAccion from "./RespuestaDeAccion";

/**
 * Crear o editar un cupón, como `CreatePromotionScreen`: cómo se llama y con
 * qué código se canjea, cuánto descuenta y hasta cuántas veces, desde y hasta
 * cuándo, y dónde y cuándo vale. Lo que no va lo dice la acción, con las
 * frases de la app.
 */
export default function FormularioDeCupon({
  cupon,
  servicios,
  hoy,
}: {
  /** El que se edita, o nada para uno nuevo. */
  cupon?: Cupon;
  servicios: { id: number; nombre: string }[];
  /** `2026-10-22`: un cupón nuevo no empieza antes; uno que ya empezó conserva su fecha. */
  hoy: string;
}) {
  const copy = miLocal.cupon;
  const [estado, enviar, enviando] = useActionState<EstadoDeCrecimiento, FormData>(guardarCupon, { error: null });
  const [tipo, setTipo] = useState<Cupon["tipo"]>(cupon?.tipo ?? "porcentaje");
  const minimo = cupon && cupon.desde < hoy ? cupon.desde : hoy;

  return (
    <form {...formularioSinBorrar(enviar)} className="flex flex-col gap-6">
      {cupon && <input type="hidden" name="id" value={cupon.id} />}

      <Apartado titulo={copy.identificacion}>
        <p className="-mt-2 text-small text-muted">{copy.identificacionNota}</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="cupon-nombre" label={copy.nombre}>
            {(props) => (
              <input
                {...props}
                name="nombre"
                type="text"
                defaultValue={cupon?.nombre}
                placeholder={copy.nombreEjemplo}
                maxLength={100}
                autoComplete="off"
              />
            )}
          </Field>
          <Field id="cupon-codigo" label={copy.codigo}>
            {(props) => (
              <input
                {...props}
                name="codigo"
                type="text"
                defaultValue={cupon?.codigo}
                placeholder={copy.codigoEjemplo}
                maxLength={50}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                className={`${props.className} uppercase placeholder:normal-case`}
              />
            )}
          </Field>
        </div>
      </Apartado>

      <Apartado titulo={copy.descuento} className="border-t border-line pt-6">
        <ElegirUno
          etiqueta={copy.tipo}
          nombre="tipo"
          opciones={(["porcentaje", "monto"] as const).map((t) => ({ valor: t, label: copy.tipos[t] }))}
          valor={tipo}
          onChange={setTipo}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="cupon-valor" label={copy.valor[tipo]}>
            {(props) => (
              <input
                {...props}
                name="valor"
                type="number"
                inputMode="decimal"
                min={0}
                max={tipo === "porcentaje" ? 100 : undefined}
                step="any"
                defaultValue={cupon?.valor}
                placeholder={copy.valorEjemplo[tipo]}
              />
            )}
          </Field>
          <Field id="cupon-limite" label={copy.limite} optional>
            {(props) => (
              <input
                {...props}
                name="limite"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                defaultValue={cupon?.limite ?? undefined}
                placeholder={copy.limiteEjemplo}
              />
            )}
          </Field>
        </div>
      </Apartado>

      <Apartado titulo={copy.vigencia} className="border-t border-line pt-6">
        <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
          <Field id="cupon-desde" label={copy.desde}>
            {(props) => <input {...props} name="desde" type="date" min={minimo} defaultValue={cupon?.desde ?? hoy} />}
          </Field>
          <Field id="cupon-hasta" label={copy.hasta}>
            {(props) => <input {...props} name="hasta" type="date" min={minimo} defaultValue={cupon?.hasta} />}
          </Field>
        </div>
      </Apartado>

      <div className="flex flex-col gap-6 border-t border-line pt-6">
        <Disponibilidad valores={cupon} servicios={servicios} />
      </div>

      <RespuestaDeAccion estado={estado} />
      <Button type="submit" disabled={enviando} className="w-full sm:w-auto sm:self-start">
        {enviando ? copy.guardando : cupon ? copy.guardar : copy.crear}
      </Button>
    </form>
  );
}
