import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, Download } from "lucide-react";
import AnimatedButton from "@/components/AnimatedButton";
import Audiences from "@/components/Audiences";
import Eyebrow from "@/components/Eyebrow";
import Faq from "@/components/Faq";
import HeroGlow from "@/components/HeroGlow";
import HowItWorks from "@/components/HowItWorks";
import Reveal from "@/components/Reveal";
import Rewards from "@/components/Rewards";
import Section from "@/components/Section";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      {/* ───────────────────────── 1. Hero ───────────────────────── */}
      {/*
       * El hero NO usa `Reveal`: está sobre el pliegue, así que no hay scroll que
       * revelar, y arrancarlo en `opacity: 0` retrasaba el LCP hasta la hidratación.
       *
       * Ocupa la pantalla entera menos el nav (`h-18` = 4.5rem). `svh` y no `dvh`:
       * en mobile, con `dvh` el hero cambia de alto cuando la barra del navegador
       * se esconde al scrollear, y el texto salta.
       */}
      <section className="relative flex min-h-[calc(100svh-4.5rem)] flex-col justify-center overflow-hidden py-20">
        {/* El único destello ámbar de la página. Sigue al puntero (§ver HeroGlow) */}
        <HeroGlow />

        <div className="wrap relative w-full">
          <div className="md:grid md:grid-cols-12 md:gap-8">
            <div className="md:col-span-9">
              <Eyebrow>Tandil · Próximo lanzamiento</Eyebrow>

              <h1 className="mt-5 text-display-xl font-extrabold text-ink-900 dark:text-bone-100">
                Tu próximo turno, a un clic de distancia.
              </h1>

              <p className="measure mt-7 text-ink-500 dark:text-bone-300">
                Barberías, peluquerías, uñas, depilación y estética de Tandil en una sola app.
                Reservá cuando se te ocurra, sin cadenas de WhatsApp ni llamados en horario de
                trabajo.
              </p>

              <div className="mt-10">
                <AnimatedButton
                  text="Descargar la app"
                  href="/descargar"
                  variant="primary"
                  size="lg"
                  icon={<Download className="h-4.5 w-4.5" strokeWidth={2} aria-hidden="true" />}
                />
              </div>

              {/*
               * Mientras no haya links de tienda, el botón lleva a /descargar, que
               * lo explica. Esta línea lo adelanta para que nadie llegue esperando
               * un link que todavía no existe.
               */}
              <p className="mt-7 text-small text-ink-500 dark:text-bone-300">
                Todavía no lanzamos.{" "}
                <Link
                  href="/lista-espera"
                  className="ring-focus rounded-sm font-semibold text-amber-700 underline decoration-amber-700/30 underline-offset-4 transition-colors hover:decoration-amber-700 dark:text-amber-300 dark:decoration-amber-300/30 dark:hover:decoration-amber-300"
                >
                  Sumate a la lista VIP
                </Link>{" "}
                y llevate <span className="num">500</span> Puntos Bookit para tu primer turno.
              </p>
            </div>
          </div>
        </div>

        {/* Pista de scroll: dice que abajo sigue algo, sin gritarlo */}
        <Link
          href="#como-funciona"
          className="ring-focus absolute inset-x-0 bottom-8 mx-auto hidden w-fit items-center gap-2 rounded-pill px-3 py-2 text-xs font-semibold text-ink-500 transition-colors duration-150 hover:text-ink-900 md:flex dark:text-bone-300 dark:hover:text-bone-100"
        >
          Cómo funciona
          <ArrowDown className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        </Link>
      </section>

      {/* ───────────────────── 2. Cómo funciona ───────────────────── */}
      <Section id="como-funciona" labelledBy="como-funciona-title">
        <HowItWorks />
      </Section>

      {/* ──────────── 3. Los dos públicos, en una sola pieza ──────────── */}
      <Section
        id="publico"
        labelledBy="publico-title"
        className="bg-cream-100 dark:bg-ink-800/40"
      >
        <Audiences />
      </Section>

      {/* ───────────── 4. Puntos + Referidos (corte visual) ───────────── */}
      <Rewards />

      {/* ────────────────────────── 5. FAQ ────────────────────────── */}
      <Section id="faq" labelledBy="faq-title">
        <div className="md:grid md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <Reveal>
              <Eyebrow>Preguntas</Eyebrow>
              <h2
                id="faq-title"
                className="mt-5 text-display-lg font-semibold text-ink-900 dark:text-bone-100"
              >
                Lo que suelen preguntarnos.
              </h2>
            </Reveal>
          </div>
          <Reveal index={1} className="mt-10 md:col-span-7 md:col-start-6 md:mt-0">
            <Faq />
          </Reveal>
        </div>
      </Section>

      {/* ──────────────── 6. Cierre — la sección de respiro ──────────────── */}
      <Section
        rhythm="breath"
        labelledBy="cierre-title"
        className="bg-cream-100 dark:bg-ink-800/40"
      >
        <Reveal className="mx-auto max-w-[46ch] text-center">
          <h2
            id="cierre-title"
            className="text-display-lg font-semibold text-ink-900 dark:text-bone-100"
          >
            Tandil, tu forma de sacar turnos está a punto de cambiar.
          </h2>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <AnimatedButton
              text="Descargar la app"
              href="/descargar"
              variant="primary"
              size="lg"
              icon={<Download className="h-4.5 w-4.5" strokeWidth={2} aria-hidden="true" />}
            />
            <AnimatedButton
              text="Sumate a la lista VIP"
              href="/lista-espera"
              variant="quiet"
              size="lg"
            />
          </div>
        </Reveal>
      </Section>
    </>
  );
}
