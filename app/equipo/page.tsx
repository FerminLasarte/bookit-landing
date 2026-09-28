import type { Metadata } from "next";
import AbrirEnLaApp from "@/components/abrir-app/AbrirEnLaApp";
import { equipo } from "@/content/paginas";
import { site } from "@/content/site";

type PageProps = {
  searchParams: Promise<{ token?: string; email?: string }>;
};

export const metadata: Metadata = {
  title: "Tu invitación a Bookit",
  // El enlace es de una sola persona y lleva su token y su correo.
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/**
 * La misma ruta que el universal link del mail de invitación a un equipo. El
 * botón abre la invitación por el esquema de la app, que entienden también las
 * builds que no leen este enlace.
 */
export default async function EquipoPage({ searchParams }: PageProps) {
  const { token, email } = await searchParams;
  const abrirApp = token
    ? `${site.app.esquema}://equipo?${new URLSearchParams(email ? { token, email } : { token })}`
    : null;
  const { title, desc } = abrirApp ? equipo.conToken : equipo.sinToken;

  return <AbrirEnLaApp title={title} desc={desc} cta={equipo.cta} abrirApp={abrirApp} />;
}
