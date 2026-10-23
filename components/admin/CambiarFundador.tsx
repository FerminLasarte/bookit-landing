import { cambiarFundador } from "@/app/admin/(panel)/acciones";
import Field from "@/components/forms/Field";
import { acciones } from "@/content/admin";
import DialogoDeAccion from "./DialogoDeAccion";

/**
 * "Marcar fundador" o "Sacar el precio fundador". El diálogo dice qué cambia
 * según quién cobra: lo que ya cobra Mercado Pago o la tienda sigue igual, y
 * el precio nuevo vale para lo próximo (BooKit `docs/admin-panel.md`, sección 17).
 */
export default function CambiarFundador({
  idComercio,
  esFundador,
  deLaTienda,
  conDebito,
  delLanzamiento,
}: {
  idComercio: string;
  esFundador: boolean;
  deLaTienda: boolean;
  conDebito: boolean;
  delLanzamiento: boolean;
}) {
  const copy = acciones.fundador;
  const paso = esFundador ? copy.sacar : copy.marcar;
  const queCambia = deLaTienda ? paso.tienda : conDebito ? paso.conDebito : paso.sinCobrar;

  return (
    <DialogoDeAccion
      boton={paso.boton}
      titulo={paso.titulo}
      bajada={
        <>
          <p>{queCambia}</p>
          {esFundador && delLanzamiento && <p className="font-medium text-fg">{copy.sacar.delLanzamiento}</p>}
        </>
      }
      confirmar={paso.confirmar}
      enviando={paso.enviando}
      accion={cambiarFundador}
    >
      <input type="hidden" name="id_comercio" value={idComercio} />
      <input type="hidden" name="es_fundador" value={String(!esFundador)} />
      <Field id="nota-de-fundador" label={copy.nota}>
        {/* Con la key, la nota de marcar no queda escrita para sacar: el diálogo
            es el mismo en los dos sentidos, como el de visibilidad. */}
        {(props) => (
          <input {...props} key={String(esFundador)} name="nota" required maxLength={300} placeholder={paso.ejemplo} />
        )}
      </Field>
    </DialogoDeAccion>
  );
}
