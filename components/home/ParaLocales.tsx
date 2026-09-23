import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import Screen from "@/components/ui/Screen";
import Section from "@/components/ui/Section";
import { paraLocales } from "@/content/home";
import SelectorPantallas from "./SelectorPantallas";

export default function ParaLocales() {
  return (
    <Section id="locales" title={paraLocales.title} lede={paraLocales.lede}>
      <Reveal>
        <SelectorPantallas
          items={paraLocales.pantallas}
          pantallas={paraLocales.pantallas.map((pantalla) => (
            <Screen
              key={pantalla.captura}
              id={pantalla.captura}
              crop={pantalla.crop}
              sizes="(min-width: 768px) 20rem, 55vw"
            />
          ))}
        />
      </Reveal>

      <Reveal className="mt-16 flex flex-col items-center gap-5 text-center md:mt-20">
        <p className="max-w-[40ch] text-pretty text-muted">{paraLocales.fundador}</p>
        <Button href={paraLocales.cta.href} variant="secondary">
          {paraLocales.cta.label}
        </Button>
      </Reveal>
    </Section>
  );
}
