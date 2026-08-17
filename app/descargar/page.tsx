import type { Metadata } from "next";
import AnimatedButton from "@/components/AnimatedButton";
import Eyebrow from "@/components/Eyebrow";
import Hairline from "@/components/Hairline";
import { categorias } from "@/content/categorias";
import { flags, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Descargar la app",
  description:
    "Bookit está por lanzar en Tandil. Anotate a la lista VIP y te avisamos el día que la app esté disponible en App Store y Google Play.",
  alternates: { canonical: "/descargar" },
};

export default function DescargarPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="wrap">
        <div className="max-w-[46rem]">
          <Eyebrow>Descargar</Eyebrow>

          {flags.storeLinksLive ? (
            <>
              <h1 className="mt-6 text-display-lg font-semibold text-ink-900 dark:text-bone-100">
                Bajate Bookit.
              </h1>
              <p className="measure mt-6 text-ink-500 dark:text-bone-300">
                Disponible para iPhone y Android.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                {site.app.appStore && (
                  <AnimatedButton
                    text="Descargar para iPhone"
                    href={site.app.appStore}
                    variant="primary"
                    size="lg"
                  />
                )}
                {site.app.playStore && (
                  <AnimatedButton
                    text="Descargar para Android"
                    href={site.app.playStore}
                    variant="ink"
                    size="lg"
                  />
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-6 text-display-lg font-semibold text-ink-900 dark:text-bone-100">
                Todavía no se puede descargar.
              </h1>
              <p className="measure mt-6 text-ink-500 dark:text-bone-300">
                Estamos terminando la app y arrancamos por {site.city}. Cuando esté en App Store y
                Google Play, los links van a estar acá. Mientras tanto, anotate a la lista y te
                avisamos antes que a nadie.
              </p>
              <div className="mt-10">
                <AnimatedButton
                  text="Sumate a la lista VIP"
                  href="/lista-espera"
                  variant="primary"
                  size="lg"
                />
              </div>
            </>
          )}

          <Hairline className="mt-16" />

          <div className="mt-8">
            <Eyebrow variant="label">Rubros</Eyebrow>
            <ul className="mt-3 flex flex-wrap gap-2">
              {categorias.map((categoria) => (
                <li
                  key={categoria.value}
                  className="rounded-pill border border-ink-900/12 px-3.5 py-1.5 text-small text-ink-900 dark:border-white/12 dark:text-bone-100"
                >
                  {categoria.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
