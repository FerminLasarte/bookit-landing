import Section from "@/components/ui/Section";
import TextLink from "@/components/ui/TextLink";
import { legalUpdatedAt } from "@/content/site";
import type { LegalBlock, LegalDoc as Doc } from "@/content/legal";

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p className="mt-4 text-pretty text-muted">
          {block.text}
          {block.link && (
            <>
              {" "}
              <TextLink href={block.link.href}>{block.link.label}</TextLink>
            </>
          )}
        </p>
      );

    case "ul":
      return (
        <ul className="mt-4 space-y-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 text-muted">
              <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-pill bg-muted" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol className="mt-4 space-y-2.5">
          {block.items.map((item, index) => (
            <li key={item} className="flex gap-3 text-muted">
              <span aria-hidden="true" className="num mt-0.5 shrink-0 text-small font-semibold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );

    // Un aviso: lo que falta todavía. El filete lo marca; el texto va en tinta plena.
    case "note":
      return <p className="mt-5 border-l-2 border-accent py-1 pl-4 text-small text-fg">{block.text}</p>;
  }
}

export default function LegalDoc({ doc }: { doc: Doc }) {
  return (
    <Section
      id="documento"
      as="h1"
      title={doc.title}
      lede={
        <>
          {doc.intro}
          <span className="mt-4 block text-small">Última actualización: {legalUpdatedAt}</span>
        </>
      }
    >
      <div className="mx-auto max-w-[65ch] lg:grid lg:max-w-[56rem] lg:grid-cols-[12rem_1fr] lg:gap-16">
        {/* En móvil no hay índice: el documento se lee de corrido. */}
        <nav aria-labelledby="indice" className="hidden lg:block">
          <div className="sticky top-28">
            <p id="indice" className="text-small font-semibold text-fg">
              En esta página
            </p>
            <ol className="mt-4 space-y-2.5 text-small">
              {doc.sections.map((section) => (
                <li key={section.id}>
                  <TextLink href={`#${section.id}`} tone="quiet">
                    {section.heading}
                  </TextLink>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <article className="max-w-[65ch] break-words">
          {doc.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-titulo`}
              className="mt-14 first:mt-0"
            >
              <h2 id={`${section.id}-titulo`} className="text-title font-bold text-fg">
                {section.heading}
              </h2>
              {section.blocks.map((block, index) => (
                <Block key={index} block={block} />
              ))}
            </section>
          ))}

          <p className="mt-16 text-small text-muted">
            ¿Alguna duda con esto? <TextLink href="/soporte">Escribinos</TextLink>
          </p>
        </article>
      </div>
    </Section>
  );
}
