import Link from "next/link";
import { Plus } from "lucide-react";
import { faq } from "@/content/faq";

/**
 * Acordeón con `<details>` nativo: accesible por teclado y sin JS.
 * El `+` rota a `×` cuando el item está abierto.
 */
export default function Faq() {
  return (
    <ul className="border-t border-ink-900/8 dark:border-white/8">
      {faq.map((item) => (
        <li key={item.q} className="border-b border-ink-900/8 dark:border-white/8">
          <details className="group">
            <summary className="ring-focus flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
              <h3 className="text-h3 font-semibold text-ink-900 dark:text-bone-100">{item.q}</h3>
              <Plus
                className="mt-1 h-5 w-5 shrink-0 text-amber-700 transition-transform duration-150 group-open:rotate-45 dark:text-amber-300"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </summary>
            <div className="measure pb-7 text-ink-500 dark:text-bone-300">
              <p>{item.a}</p>
              {item.link && (
                <Link
                  href={item.link.href}
                  className="ring-focus mt-3 inline-block rounded-sm text-small font-semibold text-amber-700 underline decoration-amber-700/30 underline-offset-4 transition-colors hover:decoration-amber-700 dark:text-amber-300 dark:decoration-amber-300/30 dark:hover:decoration-amber-300"
                >
                  {item.link.label}
                </Link>
              )}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
