import { resolverIncidencia } from "@/app/admin/(panel)/acciones";
import Field from "@/components/forms/Field";
import { acciones } from "@/content/admin";
import DialogoDeAccion from "./DialogoDeAccion";

/** "Resolver" en una incidencia abierta: pide qué se hizo con la plata. */
export default function ResolverIncidencia({ idPago }: { idPago: string }) {
  const copy = acciones.resolver;
  return (
    <DialogoDeAccion
      boton={copy.boton}
      titulo={copy.titulo}
      bajada={copy.bajada}
      confirmar={copy.confirmar}
      enviando={copy.enviando}
      accion={resolverIncidencia}
    >
      <input type="hidden" name="id_pago_mp" value={idPago} />
      <Field id={`nota-${idPago}`} label={copy.nota}>
        {(props) => <textarea {...props} name="nota" required maxLength={500} rows={3} placeholder={copy.ejemplo} />}
      </Field>
    </DialogoDeAccion>
  );
}
