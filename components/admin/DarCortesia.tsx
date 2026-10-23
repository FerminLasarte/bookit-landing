import { darCortesia } from "@/app/admin/(panel)/acciones";
import { acciones, diasDeGracia } from "@/content/admin";
import DialogoDeDias from "./DialogoDeDias";

/**
 * "Dar días de cortesía" en la ficha de un local de Mercado Pago que no pagó.
 * Antes de confirmar dice qué pasa al terminar, que depende de si pidió no
 * renovar (BooKit `docs/admin-panel.md`, sección 16).
 */
export default function DarCortesia({
  idComercio,
  plan,
  conDebito,
  noRenueva,
}: {
  idComercio: string;
  plan: string;
  conDebito: boolean;
  noRenueva: boolean;
}) {
  // Lo que es función se queda acá: el diálogo es del navegador y recibe sólo textos.
  const { sigueConGracia, conDebito: textoConDebito, seCortaSinGracia, ...copy } = acciones.cortesia;
  return (
    <DialogoDeDias
      id="de-cortesia"
      idComercio={idComercio}
      copy={copy}
      maximo={30}
      notaObligatoria
      avisos={
        noRenueva ? (
          <p className="font-medium text-fg">{seCortaSinGracia}</p>
        ) : (
          <>
            <p className="font-medium text-fg">{sigueConGracia(diasDeGracia[plan])}</p>
            {conDebito && <p className="font-medium text-fg">{textoConDebito}</p>}
          </>
        )
      }
      accion={darCortesia}
    />
  );
}
