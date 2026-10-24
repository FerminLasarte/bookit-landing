import { reactivar } from "@/app/admin/(panel)/acciones";
import Field from "@/components/forms/Field";
import { acciones } from "@/content/admin";
import { fechaConAnio } from "@/lib/formato";
import DialogoDeAccion from "./DialogoDeAccion";

/**
 * "Reactivar" en la ficha de un local suspendido. Dice cómo vuelve, con la
 * misma regla que la base: según su vencimiento (D9 de la v4, sección 21).
 */
export default function Reactivar({
  idComercio,
  vencimiento,
  noRenueva,
  deLaTienda,
}: {
  idComercio: string;
  vencimiento: string | null;
  noRenueva: boolean;
  deLaTienda: boolean;
}) {
  const copy = acciones.acceso;
  const paso = copy.reactivar;
  const conDias = vencimiento !== null && new Date(vencimiento) > new Date();
  const comoVuelve = !vencimiento
    ? paso.pendiente
    : conDias
      ? paso.alDia(fechaConAnio(vencimiento))
      : paso.cortado(fechaConAnio(vencimiento));

  return (
    <DialogoDeAccion
      boton={paso.boton}
      titulo={paso.titulo}
      bajada={
        <>
          <p className="font-medium text-fg">{comoVuelve}</p>
          {conDias && noRenueva && !deLaTienda && <p>{paso.sinDebito}</p>}
          {deLaTienda && <p>{paso.tienda}</p>}
        </>
      }
      confirmar={paso.confirmar}
      enviando={paso.enviando}
      accion={reactivar}
    >
      <input type="hidden" name="id_comercio" value={idComercio} />
      <Field id="nota-de-reactivacion" label={copy.nota}>
        {(props) => <input {...props} name="nota" required maxLength={300} placeholder={paso.ejemplo} />}
      </Field>
    </DialogoDeAccion>
  );
}
