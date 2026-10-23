import { sumarAdmin } from "@/app/admin/(panel)/acciones";
import Field from "@/components/forms/Field";
import { acciones } from "@/content/admin";
import DialogoDeAccion from "./DialogoDeAccion";

/** "Sumar a alguien" en Equipo: el mail de su cuenta y una nota opcional. */
export default function SumarAdmin() {
  const copy = acciones.equipo.sumar;
  return (
    <DialogoDeAccion
      boton={copy.boton}
      titulo={copy.titulo}
      bajada={copy.bajada}
      confirmar={copy.confirmar}
      enviando={copy.enviando}
      accion={sumarAdmin}
    >
      <Field id="mail-del-admin" label={copy.mail}>
        {(props) => (
          <input {...props} name="email" type="email" required autoComplete="off" maxLength={320} placeholder={copy.ejemplo} />
        )}
      </Field>
      <Field id="nota-del-admin" label={copy.nota} optional>
        {(props) => <input {...props} name="nota" maxLength={300} placeholder={copy.notaEjemplo} />}
      </Field>
    </DialogoDeAccion>
  );
}
