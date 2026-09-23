import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import { puntos } from "@/content/home";
import Contador from "./Contador";

export default function Puntos() {
  const { referidos } = puntos;

  return (
    <Section id="puntos" title={puntos.title} lede={puntos.lede}>
      {/* El número es fondo; la frase de encima lo dice para quien no lo ve. */}
      <Reveal className="grid place-items-center text-center">
        <Contador
          valor={puntos.cifra}
          className="[grid-area:1/1] text-numeral font-extrabold text-marca-agua select-none"
        />
        <p className="[grid-area:1/1] max-w-[22ch] text-balance text-title font-bold text-fg">
          <span className="sr-only">{puntos.cifra} </span>
          {puntos.regalo}
        </p>
      </Reveal>

      <Reveal className="mt-20 text-center md:mt-28">
        <h3 className="text-title font-bold text-fg">{referidos.title}</h3>
        <p className="mx-auto mt-2 max-w-[38ch] text-pretty text-muted">{referidos.body}</p>

        <p className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-pill border border-line bg-surface px-5 py-3 text-small font-medium break-all text-fg">
            {referidos.link}
            <span className="text-accent-fg">{referidos.codigo}</span>
          </span>
          <Badge>Ejemplo</Badge>
        </p>

        <p className="mx-auto mt-6 max-w-[40ch] text-small text-muted">{referidos.nota}</p>
      </Reveal>

      <Reveal className="mt-14 flex justify-center md:mt-16">
        <Button href={puntos.cta.href}>{puntos.cta.label}</Button>
      </Reveal>
    </Section>
  );
}
