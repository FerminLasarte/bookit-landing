import Aviso from "@/components/mi-local/Aviso";
import EnVivo from "@/components/mi-local/EnVivo";
import Filtros from "@/components/mi-local/Filtros";
import ListaDeTurnos from "@/components/mi-local/ListaDeTurnos";
import NavegarDias from "@/components/mi-local/NavegarDias";
import Encabezado from "@/components/mi-local/Encabezado";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import { miLocal, type Aviso as CopyDeAviso } from "@/content/mi-local";
import { dia, diaYMes, hoy, pesos } from "@/lib/formato";
import {
  cobrado,
  daAcceso,
  esEstadoTurno,
  leerMiLocal,
  leerProfesionales,
  leerTurnosDelDia,
  type MiLocal,
} from "@/lib/mi-local/agenda";
import { enlaceDeCarga, esClaveDeDia, type Vista } from "@/lib/mi-local/vista";
import { cookiesDeArea, credenciales } from "@/lib/supabase";

/*
 * La agenda del local en la web: los turnos de un día, de sólo lectura. Quién
 * entra lo dice la base: el proxy manda a entrar a quien no tiene sesión, y
 * `leerMiLocal` manda a /mi-local/sin-local a quien no es dueño de un local.
 */

type PageProps = { searchParams: Promise<{ dia?: string; profesional?: string; estado?: string }> };

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
  const vista: Vista = {
    dia: esClaveDeDia(pedido.dia) ? pedido.dia : hoyEnTandil,
    profesional: pedido.profesional ?? null,
    estado: esEstadoTurno(pedido.estado) ? pedido.estado : null,
  };
  const [turnos, profesionales] = await Promise.all([
    // Un día que no se pudo leer no se muestra vacío: se dice (el B1-11 de la app).
    leerTurnosDelDia(local.id, vista.dia).catch((error: unknown) => {
      console.error("mi-local:", error);
      return null;
    }),
    leerProfesionales(local.id).catch(() => []),
  ]);

  const deLaVista = turnos?.filter((t) => !vista.profesional || t.profesional?.id === vista.profesional) ?? [];
  const lista = deLaVista.filter((t) => !vista.estado || t.estado === vista.estado);
  const aviso = avisoDe(local);
  const copy = miLocal.agenda;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <Encabezado
        titulo={copy.titulo}
        bajada={dia(vista.dia)}
        accion={
          <Button href={enlaceDeCarga({ dia: vista.dia, profesional: vista.profesional, servicio: null })} size="compact">
            {copy.cargar}
          </Button>
        }
      />

      {aviso && <Aviso aviso={aviso} conBoton={local.suscripcion.origen !== "tienda"} />}

      <div className="flex flex-col gap-4">
        <NavegarDias dia={vista.dia} hoy={hoyEnTandil} ruta="/mi-local" parametros={{ profesional: vista.profesional, estado: vista.estado }} />
        <Filtros vista={vista} profesionales={profesionales} />
      </div>

      {turnos === null ? (
        <Superficie tone="surface" className="p-6">
          <p role="alert" className="text-small font-medium text-danger">
            {copy.error}
          </p>
        </Superficie>
      ) : (
        <>
          <p className="flex flex-wrap gap-x-6 gap-y-1 text-small text-muted">
            <span>{copy.turnos(lista.length)}</span>
            <span>
              {copy.cobrado} <span className="font-semibold text-fg tabular-nums">{pesos(cobrado(deLaVista))}</span>
            </span>
          </p>
          {lista.length > 0 ? (
            <ListaDeTurnos turnos={lista} ahora={new Date()} />
          ) : (
            <Superficie tone="surface" className="p-6 text-center">
              <p className="text-small text-muted">{turnos.length > 0 ? copy.vacioConFiltro : copy.vacio}</p>
            </Superficie>
          )}
        </>
      )}

      <EnVivo idComercio={local.id} {...credenciales()} cookies={cookiesDeArea.local} />
    </div>
  );
}
