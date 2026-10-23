"use client";

import { sumarAlLanzamiento, type RespuestaDeLanzamiento } from "@/app/admin/(panel)/acciones";
import Field from "@/components/forms/Field";
import { acciones } from "@/content/admin";
import DialogoDeAccion from "./DialogoDeAccion";

/**
 * "Sumar a los fundadores del lanzamiento": Pro gratis hasta el 1-jul-2027 y
 * después el precio fundador. Al salir bien dice cuántos lugares quedan de los
 * 10 (BooKit `docs/admin-panel.md`, sección 12).
 */
export default function SumarAlLanzamiento({ idComercio }: { idComercio: string }) {
  const copy = acciones.lanzamiento;
  return (
    <DialogoDeAccion
      boton={copy.boton}
      titulo={copy.titulo}
      bajada={copy.bajada.map((p) => (
        <p key={p}>{p}</p>
      ))}
      confirmar={copy.confirmar}
      enviando={copy.enviando}
      accion={sumarAlLanzamiento}
      aviso={(r: RespuestaDeLanzamiento) =>
        r.quedan === undefined ? null : { titulo: copy.quedoSumado, texto: copy.quedan(r.quedan) }
      }
    >
      <input type="hidden" name="id_comercio" value={idComercio} />
      <Field id="nota-del-lanzamiento" label={copy.nota} optional>
        {(props) => <input {...props} name="nota" maxLength={300} placeholder={copy.ejemplo} />}
      </Field>
    </DialogoDeAccion>
  );
}
