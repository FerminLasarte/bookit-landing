import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import TextLink from "@/components/ui/TextLink";
import { faq, preguntas } from "@/content/faq";
import Acordeon from "./Acordeon";

export default function Preguntas() {
  const { lede } = preguntas;

  return (
    <Section
      id="faq"
      title={preguntas.title}
      lede={
        <>
          {lede.antes}
          <TextLink href={lede.contacto.href}>{lede.contacto.label}</TextLink>
          {lede.despues}
        </>
      }
    >
      <Reveal as="div" className="mx-auto max-w-[44rem]">
        <Acordeon
          items={faq.map((item) => ({
            pregunta: item.q,
            respuesta: (
              <>
                <p>{item.a}</p>
                {item.link && (
                  <p className="mt-3 text-small">
                    <TextLink href={item.link.href}>{item.link.label}</TextLink>
                  </p>
                )}
              </>
            ),
          }))}
        />
      </Reveal>
    </Section>
  );
}
