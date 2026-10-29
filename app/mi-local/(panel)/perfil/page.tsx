import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { guardarFotoDelLocal, guardarMiFoto } from "@/app/mi-local/(panel)/perfil/acciones";
import AsiTeVen from "@/components/mi-local/AsiTeVen";
import Avatar from "@/components/mi-local/Avatar";
import CambiarFoto from "@/components/mi-local/CambiarFoto";
import DatosDelLocal from "@/components/mi-local/DatosDelLocal";
import Encabezado from "@/components/mi-local/Encabezado";
import ErrorDeLectura from "@/components/mi-local/ErrorDeLectura";
import MiNombre from "@/components/mi-local/MiNombre";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { leerCategorias } from "@/lib/alta";
import { FORMAS_DEL_LOCAL, FORMAS_DEL_PROFESIONAL } from "@/lib/encuadre";
import { leerMiCuenta } from "@/lib/mi-local/gestion";
import { leerLugarQueEntra, type LugarDelDuenio, type LugarDelProfesional } from "@/lib/mi-local/lugar";
import { direccionParaMostrar, leerMiFicha, leerPerfilDelLocal } from "@/lib/mi-local/perfil";

export const metadata: Metadata = { title: miLocal.perfil.titulo };

/*
 * El perfil (fase 4, docs/PLAN-MI-LOCAL-FASE-4.md). El dueño, lo que el
 * cliente ve de su local en la app: "Así te ven" y los datos. El profesional
 * del equipo, "Mi perfil": su nombre y su foto en ese local (D7).
 */
export default async function PerfilPage() {
  const lugar = (await leerLugarQueEntra()) ?? redirect("/mi-local");
  return lugar.rol === "profesional" ? <MiPerfil lugar={lugar} /> : <PerfilDelLocal local={lugar} />;
}

/** Su ficha en ese local, como "Información profesional" de la app: quien trabaja en dos locales tiene una en cada uno. */
async function MiPerfil({ lugar }: { lugar: LugarDelProfesional }) {
  const copy = miLocal.miPerfil;
  const yo = await leerMiFicha(lugar.idProfesional).catch((error: unknown) => {
    console.error("mi-local/mi-perfil:", error);
    return null;
  });

  return (
    <div className="flex max-w-3xl flex-col gap-6 md:gap-8">
      <Encabezado titulo={copy.titulo} bajada={copy.bajada(lugar.nombre)} />
      {yo ? (
        <Superficie tone="surface" className="flex flex-col gap-6 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar nombre={yo.nombre} foto={yo.foto} tamano="ficha" />
            <CambiarFoto
              accion={guardarMiFoto}
              formas={FORMAS_DEL_PROFESIONAL}
              textos={miLocal.encuadre.profesional}
              hayFoto={yo.foto !== null}
            />
          </div>
          <MiNombre nombre={yo.nombre} />
        </Superficie>
      ) : (
        <ErrorDeLectura>{miLocal.perfil.error}</ErrorDeLectura>
      )}
    </div>
  );
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
        descripcion={perfil.descripcion}
        logo={perfil.logo}
        portada={perfil.portada}
        detalle={[categoria, direccion].filter(Boolean).join(" · ") || null}
        accion={
          <CambiarFoto
            accion={guardarFotoDelLocal}
            formas={FORMAS_DEL_LOCAL}
            textos={miLocal.encuadre.local}
            hayFoto={perfil.logo !== null}
          />
        }
      />

      <section aria-labelledby="datos-del-local">
        <h2 id="datos-del-local" className="text-title font-bold text-fg">
          {copy.datos.titulo}
        </h2>
        <Superficie tone="surface" className="mt-4 p-5 md:p-6">
          <DatosDelLocal
            nombre={perfil.nombre}
            categoria={perfil.categoria}
            otras={perfil.otras}
            descripcion={perfil.descripcion}
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
