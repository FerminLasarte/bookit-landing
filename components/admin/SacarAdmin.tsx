import { sacarAdmin } from "@/app/admin/(panel)/acciones";
import Field from "@/components/forms/Field";
import { acciones } from "@/content/admin";
import DialogoDeAccion from "./DialogoDeAccion";

/** "Sacar" en la fila de un admin que no es quien mira. */
export default function SacarAdmin({ idUsuario, email }: { idUsuario: string; email: string }) {
  const copy = acciones.equipo.sacar;
  return (
    <DialogoDeAccion
      boton={copy.boton}
      titulo={copy.titulo(email)}
      bajada={copy.bajada}
      confirmar={copy.confirmar}
      enviando={copy.enviando}
      accion={sacarAdmin}
    >
      <input type="hidden" name="id_usuario" value={idUsuario} />
      <Field id={`nota-sacar-${idUsuario}`} label={copy.nota} optional>
        {(props) => <input {...props} name="nota" maxLength={300} placeholder={copy.notaEjemplo} />}
      </Field>
    </DialogoDeAccion>
  );
}
