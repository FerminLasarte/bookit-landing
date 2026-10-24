"use client";

import { suspender, type RespuestaDeSuspension } from "@/app/admin/(panel)/acciones";
import Field from "@/components/forms/Field";
import { acciones } from "@/content/admin";
import DialogoDeAccion from "./DialogoDeAccion";

/**
 * "Suspender" en la ficha. Antes de confirmar dice qué pasa con la plata según
 * quién cobra; al salir bien, si tiene turnos por delante, lo dice con un
 * "Listo" (BooKit `docs/admin-panel.md`, sección 21).
 */
export default function Suspender({
  idComercio,
  conDebito,
  deLaTienda,
}: {
  idComercio: string;
  conDebito: boolean;
  deLaTienda: boolean;
}) {
  const copy = acciones.acceso;
  const paso = copy.suspender;

  return (
    <DialogoDeAccion
      boton={paso.boton}
      titulo={paso.titulo}
      bajada={
        <>
          {paso.bajada.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {conDebito && <p className="font-medium text-fg">{paso.conDebito}</p>}
          {deLaTienda && <p className="font-medium text-fg">{paso.tienda}</p>}
        </>
      }
      confirmar={paso.confirmar}
      enviando={paso.enviando}
      accion={suspender}
      aviso={(r: RespuestaDeSuspension) =>
        r.turnosPorDelante ? { titulo: paso.quedo, texto: paso.porDelante(r.turnosPorDelante) } : null
      }
    >
      <input type="hidden" name="id_comercio" value={idComercio} />
      <Field id="nota-de-suspension" label={copy.nota}>
        {(props) => <input {...props} name="nota" required maxLength={300} placeholder={paso.ejemplo} />}
      </Field>
    </DialogoDeAccion>
  );
}
