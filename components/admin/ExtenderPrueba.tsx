import { extenderPrueba } from "@/app/admin/(panel)/acciones";
import { acciones } from "@/content/admin";
import DialogoDeDias from "./DialogoDeDias";

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
  return (
    <DialogoDeDias
      id="de-prueba"
      idComercio={idComercio}
      copy={copy}
      maximo={60}
      notaObligatoria={false}
      avisos={
        <>
          {conDebito && <p className="font-medium text-fg">{copy.conDebito}</p>}
          {noRenueva && <p className="font-medium text-fg">{copy.noRenueva}</p>}
        </>
      }
      accion={extenderPrueba}
    />
  );
}
