"use client";

import { cambiarVisibilidad, type RespuestaDeVisibilidad } from "@/app/admin/(panel)/acciones";
import Field from "@/components/forms/Field";
import { claseDeOpcion } from "@/components/mi-local/Opciones";
import { acciones } from "@/content/admin";
import DialogoDeAccion from "./DialogoDeAccion";

/**
 * El interruptor del equipo en la ficha: "Visible para todos" u "Oculto". La
 * opción vigente va llena; la otra abre la confirmación. `noSeVe`: por qué un
 * local visible igual no aparece, para decirlo también al volver a mostrarlo.
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
  const opciones = [
    { valor: true, label: copy.visible },
    { valor: false, label: copy.oculto },
  ];

  return (
    <DialogoDeAccion
      disparador={(abrir) => (
        <div role="group" aria-label={copy.titulo} className="flex flex-wrap gap-2">
          {opciones.map((o) =>
            o.valor === visible ? (
              <span key={o.label} aria-current="true" className={claseDeOpcion(true)}>
                {o.label}
              </span>
            ) : (
              <button key={o.label} type="button" onClick={abrir} className={claseDeOpcion(false)}>
                {o.label}
              </button>
            ),
          )}
        </div>
      )}
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
      <Field id="nota-de-visibilidad" label={copy.nota} optional>
        {(props) => <input {...props} name="nota" maxLength={300} placeholder={copy.ejemplo} />}
      </Field>
    </DialogoDeAccion>
  );
}
