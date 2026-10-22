import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Avatar from "@/components/mi-local/Avatar";
import DiasEspeciales from "@/components/mi-local/DiasEspeciales";
import Encabezado from "@/components/mi-local/Encabezado";
import ErrorDeLectura from "@/components/mi-local/ErrorDeLectura";
import { Grupo, Opcion } from "@/components/mi-local/Opciones";
import SemanaDelProfesional from "@/components/mi-local/SemanaDelProfesional";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { hoy } from "@/lib/formato";
import { leerDiasEspeciales, leerEquipo, leerFranjas, leerMiCuenta, leerMiembro, loEditaElDuenio } from "@/lib/mi-local/gestion";
import { leerLugarQueEntra } from "@/lib/mi-local/lugar";
import { semanaDe } from "@/lib/mi-local/horario";

export const metadata: Metadata = { title: miLocal.horarios.titulo };

/*
 * Los horarios de cada profesional (fase 3, D1): la semana habitual y los días
 * especiales, como `ScheduleScreen` de la app. Abre con el dueño, o con el
 * único profesional; las píldoras cambian de profesional por la URL. Lo del
 * dueño y lo de los que no tienen cuenta se edita; lo de los que tienen
 * cuenta, se ve (D2). El profesional del equipo ve y edita sólo lo suyo, como
 * en la app.
 */

type PageProps = { searchParams: Promise<{ profesional?: string }> };

export default async function HorariosPage({ searchParams }: PageProps) {
  const pedido = await searchParams;
  const local = (await leerLugarQueEntra()) ?? redirect("/mi-local");
  const copy = miLocal.horarios;
  const hoyEnTandil = hoy();

  const lectura = await (async () => {
    const cuenta = await leerMiCuenta();
    // Los que reciben turnos, y el pedido aunque esté pausado: se llega desde su página.
    const equipo =
      local.rol === "duenio"
        ? (await leerEquipo(local.id, cuenta.id)).filter((m) => m.activo || m.id === pedido.profesional)
        : [await leerMiembro(local.id, local.idProfesional, cuenta.id)].filter((m) => m !== null);
    const elegido = equipo.find((m) => m.id === pedido.profesional) ?? equipo.find((m) => m.esDuenio) ?? equipo[0];
    if (!elegido) return { equipo, elegido: null };
    const [franjas, especiales] = await Promise.all([leerFranjas(elegido.id), leerDiasEspeciales(elegido.id, hoyEnTandil)]);
    return { equipo, elegido, editable: loEditaElDuenio(elegido), semana: semanaDe(franjas), especiales };
  })().catch((error: unknown) => {
    console.error("mi-local/horarios:", error);
    return null;
  });

  return (
    <div className="flex max-w-3xl flex-col gap-6 md:gap-8">
      <Encabezado titulo={copy.titulo} />

      {!lectura ? (
        <ErrorDeLectura>{copy.error}</ErrorDeLectura>
      ) : !lectura.elegido ? (
        <Superficie tone="surface" className="p-6">
          <p className="text-small text-muted">
            {copy.sinProfesionales} <TextLink href="/mi-local/equipo">{miLocal.equipo.titulo}</TextLink>
          </p>
        </Superficie>
      ) : (
        <>
          {/* Con uno solo, elegirlo sería una decisión sin alternativas. */}
          {lectura.equipo.length > 1 && (
            <Grupo titulo={copy.profesional}>
              {lectura.equipo.map((m) => (
                <Opcion
                  key={m.id}
                  href={`/mi-local/horarios?profesional=${m.id}`}
                  activa={m.id === lectura.elegido.id}
                  className="gap-1.5 pl-1"
                >
                  <Avatar nombre={m.nombre} foto={m.foto} tamano="chico" />
                  {m.nombre}
                </Opcion>
              ))}
            </Grupo>
          )}
          {!lectura.editable && <p className="-mt-2 text-small text-muted">{copy.soloLectura}</p>}

          <SemanaDelProfesional profesional={lectura.elegido.id} semana={lectura.semana} editable={lectura.editable} />
          <DiasEspeciales
            profesional={lectura.elegido.id}
            dias={lectura.especiales}
            editable={lectura.editable}
            hoy={hoyEnTandil}
          />
        </>
      )}
    </div>
  );
}
