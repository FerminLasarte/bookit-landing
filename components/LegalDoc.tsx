import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Eyebrow from "./Eyebrow";
import Hairline from "./Hairline";
import { legalUpdatedAt } from "@/content/site";
import type { LegalBlock, LegalDoc as Doc } from "@/content/legal";

const proseLink =
  "ring-focus inline-flex items-start gap-1 rounded-sm font-semibold text-amber-700 underline decoration-amber-700/30 underline-offset-4 transition-colors hover:decoration-amber-700 dark:text-amber-300 dark:decoration-amber-300/30 dark:hover:decoration-amber-300";

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p className="mt-4 text-ink-500 dark:text-bone-300">
          {block.text}
          {block.link && (
            <>
              {" "}
              {block.link.href.startsWith("http") ? (
                <a
                  href={block.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={proseLink}
                >
                  {block.link.label}
                  <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                </a>
              ) : (
                <Link href={block.link.href} className={proseLink}>
                  {block.link.label}
                </Link>
              )}
            </>
          )}
        </p>
      );

    case "ul":
      return (
        <ul className="mt-4 space-y-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 text-ink-500 dark:text-bone-300">
              <span aria-hidden="true" className="mt-2.5 h-1 w-3 shrink-0 bg-amber-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol className="mt-4 space-y-2.5">
          {block.items.map((item, index) => (
            <li key={item} className="flex gap-3 text-ink-500 dark:text-bone-300">
              <span
                aria-hidden="true"
                className="mt-0.5 shrink-0 font-mono text-small tabular-nums text-amber-700 dark:text-amber-300"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );

    case "note":
      return (
        <p className="mt-5 border-l-2 border-amber-500 bg-amber-50 py-3 pl-4 text-small text-ink-500 dark:bg-amber-500/8 dark:text-bone-300">
          {block.text}
        </p>
      );
  }
}

export default function LegalDoc({ doc }: { doc: Doc }) {
  return (
    <div className="md:grid md:grid-cols-12 md:gap-10">
      {/* Índice lateral sticky en desktop (§8) */}
      <nav aria-label="Índice del documento" className="hidden md:col-span-3 md:block">
        <div className="sticky top-28">
          <Eyebrow variant="label">En esta página</Eyebrow>
          <ol className="mt-5 space-y-2.5">
            {doc.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="ring-focus rounded-sm text-small text-ink-500 transition-colors duration-150 hover:text-ink-900 dark:text-bone-300 dark:hover:text-bone-100"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <article className="md:col-span-8 md:col-start-5">
        <header>
          <Eyebrow>Legales</Eyebrow>
          <h1 className="mt-6 text-display-lg font-semibold text-ink-900 dark:text-bone-100">
            {doc.title}
          </h1>
          <p className="mt-5 max-w-[65ch] text-ink-500 dark:text-bone-300">{doc.intro}</p>
          <p className="mt-6 font-mono text-xs text-ink-500 dark:text-bone-300">
            Última actualización: {legalUpdatedAt}
          </p>
        </header>

        <div className="mt-12 max-w-[65ch]">
          {doc.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-heading`}
              className="mt-12 first:mt-0"
            >
              <Hairline className="mb-6" />
              <h2
                id={`${section.id}-heading`}
                className="text-h3 font-semibold text-ink-900 dark:text-bone-100"
              >
                {section.heading}
              </h2>
              {section.blocks.map((block, index) => (
                <Block key={index} block={block} />
              ))}
            </section>
          ))}
        </div>

        <p className="mt-16 max-w-[65ch] text-small text-ink-500 dark:text-bone-300">
          ¿Alguna duda con esto?{" "}
          <Link href="/soporte" className={proseLink}>
            Escribinos
          </Link>
        </p>
      </article>
    </div>
  );
}
