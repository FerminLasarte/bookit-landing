import type { Metadata } from "next";
import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import Hairline from "@/components/Hairline";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import WaitlistForm from "@/components/WaitlistForm";
import { IconCheck, IconPoints, IconSlot, IconStore } from "@/components/icons";
import { site } from "@/content/site";
import type { Audience } from "@/content/waitlist";

/**
 * §6.2 — La lista VIP tiene página propia.
 *
 * Antes era una sección más de la landing, entre Referidos y las preguntas, y
 * competía con todo lo que tenía alrededor. Acá la página entera hace una sola
 * cosa: explicar qué es la lista, qué te llevás por anotarte y cómo sigue
 * después. El formulario está arriba de todo, al lado del texto, para que
 * nadie tenga que scrollear a buscarlo.
 */

const title = "Tandil, tu forma de sacar turnos está por cambiar";
const description =
  "Anotate en la lista VIP y llevate 500 Puntos Bookit de regalo para tu primer turno. Barberías, uñas, depilación y más, todo en una sola app.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/lista-espera" },
  openGraph: {
    title: `Bookit | ${title}`,
    description,
    url: `${site.url}/lista-espera`,
  },
  twitter: {
    title: `Bookit | ${title}`,
    description:
      "Anotate en la lista VIP y llevate 500 Puntos Bookit de regalo para tu primer turno.",
  },
};

/** Lo que se lleva quien se anota. La cifra es la pieza gráfica de cada card. */
const beneficios = [
  {
    figure: "500",
    Icon: IconPoints,
    title: "Puntos Bookit de regalo",
    body: "Te esperan guardados para canjear en tu primer turno, el día que lancemos la app.",
  },
  {
    figure: "01",
    Icon: IconSlot,
    title: "Te enterás antes que nadie",
    body: `Cuando la app esté disponible en ${site.city}, la lista es la primera en recibir el aviso por email.`,
  },
  {
    figure: "∞",
    Icon: IconStore,
    title: "Precio fundador de por vida",
    body: "Si tenés un local, el precio fundador es para los primeros que se suman antes del lanzamiento.",
  },
] as const;

/** Qué pasa después de apretar el botón. Sin promesas que no podamos cumplir. */
const pasos = [
  {
    n: "01",
    title: "Te anotás",
    body: "Un nombre, un correo y listo. No pedimos tarjeta ni nada por el estilo.",
  },
  {
    n: "02",
    title: "Te llega el correo",
    body: "Confirmamos tus 500 puntos por email en el momento. Revisá spam por las dudas.",
  },
  {
    n: "03",
    title: "Te avisamos del lanzamiento",
    body: "El día que la app esté en App Store y Google Play, sos de los primeros en saberlo.",
  },
] as const;

const garantias = [
  "Anotarte no cuesta nada.",
  "Sólo te escribimos por Bookit, nunca para otra cosa.",
  "Te podés dar de baja cuando quieras, desde cualquier correo que te mandemos.",
] as const;

