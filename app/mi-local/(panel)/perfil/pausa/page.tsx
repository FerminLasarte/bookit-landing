import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Encabezado from "@/components/mi-local/Encabezado";
import ErrorDeLectura from "@/components/mi-local/ErrorDeLectura";
import FormularioDePausa, { type Elegido } from "@/components/mi-local/FormularioDePausa";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { hoy } from "@/lib/formato";
import { leerLocalDelDuenio } from "@/lib/mi-local/lugar";
import { leerPausa, leerTurnosEnLaPausa } from "@/lib/mi-local/pausa";
import { esClaveDeDia } from "@/lib/mi-local/vista";
import { enCurso, fechasDeLaPausa, type Pausa } from "@/lib/pausa";

export const metadata: Metadata = { title: miLocal.pausa.titulo };

type PageProps = {
  searchParams: Promise<{ desde?: string; vuelta?: string; hasta?: string; hecho?: string; n?: string; cambiaron?: string }>;
};

/** Lo que se acaba de hacer, como el aviso de la app al cerrar la hoja. La acción lo deja en la URL. */
function loHecho(hecho: string | undefined, n: string | undefined): string | null {
  const copy = miLocal.pausa.hecho;
  const cancelados = Number(n);
  if (hecho === "cancelados" && Number.isInteger(cancelados) && cancelados > 0) return copy.cancelados(cancelados);
  if (hecho === "pausado" || hecho === "guardado" || hecho === "volvio" || hecho === "saco") return copy[hecho];
  return null;
}

/** Lo que muestra el formulario: lo de la URL o, de entrada, la pausa que hay. Empezada, el principio no se mueve. */
function elegidoDe(pedido: Awaited<PageProps["searchParams"]>, pausa: Pausa | null, empezo: boolean, dia: string): Elegido {
  const pidio = pedido.desde !== undefined || pedido.vuelta !== undefined;
  if (!pidio) return { desde: pausa?.desde ?? dia, conVuelta: pausa ? pausa.hasta !== null : true, hasta: pausa?.hasta ?? "" };
  return {
    desde: empezo && pausa ? pausa.desde : esClaveDeDia(pedido.desde) ? pedido.desde : "",
    conVuelta: pedido.vuelta !== "sin",
    hasta: esClaveDeDia(pedido.hasta) ? pedido.hasta : "",
  };
}

/*
 * La pausa del local (docs/PLAN-MI-LOCAL-PAUSA.md, D1–D4): pausar entre dos
 * días o sin fecha de vuelta, cambiarle las fechas y volver. Es del dueño: el
 * profesional del equipo vuelve al perfil, y la base tampoco lo deja (D5).
 */
export default async function PausaPage({ searchParams }: PageProps) {
  const local = (await leerLocalDelDuenio()) ?? redirect("/mi-local/perfil");
  const pedido = await searchParams;
  const copy = miLocal.pausa;
  const dia = hoy();
  const volverAlPerfil = <TextLink href="/mi-local/perfil">{copy.alPerfil}</TextLink>;

  // Una pausa que no se pudo leer no se muestra como "sin pausa": se dice.
  const pausa = await leerPausa(local).catch((error: unknown) => {
    console.error("mi-local/pausa:", error);
    return undefined;
  });
  if (pausa === undefined) {
    return (
      <div className="flex max-w-2xl flex-col gap-6 md:gap-8">
        <Encabezado titulo={copy.titulo} bajada={copy.bajada} accion={volverAlPerfil} />
        <ErrorDeLectura>{copy.error}</ErrorDeLectura>
      </div>
    );
  }

  const empezo = pausa !== null && enCurso(pausa, dia);
  const elegido = elegidoDe(pedido, pausa, empezo, dia);
  const fechas = fechasDeLaPausa({ desde: elegido.desde, vuelta: elegido.conVuelta ? "con" : "sin", hasta: elegido.hasta });
  const turnos = fechas
    ? await leerTurnosEnLaPausa(local.id, fechas.desde, fechas.hasta).catch((error: unknown) => {
        console.error("mi-local/pausa-turnos:", error);
        return null;
      })
    : [];
  const hecho = loHecho(pedido.hecho, pedido.n);

  return (
    <div className="flex max-w-2xl flex-col gap-6 md:gap-8">
      <Encabezado titulo={pausa ? copy.tuPausa : copy.titulo} bajada={copy.bajada} accion={volverAlPerfil} />

      {hecho && (
        <Superficie tone="niebla" className="p-5" role="status">
          <p className="font-semibold text-fg">{hecho}</p>
        </Superficie>
      )}
      {pedido.cambiaron === "1" && (
        <Superficie tone="miel" className="p-5" role="alert">
          <p className="font-semibold text-fg">{copy.turnos.cambiaron}</p>
        </Superficie>
      )}

      {/* Con otra pausa (guardada, sacada), el formulario arranca de nuevo con ella. */}
      <FormularioDePausa
        key={`${pausa?.desde}-${pausa?.hasta}`}
        pausa={pausa}
        empezo={empezo}
        hoy={dia}
        elegido={elegido}
        turnos={turnos}
      />
    </div>
  );
}
