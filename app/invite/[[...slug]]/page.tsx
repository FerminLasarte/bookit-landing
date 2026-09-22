import type { Metadata } from "next";
import { Mail } from "lucide-react";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import Hairline from "@/components/Hairline";
import ReferralCode from "@/components/ReferralCode";
import Wordmark from "@/components/Wordmark";
import { flags, site } from "@/content/site";
import { codeFromSlug, normalizeCode } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ code?: string }>;
};

const shareTitle = "¡Sumate a Bookit!";
const shareDescription =
  "Descargá la app, usá mi código de invitación y ganemos puntos los dos.";

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

/**
 * Los referidos son sólo entre personas que sacan turnos, así que acá hay un
 * único mensaje con código. La variante para comercios se dio de baja junto con
 * el programa: un local no tiene código ni suma puntos por invitar.
 */
const copy = {
  conCodigo: {
    title: "¡Te invitaron a unirte a Bookit!",
    desc: "Descargá la app, usá el código de abajo al registrarte y sumá puntos para tus próximos turnos.",
  },
  sinCodigo: {
    title: "Tu próximo turno, a un clic de distancia.",
    desc: "Descargá la app oficial de Bookit para gestionar tus reservas en barberías, peluquerías y centros de estética de forma rápida y sencilla.",
  },
} as const;

export default async function InvitePage({ params, searchParams }: PageProps) {
  const [{ slug }, { code: queryCode }] = await Promise.all([params, searchParams]);

  // Precedencia (§6.3): ?code= → /invite/XXX
  const code = normalizeCode(queryCode) ?? codeFromSlug(slug);

  const contenido = code ? copy.conCodigo : copy.sinCodigo;

  return (
    <div className="relative overflow-hidden py-16 md:py-24">
      {/* Único glow de esta página */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(215,138,29,0.15)_0%,rgba(215,138,29,0)_70%)]"
      />

      <div className="wrap relative">
        <div className="mx-auto max-w-[34rem]">
          <div className="flex justify-center">
            <Wordmark className="text-3xl" />
          </div>

          <div className="mt-10 rounded-card border border-ink-900/8 bg-paper p-7 shadow-[0_1px_0_rgba(0,0,0,0.03)] md:p-9 dark:border-white/8 dark:bg-ink-800">
            {code && <Eyebrow>Invitación</Eyebrow>}

            <h1 className="mt-5 text-display-lg font-semibold text-ink-900 dark:text-bone-100">
              {contenido.title}
            </h1>
            <p className="measure mt-5 text-ink-500 dark:text-bone-300">{contenido.desc}</p>

            {code && (
              <div className="mt-8">
                <ReferralCode code={code} />
              </div>
            )}

            <div className="mt-8">
              {flags.storeLinksLive ? (
                <Button
                  text="Descargar App"
                  href={site.app.appStore ?? site.app.playStore ?? "/descargar"}
                  fullWidth
                />
              ) : (
                <>
                  <Button
                    text="Anotate y te avisamos"
                    href="/lista-espera"
                    fullWidth
                  />
                  <p className="mt-4 text-center text-small text-ink-500 dark:text-bone-300">
                    Todavía no lanzamos la app. Anotate a la lista y te escribimos el día que salga.
                    {code && " Guardá tu código: te va a servir al registrarte."}
                  </p>
                </>
              )}
            </div>

          </div>

          {/* Bloque de soporte — requisito de Apple (§6.3) */}
          <div className="mt-10">
            <Hairline />
            <div className="mt-6 text-center">
              <p className="text-small text-ink-500 dark:text-bone-300">
                ¿Necesitás ayuda con tu cuenta o la app?
              </p>
              <a
                href={`mailto:${site.email}`}
                className="ring-focus mt-2 inline-flex items-center gap-2 rounded-sm text-small font-semibold text-amber-700 underline decoration-amber-700/30 underline-offset-4 transition-colors hover:decoration-amber-700 dark:text-amber-300 dark:decoration-amber-300/30 dark:hover:decoration-amber-300"
              >
                <Mail className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                Contactar a soporte
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
