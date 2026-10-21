import type { Metadata } from "next";
import Cartel from "@/components/descargar/Cartel";
import Tira from "@/components/descargar/Tira";
import Abanico from "@/components/ui/Abanico";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import Screen from "@/components/ui/Screen";
import Section from "@/components/ui/Section";
import Superficie from "@/components/ui/Superficie";
import { descargar } from "@/content/paginas";

export const metadata: Metadata = {
  title: "Descargar la app",
  description: descargar.descripcion,
  alternates: { canonical: "/descargar" },
};

export default function DescargarPage() {
  const { porDentro, locales } = descargar;

  return (
    <>
      <Cartel />

      <Section id="por-dentro" title={porDentro.title} lede={porDentro.lede}>
        <Reveal>
          <Superficie tone="niebla" className="h-[26rem] lg:aspect-21/9 lg:h-auto">
            <Tira
              className="h-full"
              etiqueta={porDentro.etiqueta}
              pantallas={porDentro.pantallas.map((id) => (
                <Screen key={id} id={id} sizes="(min-width: 1024px) 14rem, 11rem" />
              ))}
            />
          </Superficie>
        </Reveal>
      </Section>

      <Section
        id="locales"
        title={locales.title}
        lede={locales.lede}
        actions={
          <Button href={locales.cta.href} variant="secondary">
            {locales.cta.label}
          </Button>
        }
      >
        <Reveal className="mx-auto max-w-[66rem]">
          <Superficie tone="niebla" className="h-80 lg:h-[30rem]">
            <Abanico
              className="h-full pt-10 lg:pt-12"
              pantallas={locales.pantallas.map((id) => (
                <Screen key={id} id={id} sizes="(min-width: 1024px) 12rem, 9rem" />
              ))}
            />
          </Superficie>
        </Reveal>
      </Section>
    </>
  );
}
