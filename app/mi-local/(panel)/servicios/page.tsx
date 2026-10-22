import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Encabezado from "@/components/mi-local/Encabezado";
import ErrorDeLectura from "@/components/mi-local/ErrorDeLectura";
import ListaDeServicios from "@/components/mi-local/ListaDeServicios";
import PartesDeGestion from "@/components/mi-local/PartesDeGestion";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import ServiciosDelProfesional from "@/components/mi-local/ServiciosDelProfesional";
import { leerPreciosQueValen, leerServicios, leerServiciosAsignados } from "@/lib/mi-local/gestion";
import { leerLugarQueEntra, type LugarDelProfesional } from "@/lib/mi-local/lugar";

export const metadata: Metadata = { title: miLocal.servicios.titulo };

/*
 * Los servicios del local (fase 3, docs/PLAN-MI-LOCAL-FASE-3.md): la lista,
 * con lo que se cobra y si pide seña. Crear y editar son páginas aparte, como
 * la carga de un turno. El profesional del equipo ve "Mis servicios".
 */
export default async function ServiciosPage() {
  const local = (await leerLugarQueEntra()) ?? redirect("/mi-local");
  if (local.rol === "profesional") return <MisServicios lugar={local} />;

  const copy = miLocal.servicios;
  // Una lista que no se pudo leer no se muestra vacía: se dice.
  const servicios = await leerServicios(local.id).catch((error: unknown) => {
    console.error("mi-local/servicios:", error);
    return null;
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <PartesDeGestion actual="servicios" />
      <Encabezado
        titulo={copy.titulo}
        bajada={servicios?.length ? copy.resumen(servicios.length, servicios.filter((s) => s.sena).length) : undefined}
        accion={
          <Button href="/mi-local/servicios/nuevo" size="compact">
            {copy.nuevo}
          </Button>
        }
      />

      {servicios === null ? (
        <ErrorDeLectura>{copy.error}</ErrorDeLectura>
      ) : servicios.length === 0 ? (
        <Superficie tone="surface" className="p-6 text-center">
          <p className="font-semibold text-fg">{copy.vacio.titulo}</p>
          <p className="mt-1 text-small text-muted">{copy.vacio.bajada}</p>
        </Superficie>
      ) : (
        <ListaDeServicios servicios={servicios} />
      )}
    </div>
  );
}

/**
 * Los servicios de un profesional del equipo, como "Mis Servicios" de la app
 * (D3 del plan del equipo): los que le asignó el dueño, con su duración y, si
 * valen los precios libres, su precio. Asignarse uno es del dueño.
 */
async function MisServicios({ lugar }: { lugar: LugarDelProfesional }) {
  const copy = miLocal.misServicios;
  const lectura = await Promise.all([
    leerServicios(lugar.id),
    leerServiciosAsignados(lugar.idProfesional),
    leerPreciosQueValen(lugar.id),
  ]).catch((error: unknown) => {
    console.error("mi-local/mis-servicios:", error);
    return null;
  });
  const [servicios, asignados, conPrecio] = lectura ?? [[], [], false];
  const suyos = servicios.filter((s) => asignados.some((a) => a.servicio === s.id));

  return (
    <div className="flex max-w-3xl flex-col gap-6 md:gap-8">
      <Encabezado titulo={copy.titulo} bajada={suyos.length ? copy.bajada : undefined} />

      {lectura === null ? (
        <ErrorDeLectura>{copy.error}</ErrorDeLectura>
      ) : suyos.length === 0 ? (
        <Superficie tone="surface" className="p-6 text-center">
          <p className="font-semibold text-fg">{copy.vacio.titulo}</p>
          <p className="mt-1 text-small text-muted">{copy.vacio.bajada}</p>
        </Superficie>
      ) : (
        <Superficie tone="surface" className="p-5 md:p-6">
          <ServiciosDelProfesional
            idProfesional={lugar.idProfesional}
            servicios={suyos}
            asignados={asignados}
            editable
            conPrecio={conPrecio}
            propios
          />
        </Superficie>
      )}
    </div>
  );
}
