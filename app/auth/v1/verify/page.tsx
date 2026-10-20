import type { Metadata } from "next";
import AbrirEnLaApp from "@/components/abrir-app/AbrirEnLaApp";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import { verificar } from "@/content/paginas";
import { site } from "@/content/site";

type PageProps = {
  searchParams: Promise<{ token_hash?: string; type?: string; desde?: string }>;
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
 *
 * Una cuenta creada en /planes puede no tener la app: su enlace trae
 * `desde=web` y se confirma acá, con un POST para que el navegador del mail no
 * gaste el token al abrir la página (BooKit, docs/web-en-pesos.md §9).
 */
export default async function VerificarPage({ searchParams }: PageProps) {
  const { token_hash: tokenHash, type, desde } = await searchParams;
  const abrirApp =
    tokenHash && type
      ? `${site.app.bundleId}://login-callback?${new URLSearchParams({ token_hash: tokenHash, type })}`
      : null;

  if (abrirApp && desde === "web") {
    const { web } = verificar;
    return (
      <Section
        id="confirmar"
        as="h1"
        title={web.title}
        lede={web.desc}
        actions={
          <form action="/planes/auth/confirmar" method="post">
            <input type="hidden" name="token_hash" value={tokenHash} />
            <input type="hidden" name="type" value={type} />
            <Button type="submit">{web.cta}</Button>
          </form>
        }
      />
    );
  }

  const { title, desc } = abrirApp ? verificar.conToken : verificar.sinToken;
  return <AbrirEnLaApp title={title} desc={desc} cta={verificar.cta} abrirApp={abrirApp} />;
}
