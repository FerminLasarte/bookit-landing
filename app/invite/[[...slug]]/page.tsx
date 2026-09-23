import type { Metadata } from "next";
import ReferralCode from "@/components/invite/ReferralCode";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import TextLink from "@/components/ui/TextLink";
import { invite } from "@/content/paginas";
import { flags, site } from "@/content/site";
import { codeFromSlug, normalizeCode } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ code?: string }>;
};

// El texto con el que se comparte el link ya circula: no cambia con el diseño.
const shareTitle = "¡Sumate a Bookit!";
const shareDescription = "Descargá la app, usá mi código de invitación y ganemos puntos los dos.";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const code = codeFromSlug(slug);
  const path = code ? `/invite/${slug?.join("/") ?? code}` : "/invite";

  // Si el código viene en la ruta, la OG lo incluye.
  const ogImage = {
    url: code ? `/og/invite?code=${encodeURIComponent(code)}` : "/og/invite",
    width: 1200,
    height: 630,
    alt: shareTitle,
  };

  return {
    title: shareTitle,
    description: shareDescription,
    alternates: { canonical: path },
    openGraph: {
      title: shareTitle,
      description: shareDescription,
      url: `${site.url}${path}`,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: shareDescription,
      images: [ogImage],
    },
    // Una página de invitación personal no aporta nada al índice.
    robots: { index: false, follow: true },
  };
}

export default async function InvitePage({ params, searchParams }: PageProps) {
  const [{ slug }, { code: queryCode }] = await Promise.all([params, searchParams]);

  // Precedencia (§6.3): ?code= → /invite/XXX
  const code = normalizeCode(queryCode) ?? codeFromSlug(slug);
  const etapa = flags.storeLinksLive ? "conTiendas" : "preLanzamiento";
  const { title, desc } = (code ? invite.conCodigo : invite.sinCodigo)[etapa];

  const cta = flags.storeLinksLive ? (
    <Button href={site.app.appStore ?? site.app.playStore ?? "/descargar"}>{invite.cta.conTiendas}</Button>
  ) : (
    <Button href={invite.cta.preLanzamiento.href}>{invite.cta.preLanzamiento.label}</Button>
  );

  return (
    // Con código, el botón va después del código; sin código, bajo la bajada.
    <Section id="invitacion" as="h1" title={title} lede={desc} actions={code ? undefined : cta}>
      <div className="mx-auto max-w-[28rem] text-center">
        {code && (
          <>
            <ReferralCode code={code} />
            <div className="mt-8">{cta}</div>
          </>
        )}

        <p className={code ? "mt-16 text-small text-muted" : "text-small text-muted"}>
          {invite.ayuda.pregunta}{" "}
          <TextLink href={invite.ayuda.link.href}>{invite.ayuda.link.label}</TextLink>
        </p>
      </div>
    </Section>
  );
}
