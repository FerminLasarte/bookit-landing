import type { Metadata } from "next";
import WaitlistForm from "@/components/forms/WaitlistForm";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import TextLink from "@/components/ui/TextLink";
import { IconCheck } from "@/components/ui/icons";
import { site } from "@/content/site";
import { listaEspera, type Audience } from "@/content/waitlist";

const title = "Tandil, tu forma de sacar turnos está por cambiar";
const gancho = `Anotate en la lista VIP y llevate ${site.puntosDeRegalo} Puntos Bookit de regalo para tu primer turno.`;
const description = `${gancho} Barberías, uñas, depilación y más, todo en una sola app.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/lista-espera" },
  openGraph: {
    title: `Bookit | ${title}`,
    description,
    url: `${site.url}/lista-espera`,
  },
  twitter: {
    title: `Bookit | ${title}`,
    description: gancho,
  },
};

export default async function ListaEsperaPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const initialAudience: Audience | null =
    tipo === "local" ? "local" : tipo === "cliente" ? "cliente" : null;
  const { pasos, datos } = listaEspera;

  return (
    <>
      <Section id="lista" as="h1" title={listaEspera.title} lede={listaEspera.lede}>
        <div className="mx-auto max-w-[36rem]">
          <WaitlistForm initialAudience={initialAudience} />

          <ul className="mt-8 space-y-2.5 px-2">
            {listaEspera.garantias.map((garantia) => (
              <li key={garantia} className="flex items-start gap-3 text-small text-muted">
                <IconCheck className="mt-0.5 size-4.5 shrink-0" />
                {garantia}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="como-sigue" title={pasos.title}>
        <ol className="grid gap-14 text-center md:grid-cols-3 md:gap-10">
          {pasos.items.map((paso, index) => (
            <Reveal as="li" key={paso.title} index={index}>
              <span aria-hidden="true" className="num text-title font-bold text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-title font-bold text-fg">{paso.title}</h3>
              <p className="mx-auto mt-2 max-w-[34ch] text-pretty text-small text-muted">{paso.body}</p>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* Letra chica: sin `Section`, que la pondría a tamaño display. */}
      <section aria-labelledby="datos-titulo" className="wrap pb-24 md:pb-36">
        <Reveal className="mx-auto max-w-[52ch] text-center">
          <h2 id="datos-titulo" className="text-title font-bold text-fg">
            {datos.title}
          </h2>
          <p className="mt-3 text-pretty text-small text-muted">{datos.body}</p>
          <p className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-small">
            {datos.links.map((link) => (
              <TextLink key={link.href} href={link.href}>
                {link.label}
              </TextLink>
            ))}
          </p>
        </Reveal>
      </section>
    </>
  );
}
