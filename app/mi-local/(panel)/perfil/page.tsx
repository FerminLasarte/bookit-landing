import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AsiTeVen from "@/components/mi-local/AsiTeVen";
import DatosDelLocal from "@/components/mi-local/DatosDelLocal";
import Encabezado from "@/components/mi-local/Encabezado";
import ErrorDeLectura from "@/components/mi-local/ErrorDeLectura";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { leerCategorias } from "@/lib/alta";
import { leerMiCuenta } from "@/lib/mi-local/gestion";
import { leerLugarQueEntra, type LugarDelDuenio } from "@/lib/mi-local/lugar";
import { direccionParaMostrar, leerPerfilDelLocal } from "@/lib/mi-local/perfil";

export const metadata: Metadata = { title: miLocal.perfil.titulo };

/*
 * El perfil (fase 4, docs/PLAN-MI-LOCAL-FASE-4.md). El dueño, lo que el
 * cliente ve de su local en la app: "Así te ven" y los datos.
 */
export default async function PerfilPage() {
  const lugar = (await leerLugarQueEntra()) ?? redirect("/mi-local");
  if (lugar.rol === "profesional") redirect("/mi-local");
  return <PerfilDelLocal local={lugar} />;
}

async function PerfilDelLocal({ local }: { local: LugarDelDuenio }) {
  const copy = miLocal.perfil;
  // Un perfil que no se pudo leer no se muestra vacío: se dice.
  const lectura = await Promise.all([leerPerfilDelLocal(local.id), leerCategorias(), leerMiCuenta()]).catch(
    (error: unknown) => {
      console.error("mi-local/perfil:", error);
      return null;
    },
  );

  if (!lectura) {
    return (
      <div className="flex max-w-3xl flex-col gap-6 md:gap-8">
        <Encabezado titulo={copy.titulo} bajada={copy.bajada} />
        <ErrorDeLectura>{copy.error}</ErrorDeLectura>
      </div>
    );
  }

  const [perfil, categorias, cuenta] = lectura;
  const direccion = direccionParaMostrar(perfil);
  const categoria = categorias.find((c) => c.id === perfil.categoria)?.nombre;

  return (
    <div className="flex max-w-3xl flex-col gap-6 md:gap-8">
      <Encabezado titulo={copy.titulo} bajada={copy.bajada} />

      <AsiTeVen
        titulo={copy.asiTeVen}
        nombre={perfil.nombre}
        logo={perfil.logo}
        portada={perfil.portada}
        detalle={[categoria, direccion].filter(Boolean).join(" · ") || null}
      />

      <section aria-labelledby="datos-del-local">
        <h2 id="datos-del-local" className="text-title font-bold text-fg">
          {copy.datos.titulo}
        </h2>
        <Superficie tone="surface" className="mt-4 p-5 md:p-6">
          <DatosDelLocal
            nombre={perfil.nombre}
            categoria={perfil.categoria}
            direccion={direccion}
            instagram={perfil.instagram}
            email={cuenta.email}
            categorias={categorias}
          />
        </Superficie>
      </section>
    </div>
  );
}
