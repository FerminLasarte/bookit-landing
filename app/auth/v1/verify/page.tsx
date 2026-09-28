import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import TextLink from "@/components/ui/TextLink";
import { verificar } from "@/content/paginas";
import { site } from "@/content/site";

type PageProps = {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
};

export const metadata: Metadata = {
  title: "Abrí Bookit",
  // El enlace es de una sola persona y lleva su token.
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/**
 * La misma ruta que el universal link de los mails de cuenta. El botón le pasa
 * el token a la app por su esquema, así que también sirve desde un navegador
 * que no saltó a la app: el token sigue sin usar.
 */
export default async function VerificarPage({ searchParams }: PageProps) {
  const { token_hash: tokenHash, type } = await searchParams;
  const abrirApp =
    tokenHash && type
      ? `${site.app.bundleId}://login-callback?${new URLSearchParams({ token_hash: tokenHash, type })}`
      : null;
  const { title, desc } = abrirApp ? verificar.conToken : verificar.sinToken;

  return (
    <Section
      id="verificar"
      as="h1"
      title={title}
      lede={desc}
      actions={abrirApp ? <Button href={abrirApp}>{verificar.cta}</Button> : undefined}
    >
      <p className="mx-auto max-w-[28rem] text-center text-small text-muted">
        {verificar.ayuda.pregunta}{" "}
        <TextLink href={verificar.ayuda.link.href}>{verificar.ayuda.link.label}</TextLink>
      </p>
    </Section>
  );
}
