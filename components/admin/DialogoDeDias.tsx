"use client";

import { useState, type ReactNode } from "react";
import Field from "@/components/forms/Field";
import { claseDeOpcion } from "@/components/mi-local/Opciones";
import type { Respuesta } from "@/lib/mi-local/respuesta";
import DialogoDeAccion from "./DialogoDeAccion";

/** Lo que dice un diálogo de días. `rapidos`: los atajos, el primero es el que viene elegido. */
type CopyDeDias = {
  boton: string;
  titulo: string;
  bajada: string;
  dias: string;
  rapidos: number[];
  nota: string;
  ejemplo: string;
  confirmar: string;
  enviando: string;
};

/**
 * Darle días a un local: cuántos, con atajos, y una nota. Es el formulario de
 * extender la prueba y de la cortesía; cada una dice lo suyo en `avisos`, y la
 * base valida el tope y si la nota es obligatoria.
 */
export default function DialogoDeDias({
  id,
  idComercio,
  copy,
  maximo,
  notaObligatoria,
  avisos,
  accion,
}: {
  id: string;
  idComercio: string;
  copy: CopyDeDias;
  maximo: number;
  notaObligatoria: boolean;
  avisos?: ReactNode;
  accion: (antes: Respuesta, datos: FormData) => Promise<Respuesta>;
}) {
  const [dias, setDias] = useState(String(copy.rapidos[0]));

  return (
    <DialogoDeAccion
      boton={copy.boton}
      titulo={copy.titulo}
      bajada={
        <>
          <p>{copy.bajada}</p>
          {avisos}
        </>
      }
      confirmar={copy.confirmar}
      enviando={copy.enviando}
      accion={accion}
    >
      <input type="hidden" name="id_comercio" value={idComercio} />
      <div className="flex flex-col gap-2">
        <Field id={`dias-${id}`} label={copy.dias}>
          {(props) => (
            <input
              {...props}
              name="dias"
              type="number"
              inputMode="numeric"
              required
              min={1}
              max={maximo}
              value={dias}
              onChange={(e) => setDias(e.target.value)}
            />
          )}
        </Field>
        <div className="flex gap-2">
          {copy.rapidos.map((n) => (
            <button key={n} type="button" onClick={() => setDias(String(n))} className={claseDeOpcion(dias === String(n))}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <Field id={`nota-${id}`} label={copy.nota} optional={!notaObligatoria}>
        {(props) => (
          <input {...props} name="nota" required={notaObligatoria} maxLength={300} placeholder={copy.ejemplo} />
        )}
      </Field>
    </DialogoDeAccion>
  );
}