export default async function ListaEsperaPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  // `?tipo=local` / `?tipo=cliente` preselecciona el público (§6.2).
  const initialAudience: Audience | null =
    tipo === "local" ? "local" : tipo === "cliente" ? "cliente" : null;

  return (
    <>
      {/* ─────────────── 1. Qué es la lista + el formulario ─────────────── */}
      <section className="relative overflow-hidden pt-14 pb-24 md:pt-20 md:pb-32">
        {/* Mismo destello que el hero de la landing, en reposo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 animate-aurora rounded-full bg-[radial-gradient(circle,rgba(215,138,29,0.13)_0%,rgba(215,138,29,0)_68%)]"
        />

        <div className="wrap relative">
          <div className="md:grid md:grid-cols-12 md:gap-12">
            <div className="md:col-span-5">
              <Eyebrow>
                Lista VIP · {site.city}
              </Eyebrow>

              <h1 className="mt-5 text-display-lg font-extrabold text-ink-900 dark:text-bone-100">
                Entrá antes que el resto de {site.city}.
              </h1>

              <p className="measure mt-6 text-ink-500 dark:text-bone-300">
                La lista VIP es el grupo de fundadores de Bookit: las personas y los locales que van
                a usar la app antes que nadie. Anotarte lleva menos de un minuto y te deja{" "}
                <strong className="font-semibold text-ink-900 dark:text-bone-100">
                  <span className="num">500</span> Puntos Bookit
                </strong>{" "}
                esperándote.
              </p>

              <ul className="mt-9 space-y-3.5">
                {garantias.map((garantia) => (
                  <li key={garantia} className="flex items-start gap-3">
                    <IconCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-600 dark:text-amber-300" />
                    <span className="text-small text-ink-500 dark:text-bone-300">{garantia}</span>
                  </li>
                ))}
              </ul>

              <Hairline className="mt-10" />

              <p className="mt-8 max-w-[36ch] text-small text-ink-500 dark:text-bone-300">
                Todavía no lanzamos: estamos terminando la app y arrancamos por {site.city}. Te
                escribimos en cuanto esté lista.
              </p>
            </div>

            <div className="mt-12 md:col-span-7 md:mt-0">
              <WaitlistForm initialAudience={initialAudience} headingAs="p" />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── 2. Qué te llevás ─────────────────── */}
      <Section labelledBy="beneficios-title" tone="tint">
        <Reveal className="max-w-[36rem]">
          <Eyebrow>Beneficios</Eyebrow>
          <h2
            id="beneficios-title"
            className="mt-5 text-display-lg font-semibold text-ink-900 dark:text-bone-100"
          >
            Qué te llevás por anotarte.
          </h2>
        </Reveal>

        {/*
         * Por contenido esto NO es una card: son tres textos con un ícono, se
         * leen, no se toman, y el criterio de `docs/DECISIONES.md` §3 sexies
         * los mandaría a agruparse por aire. La card se queda igual, y por un
         * motivo medido que no es de composición: ESTA SECCIÓN TIENE TINTE.
         *
         * Sobre `cream-100`, el cuerpo en `ink-500` da 4,35:1 y la cifra y el
         * ícono en `amber-600` dan 2,97:1 — los tres fallan. Sobre la card de
         * `paper` vuelven a 4,83:1 y 3,31:1. O sea que acá la card no decora:
         * es lo que sostiene el contraste, y es la segunda cláusula de la
         * regla. En oscuro no haría falta (`bone-300` sobre `ink-850` da
         * 10,14:1); es una restricción del tema claro, como todas las de
         * `cream-100`.
         *
         * Cuando el paso 5 resuelva D2 —que es este mismo token— esto se
         * vuelve a mirar: es el primer caso que se destraba.
         */}
        <ul className="mt-14 grid gap-4 md:grid-cols-3 md:gap-5">
          {beneficios.map((beneficio, index) => (
            <Reveal
              as="li"
              key={beneficio.title}
              index={index}
              className="flex h-full flex-col rounded-card border border-ink-900/10 bg-paper p-7 md:p-8 dark:border-white/10 dark:bg-ink-800"
            >
              <beneficio.Icon className="h-6 w-6 text-amber-600 dark:text-amber-300" />

              {/* La cifra, en la tipografía de números: es la pieza gráfica del ítem.
                  `display-sm` y no el `text-[3.5rem]` que estaba escrito a mano: es
                  el token que la Fase B0 creó justo para este escalón (D8), y queda
                  por debajo del `display-lg` del título de la sección, que es quien
                  manda. Sobre `paper` da 3,31:1, que es lo que pide una cifra a
                  este tamaño. */}
              <p
                aria-hidden="true"
                className="num mt-7 text-display-sm text-amber-600 dark:text-amber-300"
              >
                {beneficio.figure}
              </p>

              <h3 className="mt-5 font-display text-h3 font-semibold text-ink-900 dark:text-bone-100">
                {beneficio.title}
              </h3>
              <p className="mt-3 text-small text-ink-500 dark:text-bone-300">{beneficio.body}</p>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* ─────────────────── 3. Cómo sigue ─────────────────── */}
      <Section labelledBy="pasos-title">
        <div className="md:grid md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <Reveal>
              <Eyebrow>Después de anotarte</Eyebrow>
              <h2
                id="pasos-title"
                className="mt-5 text-display-lg font-semibold text-ink-900 dark:text-bone-100"
              >
                Cómo sigue.
              </h2>
            </Reveal>
          </div>

          <ol className="mt-12 md:col-span-7 md:col-start-6 md:mt-0">
            {pasos.map((paso, index) => (
              <Reveal
                as="li"
                key={paso.n}
                index={index}
                className="flex gap-6 border-t border-ink-900/8 py-7 first:border-t-0 first:pt-0 dark:border-white/8"
              >
                <span
                  aria-hidden="true"
                  className="num shrink-0 text-2xl text-amber-600 dark:text-amber-300"
                >
                  {paso.n}
                </span>
                <div>
                  <h3 className="font-display text-h3 font-semibold text-ink-900 dark:text-bone-100">
                    {paso.title}
                  </h3>
                  <p className="mt-2 max-w-[46ch] text-small text-ink-500 dark:text-bone-300">
                    {paso.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {/* ─────────────────── 4. Letra chica ─────────────────── */}
      <Section labelledBy="datos-title" tone="tint">
        <Reveal className="mx-auto max-w-[52ch] text-center">
          <h2
            id="datos-title"
            className="font-display text-h3 font-semibold text-ink-900 dark:text-bone-100"
          >
            Tus datos, en claro.
          </h2>
          <p className="mt-4 text-small text-ink-500 dark:text-bone-300">
            Guardamos tu nombre, tu correo y —si nos lo dejás— tu WhatsApp, sólo para avisarte del
            lanzamiento y darte tus puntos. Nada de esto se vende ni se comparte. Podés pedir que
            los borremos cuando quieras.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { label: "Política de Privacidad", href: "/legal/privacidad" },
              { label: "Términos y Condiciones", href: "/legal/terminos" },
              { label: "Eliminar mis datos", href: "/legal/eliminar-cuenta" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="ring-focus rounded-sm text-small font-semibold text-amber-700 underline decoration-amber-700/30 underline-offset-4 transition-colors hover:decoration-amber-700 dark:text-amber-300 dark:decoration-amber-300/30 dark:hover:decoration-amber-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </Reveal>
      </Section>
    </>
  );
}
