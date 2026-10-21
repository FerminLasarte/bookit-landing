import Aviso from "@/components/mi-local/Aviso";
import EnVivo from "@/components/mi-local/EnVivo";
import Filtros from "@/components/mi-local/Filtros";
import ListaDeTurnos from "@/components/mi-local/ListaDeTurnos";
import NavegarDias from "@/components/mi-local/NavegarDias";
import Salir from "@/components/mi-local/Salir";
import Section from "@/components/ui/Section";
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
import { esClaveDeDia, type Vista } from "@/lib/mi-local/vista";
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

const salir = <Salir>{miLocal.agenda.salir}</Salir>;

export default async function MiLocalPage({ searchParams }: PageProps) {
  const pedido = await searchParams;
  const local = await leerMiLocal();

  if (!daAcceso(local.suscripcion.estado)) {
    return (
      <Section id="mi-local" as="h1" title={local.nombre} actions={salir}>
        <div className="mx-auto max-w-2xl">
          <Aviso aviso={bloqueoDe(local)} conBoton />
        </div>
      </Section>
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
    <div className="wrap flex flex-col gap-6 py-8 md:gap-8 md:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-title font-bold text-fg md:text-[2rem] md:leading-tight md:tracking-[-0.02em]">
            {local.nombre}
          </h1>
          <p className="mt-1 text-body text-fg first-letter:uppercase">{dia(vista.dia)}</p>
        </div>
        {salir}
      </header>

      {aviso && <Aviso aviso={aviso} conBoton={local.suscripcion.origen !== "tienda"} />}

      <div className="flex flex-col gap-4">
        <NavegarDias vista={vista} hoy={hoyEnTandil} />
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
