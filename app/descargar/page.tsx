import type { Metadata } from "next";
import BotonesDeDescarga from "@/components/abrir-app/BotonesDeDescarga";
import Reveal from "@/components/ui/Reveal";
import Screen from "@/components/ui/Screen";
import Section from "@/components/ui/Section";
import Tile from "@/components/ui/Tile";
import { descargar } from "@/content/paginas";
import { flags } from "@/content/site";

export const metadata: Metadata = {
  title: "Descargar la app",
  description:
    "Bookit está por lanzar en Tandil. Anotate a la lista VIP y te avisamos el día que la app esté disponible en App Store y Google Play.",
  alternates: { canonical: "/descargar" },
};

export default function DescargarPage() {
  const { conTiendas, preLanzamiento } = descargar;
  const { title, lede } = flags.storeLinksLive ? conTiendas : preLanzamiento;

  return (
    <Section id="descargar" as="h1" title={title} lede={lede} actions={<BotonesDeDescarga />}>
      <Reveal className="mx-auto max-w-[36rem]">
        <Tile bleed tone="arena">
          <Screen id="bienvenida" sizes="(min-width: 768px) 17.5rem, 55vw" className="w-[55%] max-w-70" />
        </Tile>
      </Reveal>
    </Section>
  );
}
