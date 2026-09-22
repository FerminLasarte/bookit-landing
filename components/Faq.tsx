import Link from "next/link";
import { Plus } from "lucide-react";
import { faq } from "@/content/faq";

/**
 * Acordeón con `<details>` nativo: accesible por teclado y sin JS. Eso no se
 * toca — es lo que la auditoría cuenta entre los bloques que trabajan.
 *
 * EL `+` VA EN TINTA, NO EN ÁMBAR. Es la misma cuenta que la §3 octies le hizo
 * a los rótulos de sección: eran catorce ámbares y "un acento que aparece
 * catorce veces no es un acento". Acá son ocho, apilados en una sola columna,
 * en una sección cuyo único acento legítimo es el link de la última respuesta
 * —`amber-700` sobre la página pelada, 4,75:1, que es el uso que `MARCA.md` le
 * dejó a `marcaTexto` cuando le sacó los rótulos—. Con el `+` en tinta la
 * sección queda con un solo ámbar, que es lo que el manual pide por pieza.
 *
 * Y no se pierde nada: el color nunca era el portador del estado. Lo que dice
 * abierto o cerrado es la rotación a `×`, que es forma y no color — que es
 * justamente la regla "el color nunca es el único portador de un dato".
 *
 * `ink-500` sobre `cream-50` da 4,71:1 y `bone-300` sobre `ink-950` 11,20:1;
 * un ícono pide 3:1. Es el mismo par con el que `HowItWorks` pinta sus
 * ordinales, o sea la tinta secundaria del sitio: la pregunta manda en
 * `ink-900` y la marca de estado la acompaña.
 *
 * EL RADIO DEL `summary` EXISTE SÓLO PARA EL ANILLO DE FOCO. La fila no tiene
 * relleno ni borde propios —los filetes son del `<li>`—, así que el radio no se
 * ve nunca salvo cuando `ring-focus` dibuja sus dos anillos, que toman la forma
 * del elemento. Sin él el anillo salía en 628 × 76 px con las esquinas a 0, o
 * sea la única esquina viva de todo el sitio: el D5 cerró en cuatro radios más
 * `rounded-full`, y el 0 no es ninguno de los cuatro. Va `rounded-card` porque
 * el radio nombra un tamaño y no un rol (§3 sexies) y esto es una pieza grande,
 * no una palabra: la píldora que `MARCA.md` fija para el foco sobre texto es
 * para un link en línea.
 */
export default function Faq() {
  return (
    <ul className="border-t border-ink-900/10 dark:border-white/10">
      {faq.map((item) => (
        <li key={item.q} className="border-b border-ink-900/10 dark:border-white/10">
          <details className="group">
            <summary className="ring-focus flex cursor-pointer list-none items-start justify-between gap-6 rounded-card py-6 text-left [&::-webkit-details-marker]:hidden">
              <h3 className="text-h3 font-semibold text-ink-900 dark:text-bone-100">{item.q}</h3>
              <Plus
                className="mt-1 h-5 w-5 shrink-0 text-ink-500 transition-transform duration-150 group-open:rotate-45 dark:text-bone-300"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </summary>
            <div className="measure pb-7 text-ink-500 dark:text-bone-300">
              <p>{item.a}</p>
              {item.link && (
                <Link
                  href={item.link.href}
                  className="ring-focus mt-3 inline-block rounded-pill text-small font-semibold text-amber-700 underline decoration-amber-700/30 underline-offset-4 transition-colors hover:decoration-amber-700 dark:text-amber-300 dark:decoration-amber-300/30 dark:hover:decoration-amber-300"
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
