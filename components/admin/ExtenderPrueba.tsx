"use client";

import { useState } from "react";
import { extenderPrueba } from "@/app/admin/(panel)/acciones";
import Field from "@/components/forms/Field";
import { claseDeOpcion } from "@/components/mi-local/Opciones";
import { acciones } from "@/content/admin";
import DialogoDeAccion from "./DialogoDeAccion";

/**
 * "Extender la prueba" en la ficha de un local en prueba. Avisa antes lo que
 * la extensión no cambia: el débito ya autorizado y la baja pedida (BooKit
 * `docs/admin-panel.md`, sección 4).
 */
export default function ExtenderPrueba({
  idComercio,
  conDebito,
  noRenueva,
}: {
  idComercio: string;
  conDebito: boolean;
  noRenueva: boolean;
}) {
  const copy = acciones.extender;
  const [dias, setDias] = useState(String(copy.rapidos[0]));

  return (
    <DialogoDeAccion
      boton={copy.boton}
      titulo={copy.titulo}
      bajada={
        <>
          <p>{copy.bajada}</p>
          {conDebito && <p className="font-medium text-fg">{copy.conDebito}</p>}
          {noRenueva && <p className="font-medium text-fg">{copy.noRenueva}</p>}
        </>
      }
      confirmar={copy.confirmar}
      enviando={copy.enviando}
      accion={extenderPrueba}
    >
      <input type="hidden" name="id_comercio" value={idComercio} />
      <div className="flex flex-col gap-2">
        <Field id="dias-de-prueba" label={copy.dias}>
          {(props) => (
            <input
              {...props}
              name="dias"
              type="number"
              inputMode="numeric"
              required
              min={1}
              max={60}
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
      <Field id="nota-de-prueba" label={copy.nota} optional>
        {(props) => <input {...props} name="nota" maxLength={300} placeholder={copy.ejemplo} />}
      </Field>
    </DialogoDeAccion>
  );
}
