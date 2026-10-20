import type { Metadata } from "next";
import BotonesDeDescarga from "@/components/abrir-app/BotonesDeDescarga";
import DesdeLaCompu from "@/components/descargar/DesdeLaCompu";
import Reveal from "@/components/ui/Reveal";
import Screen from "@/components/ui/Screen";
import Section from "@/components/ui/Section";
import TextLink from "@/components/ui/TextLink";
import Tile from "@/components/ui/Tile";
import { descargar } from "@/content/paginas";
import { flags, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Descargar la app",
  description: descargar.descripcion,
  alternates: { canonical: "/descargar" },
};

export default function DescargarPage() {
  const { conTiendas, preLanzamiento, enLaApp, local } = descargar;
  const { title, lede } = flags.storeLinksLive ? conTiendas : preLanzamiento;

  const tiendas = (
    <div className="flex flex-col items-center gap-4">
      <BotonesDeDescarga />
      {flags.storeLinksLive && !site.app.playStore && (
        <p className="text-small text-muted">{conTiendas.androidPronto}</p>
      )}
    </div>
  );

  return (
    <>
      <Section id="descargar" as="h1" title={title} lede={lede} actions={tiendas}>
        <Reveal className="mx-auto max-w-[44rem]">
          <Tile bleed tone="arena">
            <Screen id="inicio" eager sizes="(min-width: 768px) 20rem, 55vw" className="w-[55%] max-w-80" />
          </Tile>
        </Reveal>
      </Section>

      <Section id="en-la-app" title={enLaApp.title} lede={enLaApp.lede}>
        <ul className="grid gap-14 md:grid-cols-3 md:gap-6">
          {enLaApp.items.map((item, i) => (
            <Reveal as="li" key={item.captura} index={i}>
              <Tile bleed tone="niebla" title={item.title} body={item.body}>
                <Screen
                  id={item.captura}
                  crop={"crop" in item ? item.crop : undefined}
                  sizes="(min-width: 768px) 14rem, 60vw"
                  className="w-[62%] max-w-72"
                />
              </Tile>
            </Reveal>
          ))}
        </ul>
      </Section>

      <div className="wrap flex flex-col items-center gap-16 pb-24 md:pb-36">
        {flags.storeLinksLive && (
          <Reveal className="hidden md:block">
            <DesdeLaCompu />
          </Reveal>
        )}
        <p className="text-center text-pretty text-muted">
          {local.pregunta} <TextLink href={local.link.href}>{local.link.label}</TextLink>
        </p>
      </div>
    </>
  );
}
