"use client";

import { cambiarVisibilidad, type RespuestaDeVisibilidad } from "@/app/admin/(panel)/acciones";
import Field from "@/components/forms/Field";
import { acciones } from "@/content/admin";
import DialogoDeAccion from "./DialogoDeAccion";

/**
 * "Ocultar" o "Mostrar", en la barra de la ficha: abre la confirmación. Cómo
 * está ahora lo dice el bloque Visibilidad. `noSeVe`: por qué un local visible
 * igual no aparece, para decirlo también al volver a mostrarlo.
 */
export default function CambiarVisibilidad({
  idComercio,
  visible,
  noSeVe,
}: {
  idComercio: string;
  visible: boolean;
  noSeVe: string | null;
}) {
  const copy = acciones.visibilidad;
  const paso = visible ? copy.ocultar : copy.mostrar;

  return (
    <DialogoDeAccion
      boton={paso.confirmar}
      titulo={paso.titulo}
      bajada={
        visible ? (
          copy.ocultar.bajada.map((p) => <p key={p}>{p}</p>)
        ) : (
          <>
            <p>{copy.mostrar.bajada}</p>
            {noSeVe && <p className="font-medium text-fg">{noSeVe}</p>}
          </>
        )
      }
      confirmar={paso.confirmar}
      enviando={paso.enviando}
      accion={cambiarVisibilidad}
      aviso={(r: RespuestaDeVisibilidad) =>
        r.visible === false && r.turnosPorDelante ? { titulo: copy.quedoOculto, texto: copy.porDelante(r.turnosPorDelante) } : null
      }
    >
      <input type="hidden" name="id_comercio" value={idComercio} />
      <input type="hidden" name="visible" value={String(!visible)} />
      {/* Con la key, la nota de un cambio no queda escrita para el siguiente:
          el diálogo es el mismo en los dos sentidos. */}
      <Field id="nota-de-visibilidad" label={copy.nota} optional>
        {(props) => <input {...props} key={String(visible)} name="nota" maxLength={300} placeholder={paso.ejemplo} />}
      </Field>
    </DialogoDeAccion>
  );
}
