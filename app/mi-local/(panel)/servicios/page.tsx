import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Encabezado from "@/components/mi-local/Encabezado";
import ErrorDeLectura from "@/components/mi-local/ErrorDeLectura";
import ListaDeServicios from "@/components/mi-local/ListaDeServicios";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { leerLocalQueEntra } from "@/lib/mi-local/agenda";
import { leerServicios } from "@/lib/mi-local/gestion";

export const metadata: Metadata = { title: miLocal.servicios.titulo };

/*
 * Los servicios del local (fase 3, docs/PLAN-MI-LOCAL-FASE-3.md): la lista,
 * con lo que se cobra y si pide seña. Crear y editar son páginas aparte, como
 * la carga de un turno.
 */
export default async function ServiciosPage() {
  const local = (await leerLocalQueEntra()) ?? redirect("/mi-local");

  const copy = miLocal.servicios;
  // Una lista que no se pudo leer no se muestra vacía: se dice.
  const servicios = await leerServicios(local.id).catch((error: unknown) => {
    console.error("mi-local/servicios:", error);
    return null;
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8">
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
