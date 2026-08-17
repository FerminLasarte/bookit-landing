import type { Metadata } from "next";
import AnimatedButton from "@/components/AnimatedButton";
import Eyebrow from "@/components/Eyebrow";
import Faq from "@/components/Faq";
import Hairline from "@/components/Hairline";
import HeroGlow from "@/components/HeroGlow";
import HowItWorks from "@/components/HowItWorks";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import WaitlistForm from "@/components/WaitlistForm";
import { IconCheck, IconPoints, IconReferral } from "@/components/icons";
import { featuresCliente, featuresLocal } from "@/content/features";
import { site } from "@/content/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Bullet de las listas de beneficios: check ámbar, decorativo. */
function Bullet({ onDark = false }: { onDark?: boolean }) {
  return (
    <IconCheck
      className={
        onDark
          ? "mt-1 h-4.5 w-4.5 shrink-0 text-amber-300"
          : "mt-1 h-4.5 w-4.5 shrink-0 text-amber-600 dark:text-amber-300"
      }
    />
  );
}

export default function Home() {
  return (
    <>
      {/* ───────────────────────── 1. Hero ───────────────────────── */}
      {/*
       * El hero NO usa `Reveal`: está sobre el pliegue, así que no hay scroll que
       * revelar, y arrancarlo en `opacity: 0` retrasaba el LCP hasta la hidratación.
       */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
        {/* El único destello ámbar de la página. Sigue al puntero (§ver HeroGlow) */}
        <HeroGlow />

        <div className="wrap relative">
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

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <AnimatedButton
                  text="Sumate a la lista VIP"
                  href="/lista-espera"
                  variant="primary"
                  size="lg"
                />
                <AnimatedButton text="Tengo un local" href="#locales" variant="quiet" size="lg" />
              </div>

              <p className="mt-7 text-small text-ink-500 dark:text-bone-300">
                Anotate ahora y llevate 500 Puntos Bookit para tu primer turno.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── 2. Cómo funciona ───────────────────── */}
      <Section id="como-funciona" labelledBy="como-funciona-title">
        <HowItWorks />
      </Section>

      {/* ───────────── 3. Para vos, que sacás turnos ───────────── */}
      <Section id="clientes" labelledBy="clientes-title" className="bg-cream-100 dark:bg-ink-800">
        <div className="md:grid md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Reveal>
              <Eyebrow>Para quien saca turnos</Eyebrow>
              <h2
                id="clientes-title"
                className="mt-5 text-display-lg font-semibold text-ink-900 dark:text-bone-100"
              >
                Sacar turno debería llevar 30 segundos.
              </h2>
            </Reveal>
          </div>

          <ul className="mt-12 space-y-5 md:col-span-6 md:col-start-7 md:mt-2">
            {featuresCliente.map((feature, index) => (
              <Reveal as="li" key={feature} index={index} className="flex items-start gap-3.5">
                <Bullet />
                <span className="text-ink-900 dark:text-bone-100">{feature}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      {/* ───────────────── 4. Para tu local (corte visual) ───────────────── */}
      <section id="locales" aria-labelledby="locales-title" className="bg-ink-900 py-24 md:py-36">
        <div className="wrap">
          <div className="md:grid md:grid-cols-12 md:gap-8">
            <div className="md:col-span-5">
              <Reveal>
                <Eyebrow onDark>Para comercios</Eyebrow>
                <h2
                  id="locales-title"
                  className="mt-5 text-display-lg font-semibold text-bone-100"
                >
                  Tu agenda, sin idas y vueltas.
                </h2>
              </Reveal>

              <Reveal index={1}>
                <div className="mt-10 rounded-card border border-white/10 bg-white/4 p-6">
                  <h3 className="text-h3 font-semibold text-amber-300">
                    Precio fundador de por vida.
                  </h3>
                  <p className="mt-3 text-small text-bone-300">
                    Cupos limitados para los primeros locales que se suman antes del lanzamiento en
                    Tandil. Te contactamos por WhatsApp o email con los detalles.
                  </p>
                </div>
              </Reveal>

              <Reveal index={2} className="mt-8">
                <AnimatedButton
                  text="Quiero mi lugar como fundador"
                  href="/lista-espera?tipo=local"
                  variant="glass"
                  size="lg"
                />
              </Reveal>
            </div>

            <ul className="mt-14 space-y-5 md:col-span-6 md:col-start-7 md:mt-2">
              {featuresLocal.map((feature, index) => (
                <Reveal as="li" key={feature} index={index} className="flex items-start gap-3.5">
                  <Bullet onDark />
                  <span className="text-bone-100">{feature}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─────────────────── 5. Puntos Bookit ─────────────────── */}
      <Section id="puntos" labelledBy="puntos-title">
        <div className="md:grid md:grid-cols-12 md:gap-8">
          <div className="md:col-span-6">
            <Reveal>
              <IconPoints className="h-8 w-8 text-amber-600 dark:text-amber-300" />
              <Eyebrow className="mt-6">Puntos Bookit</Eyebrow>
              <h2
                id="puntos-title"
                className="mt-5 text-display-lg font-semibold text-ink-900 dark:text-bone-100"
              >
                Los turnos que ya te hacías, ahora te devuelven algo.
              </h2>
              <p className="measure mt-6 text-ink-500 dark:text-bone-300">
                Cada turno que reservás por Bookit te deja puntos. Se acumulan solos y los canjeás
                en los turnos que vienen, en cualquier local de la app.
              </p>
            </Reveal>
          </div>

          {/* La cifra como pieza gráfica (§6.1.6) */}
          <Reveal index={1} className="mt-12 md:col-span-5 md:col-start-8 md:mt-0">
            <div className="flex items-baseline gap-4">
              {/* amber-600 y no amber-500: la cifra es contenido, y el ámbar de
                  marca sobre papel da 2,65:1 (por debajo del 3:1 de texto grande). */}
              <span className="font-display text-display-xl font-extrabold tabular-nums text-amber-600 dark:text-amber-300">
                500
              </span>
              <span className="text-small font-semibold text-ink-500 dark:text-bone-300">
                puntos
              </span>
            </div>
            <Hairline className="mt-6" />
            <p className="measure mt-6 text-ink-500 dark:text-bone-300">
              De regalo por anotarte a la lista, guardados para tu primer turno.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* ──────────────── 6. Invitá y ganen los dos ──────────────── */}
      <Section
        id="referidos"
        labelledBy="referidos-title"
        className="bg-cream-100 dark:bg-ink-800"
      >
        <div className="md:grid md:grid-cols-12 md:gap-8">
          <div className="md:col-span-6">
            <Reveal>
              <IconReferral className="h-8 w-8 text-amber-600 dark:text-amber-300" />
              <Eyebrow className="mt-6">Referidos</Eyebrow>
              <h2
                id="referidos-title"
                className="mt-5 text-display-lg font-semibold text-ink-900 dark:text-bone-100"
              >
                Invitá y ganen los dos.
              </h2>
              <p className="measure mt-6 text-ink-500 dark:text-bone-300">
                Cada persona en Bookit tiene su código. Compartilo, y cuando alguien se registra con
                él, ganan los dos.
              </p>
            </Reveal>
          </div>

          <Reveal index={1} className="mt-12 md:col-span-5 md:col-start-8 md:mt-0">
            <div className="rounded-card border border-ink-900/8 bg-paper p-6 shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:border-white/8 dark:bg-ink-900">
              <Eyebrow variant="label">Tu link se ve así</Eyebrow>
              <p className="mt-3 font-mono text-small break-all text-ink-900 dark:text-bone-100">
                somosbookit.com.ar/invite/
                <span className="text-amber-700 dark:text-amber-300">TUCODIGO</span>
              </p>
              <p className="mt-5 text-small text-ink-500 dark:text-bone-300">
                Si la persona ya tiene la app instalada, el link la abre directo. Si no, ve tu código
                en la web y lo usa al registrarse.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ─────────────────── 7. Lista de espera ─────────────────── */}
      <Section id="lista" labelledBy="lista-title">
        <div className="md:grid md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <Reveal>
              <Eyebrow>Lista VIP</Eyebrow>
              <h2
                id="lista-title"
                className="mt-5 text-display-lg font-semibold text-ink-900 dark:text-bone-100"
              >
                Anotate antes del lanzamiento.
              </h2>
              <p className="measure mt-6 text-ink-500 dark:text-bone-300">
                Estamos armando la lista de fundadores en {site.city}. Elegí cómo vas a usar Bookit
                y te avisamos antes que a nadie.
              </p>
              <ul className="mt-8 space-y-3">
                {["Sin costo", "Te avisamos por email", "Podés darte de baja cuando quieras"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-3 text-small">
                      <IconCheck className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
                      <span className="text-ink-500 dark:text-bone-300">{item}</span>
                    </li>
                  ),
                )}
              </ul>
            </Reveal>
          </div>

          <Reveal index={1} className="mt-10 md:col-span-7 md:col-start-6 md:mt-0">
            <WaitlistForm headingAs="p" />
          </Reveal>
        </div>
      </Section>

      {/* ────────────────────────── 8. FAQ ────────────────────────── */}
      <Section id="faq" labelledBy="faq-title" className="bg-cream-100 dark:bg-ink-800">
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

      {/* ──────────────── 9. Cierre — la sección de respiro ──────────────── */}
      <Section rhythm="breath" labelledBy="cierre-title">
        <Reveal className="mx-auto max-w-[46ch] text-center">
          <h2
            id="cierre-title"
            className="text-display-lg font-semibold text-ink-900 dark:text-bone-100"
          >
            Tandil, tu forma de sacar turnos está a punto de cambiar.
          </h2>
          <div className="mt-10 flex justify-center">
            <AnimatedButton
              text="Sumate a la lista VIP"
              href="/lista-espera"
              variant="primary"
              size="lg"
            />
          </div>
        </Reveal>
      </Section>
    </>
  );
}
