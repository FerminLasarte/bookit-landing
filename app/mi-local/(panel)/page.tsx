import Aviso from "@/components/mi-local/Aviso";
import EnVivo from "@/components/mi-local/EnVivo";
import AgendaDelDia from "@/components/mi-local/AgendaDelDia";
import Encabezado from "@/components/mi-local/Encabezado";
import ErrorDeLectura from "@/components/mi-local/ErrorDeLectura";
import { miLocal, type Aviso as CopyDeAviso } from "@/content/mi-local";
import { dia as diaLargo, diaYMes, hoy } from "@/lib/formato";
import {
  daAcceso,
  leerHuecosDelDia,
  leerMiLocal,
  leerProfesionales,
  leerSemana,
  leerTurnosDelDia,
  type MiLocal,
} from "@/lib/mi-local/agenda";
import { esClaveDeDia, lunesDe } from "@/lib/mi-local/vista";
import { cookiesDeArea, credenciales } from "@/lib/supabase";

/*
 * La agenda del local en la web: los turnos de un día y sus huecos libres. Quién
 * entra lo dice la base: el proxy manda a entrar a quien no tiene sesión, y
 * `leerMiLocal` manda a /mi-local/sin-local a quien no es dueño de un local.
 */

/** El profesional y el estado también van en la URL, pero los lee la agenda en el navegador. */
type PageProps = { searchParams: Promise<{ dia?: string }> };

/** El aviso arriba de la agenda, o `null`. Mercado Pago se regulariza en /planes; la tienda, en el teléfono. */
function avisoDe({ suscripcion }: MiLocal): CopyDeAviso | null {
  if (suscripcion.estado === "en_gracia") return miLocal.avisos.enGracia;
  if (suscripcion.cancela_al_vencer && suscripcion.vence) return miLocal.avisos.noSeRenueva(diaYMes(suscripcion.vence));
  return null;
}

/** Lo que tapa la agenda cuando el local no entra. */
function bloqueoDe({ suscripcion }: MiLocal): CopyDeAviso {
  if (suscripcion.estado === "suspendida") return miLocal.bloqueo.suspendida;
  if (suscripcion.estado === "pendiente") return miLocal.bloqueo.pendiente;
  return suscripcion.plan === "prueba" ? miLocal.bloqueo.prueba : miLocal.bloqueo.cortada;
}

export default async function MiLocalPage({ searchParams }: PageProps) {
  const pedido = await searchParams;
  const local = await leerMiLocal();

  if (!daAcceso(local.suscripcion.estado)) {
    return (
      <div className="flex max-w-2xl flex-col gap-6">
        <Encabezado titulo={miLocal.agenda.titulo} />
        <Aviso aviso={bloqueoDe(local)} conBoton />
      </div>
    );
  }

  const hoyEnTandil = hoy();
  const dia = esClaveDeDia(pedido.dia) ? pedido.dia : hoyEnTandil;
  const [turnos, semana, profesionales, huecos] = await Promise.all([
    // Un día que no se pudo leer no se muestra vacío: se dice (el B1-11 de la app).
    leerTurnosDelDia(local.id, dia).catch((error: unknown) => {
      console.error("mi-local:", error);
      return null;
    }),
    // Sin la cuenta de la semana, la tira va sin cantidades.
    leerSemana(local.id, lunesDe(dia)).catch(() => ({})),
    leerProfesionales(local.id).catch(() => []),
    // Sin los huecos, la agenda va igual: los turnos no dependen de ellos.
    leerHuecosDelDia(local.id, dia).catch((error: unknown) => {
      console.error("mi-local/huecos:", error);
      return null;
    }),
  ]);
  const aviso = avisoDe(local);
  const copy = miLocal.agenda;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {turnos === null ? (
        <>
          <Encabezado titulo={copy.titulo} bajada={diaLargo(dia)} />
          <ErrorDeLectura>{copy.error}</ErrorDeLectura>
        </>
      ) : (
        <AgendaDelDia
          dia={dia}
          hoy={hoyEnTandil}
          semana={semana}
          turnos={turnos}
          profesionales={profesionales}
          huecos={huecos}
          ahora={new Date().toISOString()}
          aviso={aviso && <Aviso aviso={aviso} conBoton={local.suscripcion.origen !== "tienda"} />}
        />
      )}

      <EnVivo idComercio={local.id} {...credenciales()} cookies={cookiesDeArea.local} />
    </div>
  );
}
