import { Plus } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import TextLink from "@/components/ui/TextLink";
import { faq, preguntas } from "@/content/faq";

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
        <ul className="border-t border-line">
          {faq.map((item) => (
            <li key={item.q} className="border-b border-line">
              {/* Con el mismo `name`, abrir una cierra la anterior. */}
              <details name="preguntas" className="acordeon group">
                <summary className="ring-focus flex list-none items-start justify-between gap-6 rounded-card py-6 text-left [&::-webkit-details-marker]:hidden">
                  <h3 className="text-title font-semibold text-fg">{item.q}</h3>
                  <Plus
                    className="mt-1 size-5 shrink-0 text-muted transition-transform duration-(--duration-chico) group-open:rotate-45"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </summary>
                <div className="pr-11 pb-7 text-pretty text-muted">
                  <p>{item.a}</p>
                  {item.link && (
                    <p className="mt-3 text-small">
                      <TextLink href={item.link.href}>{item.link.label}</TextLink>
                    </p>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
