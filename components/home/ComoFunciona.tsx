import Reveal from "@/components/ui/Reveal";
import Screen from "@/components/ui/Screen";
import Section from "@/components/ui/Section";
import { type Tono } from "@/components/ui/Superficie";
import Tile from "@/components/ui/Tile";
import { comoFunciona } from "@/content/home";

const TONOS: readonly Tono[] = ["arena", "niebla", "miel"];

export default function ComoFunciona() {
  return (
    <Section id="como-funciona" title={comoFunciona.title} lede={comoFunciona.lede}>
      {/* Dos arriba y el tercero centrado debajo, del mismo ancho. */}
      <ol className="mx-auto grid max-w-[66rem] gap-x-8 gap-y-16 md:grid-cols-2">
        {comoFunciona.pasos.map((paso, i) => (
          <Reveal
            as="li"
            key={paso.title}
            index={i}
            className="md:last:col-span-2 md:last:mx-auto md:last:w-[calc(50%-1rem)]"
          >
            <Tile
              bleed
              tone={TONOS[i % TONOS.length]}
              title={
                <>
                  <span className="num font-mono text-small font-normal text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {paso.title}
                </>
              }
              body={paso.body}
            >
              <Screen
                id={paso.captura}
                crop={paso.crop}
                sizes="(min-width: 768px) 17.5rem, 55vw"
                className="w-[55%] max-w-70"
              />
            </Tile>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
