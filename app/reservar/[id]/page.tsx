import type { Metadata } from "next";
import Image from "next/image";
import { cache } from "react";
import BotonesDeDescarga from "@/components/abrir-app/BotonesDeDescarga";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import { reservar } from "@/content/paginas";
import { site } from "@/content/site";
import { clientePublico } from "@/lib/supabase";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ p?: string }>;
};

type Local = {
  nombre: string;
  logo_url: string | null;
  localidad: string | null;
  profesional: string | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Lo que la base le muestra a cualquiera del local (`local_del_enlace`).
 * Con `cache`, la metadata y la página hacen un solo viaje.
 */
const traerLocal = cache(async (id: string, p: string | null): Promise<Local | null> => {
  if (!UUID.test(id)) return null;
  const { data, error } = await clientePublico().rpc("local_del_enlace", {
    p_id_comercio: id,
    p_id_profesional: p && UUID.test(p) ? p : null,
  });
  if (error) {
    console.error("local_del_enlace", error.message);
    return null;
  }
  return (data as Local[] | null)?.[0] ?? null;
});

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ id }, { p }] = await Promise.all([params, searchParams]);
  const local = await traerLocal(id, p ?? null);
  return {
    title: local ? reservar.conLocal.title(local.nombre, local.profesional) : reservar.sinLocal.title,
    // El enlace es de un local y vive en su historia: no aporta al índice.
    robots: { index: false, follow: true },
  };
}

/**
 * La misma ruta que el universal link de la historia. Con la app instalada en
 * el teléfono no se llega acá: el enlace la abre sola. El botón le pasa lo
 * mismo por el esquema, para el navegador que no salta a la app (el de
 * Instagram, a veces).
 */
export default async function ReservarPage({ params, searchParams }: PageProps) {
  const [{ id }, { p }] = await Promise.all([params, searchParams]);
  const local = await traerLocal(id, p ?? null);

  if (!local) {
    return (
      <Section
        id="reservar"
        as="h1"
        title={reservar.sinLocal.title}
        lede={reservar.sinLocal.desc}
        actions={<BotonesDeDescarga />}
      />
    );
  }

  const query = p && UUID.test(p) && local.profesional ? `?${new URLSearchParams({ p })}` : "";
  const abrirApp = `${site.app.esquema}://reservar/${id}${query}`;

  return (
    <Section
      id="reservar"
      as="h1"
      title={reservar.conLocal.title(local.nombre, local.profesional)}
      lede={reservar.conLocal.desc}
      actions={<Button href={abrirApp}>{reservar.cta}</Button>}
    >
      <div className="mx-auto flex max-w-[28rem] flex-col items-center gap-4 text-center">
        {local.logo_url && (
          <Image
            src={local.logo_url}
            alt={local.nombre}
            width={96}
            height={96}
            className="size-24 rounded-full object-cover"
          />
        )}
        {local.localidad && <p className="text-small text-muted">{local.localidad}</p>}
        <p className="mt-8 text-small text-muted">{reservar.sinApp}</p>
        <BotonesDeDescarga />
      </div>
    </Section>
  );
}
