import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Encabezado from "@/components/mi-local/Encabezado";
import FormularioDeTurno from "@/components/mi-local/FormularioDeTurno";
import NavegarDias from "@/components/mi-local/NavegarDias";
import { Grupo, Opcion } from "@/components/mi-local/Opciones";
import TextLink from "@/components/ui/TextLink";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { dia as diaLargo, hoy, pesos } from "@/lib/formato";
import {
  daAcceso,
  leerHorariosLibres,
  leerMiLocal,
  leerProfesionales,
  leerServiciosDelProfesional,
  type Profesional,
  type ServicioDelProfesional,
} from "@/lib/mi-local/agenda";
import { enlaceDeCarga, enlaceDeVista, esClaveDeDia, type Carga } from "@/lib/mi-local/vista";

export const metadata: Metadata = { title: miLocal.nuevo.titulo };

/*
 * Cargar un turno a mano (D5 y D6 del plan de la fase 2). Cada elección es un
 * enlace y queda en la URL, como los filtros de la agenda: profesional,
 * servicio y día se leen acá, en el servidor. Sólo el último paso, el horario
 * y el cliente, es una acción.
 */

type PageProps = { searchParams: Promise<{ dia?: string; profesional?: string; servicio?: string }> };

export default async function NuevoTurnoPage({ searchParams }: PageProps) {
  const pedido = await searchParams;
  const local = await leerMiLocal();
  // La agenda dice por qué no entra y cómo regularizarlo.
  if (!daAcceso(local.suscripcion.estado)) redirect("/mi-local");

  const copy = miLocal.nuevo;
  const hoyEnTandil = hoy();
  const dia = esClaveDeDia(pedido.dia) ? pedido.dia : hoyEnTandil;

  // Con uno solo, elegirlo sería una decisión sin alternativas: va elegido, como en la app.
  const lectura = await (async () => {
    const profesionales = await leerProfesionales(local.id);
    const profesional =
      profesionales.find((p) => p.id === pedido.profesional) ?? (profesionales.length === 1 ? (profesionales[0] ?? null) : null);
    const servicios = profesional ? await leerServiciosDelProfesional(profesional.id) : null;
    const servicio =
      servicios?.find((s) => String(s.id) === pedido.servicio) ?? (servicios?.length === 1 ? (servicios[0] ?? null) : null);
    const horarios = profesional && servicio ? await leerHorariosLibres(profesional.id, dia, servicio.id) : null;
    return { profesionales, profesional, servicios, servicio, horarios };
  })().catch((error: unknown) => {
    console.error("mi-local/nuevo:", error);
    return null;
  });

  const volver = enlaceDeVista({ dia, profesional: null, estado: null });

  return (
    // Un formulario no se estira: ancho de lectura, a la izquierda (D2 del plan del panel).
    <div className="flex max-w-3xl flex-col gap-6 md:gap-8">
      <Encabezado titulo={copy.titulo} accion={<TextLink href={volver}>{copy.volver}</TextLink>} />

      {!lectura ? (
        <Aviso tono="error">{copy.error}</Aviso>
      ) : (
        <Pasos {...lectura} dia={dia} hoy={hoyEnTandil} />
      )}
    </div>
  );
}

type Lectura = {
  profesionales: Profesional[];
  profesional: Profesional | null;
  servicios: ServicioDelProfesional[] | null;
  servicio: ServicioDelProfesional | null;
  horarios: string[] | null;
};

function Pasos({ profesionales, profesional, servicios, servicio, horarios, dia, hoy }: Lectura & { dia: string; hoy: string }) {
  const copy = miLocal.nuevo;
  const carga: Carga = { dia, profesional: profesional?.id ?? null, servicio: servicio ? String(servicio.id) : null };

  if (profesionales.length === 0) return <Aviso>{copy.sinProfesionales}</Aviso>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {profesionales.length > 1 && (
          <Grupo titulo={copy.profesional}>
            {profesionales.map((p) => (
              <Opcion
                key={p.id}
                href={enlaceDeCarga({ ...carga, profesional: p.id, servicio: null })}
                activa={p.id === profesional?.id}
              >
                {p.nombre}
              </Opcion>
            ))}
          </Grupo>
        )}
        {servicios && servicios.length > 0 && (
          <Grupo titulo={copy.servicio}>
            {servicios.map((s) => (
              <Opcion key={s.id} href={enlaceDeCarga({ ...carga, servicio: String(s.id) })} activa={s.id === servicio?.id}>
                {copy.detalleDelServicio(s.nombre, s.duracion, pesos(s.precio))}
              </Opcion>
            ))}
          </Grupo>
        )}
      </div>

      {!profesional ? (
        <Aviso>{copy.elegirProfesional}</Aviso>
      ) : servicios?.length === 0 ? (
        <Aviso>{copy.sinServicios(profesional.nombre)}</Aviso>
      ) : !servicio ? (
        <Aviso>{copy.elegirServicio}</Aviso>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-small font-semibold text-fg first-letter:uppercase">
              {copy.dia}: {diaLargo(dia)}
            </p>
            <NavegarDias dia={dia} hoy={hoy} ruta="/mi-local/nuevo" parametros={{ profesional: carga.profesional, servicio: carga.servicio }} />
          </div>
          <Superficie tone="surface" className="p-5 md:p-6">
            {horarios && horarios.length > 0 ? (
              // La clave cambia con lo elegido: un horario marcado no sobrevive a otro día u otro servicio.
              <FormularioDeTurno
                key={`${dia}-${profesional.id}-${servicio.id}`}
                dia={dia}
                profesional={profesional.id}
                servicio={servicio.id}
                horarios={horarios}
              />
            ) : (
              <p className="text-center text-small text-muted">{copy.sinHorarios}</p>
            )}
          </Superficie>
        </>
      )}
    </div>
  );
}

function Aviso({ tono, children }: { tono?: "error"; children: string }) {
  return (
    <Superficie tone="surface" className="p-6 text-center">
      <p role={tono === "error" ? "alert" : undefined} className={tono === "error" ? "text-small font-medium text-danger" : "text-small text-muted"}>
        {children}
      </p>
    </Superficie>
  );
}
