import type { Metadata } from "next";
import Button from "@/components/Button";
import Audiences from "@/components/Audiences";
import Eyebrow from "@/components/Eyebrow";
import Faq from "@/components/Faq";
import Hairline from "@/components/Hairline";
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
       * Dejó de ir a sangre y por debajo del header. Ahora es un lienzo con
       * esquinas, apoyado dentro del `wrap`, y el nav se apoya en la página.
       * El motivo no es estético: con el hero metido debajo de un header
       * transparente, en reposo el nav quedaba sobre negro y al scrollear
       * cruzaba un degradé donde el fondo es gris medio y NINGÚN color de texto
       * llega a 4,5:1. De ahí salía la banda crema opaca que había que dibujar.
       * Apoyado, el header está siempre sobre la página. Ver `components/Nav.tsx`.
       *
       * El lienzo arranca en el borde de contenido del `wrap`, que es exactamente
       * donde arranca el lockup del nav. No es casualidad y hay que conservarlo:
       * es lo que garantiza que, cuando el hero pasa por detrás del header, el
       * lockup tenga negro pleno debajo y no medio borde.
       *
       * `svh` y no `dvh`: en mobile, con `dvh` el hero cambia de alto cuando la
       * barra del navegador se esconde al scrollear, y el texto salta.
       */}
      {/*
        Los `@media (max-height)` no son cosmética: a 1280x700 —un portátil
        cualquiera— el contenido del hero no entraba antes de llegar al CTA, así
        que el botón quedaba cortado bajo el pliegue. Con el contenido más alto
        que el viewport, `justify-center` ya no centra nada y lo único que mueve
        el CTA hacia arriba es comprimir lo que tiene encima.
      */}
      <section data-hero className="pt-2 pb-24 md:pt-3 md:pb-36">
        <div className="wrap">
          {/*
           * El lienzo del hero: `marca-profunda`, el negro con tinte ámbar del
           * manual. Es el mismo en claro y en oscuro, igual que el de `Rewards`:
           * no es un artefacto del tema, es la idea de marca. `docs/MARCA.md`
           * ("Piezas fuera de la app") describe exactamente esta pieza — fondo
           * marcaProfunda, una sola frase en 800 con tracking negativo, y el
           * ámbar reservado para una única cosa. Acá esa cosa es el CTA.
           *
           * El filo sólo en oscuro, donde el lienzo y la página se separan
           * 1,036:1 y sin él la card no tiene borde. En claro dan 17:1.
           */}
          <div
            data-canvas
            className="relative isolate flex min-h-[calc(100svh-6.5rem)] flex-col justify-center overflow-hidden rounded-card bg-marca-profunda px-5 py-14 md:px-10 md:py-24 dark:border dark:border-white/10 [@media(max-height:820px)]:min-h-[calc(100svh-5rem)] [@media(max-height:820px)]:py-14"
          >
            <div className="md:grid md:grid-cols-12 md:gap-8">
              <div className="md:col-span-9">
              <Eyebrow onDark>Tandil · Próximo lanzamiento</Eyebrow>

              <h1 className="mt-5 text-display-xl font-extrabold text-bone-100">
                Tu próximo turno, a un clic de distancia.
              </h1>

              {/* Medida propia: `measure` (64ch) dejaba renglones de 91 caracteres acá. */}
              <p className="mt-7 max-w-[52ch] text-bone-300">
                Barberías, peluquerías, uñas, depilación y estética de Tandil en una sola app.
                Reservá cuando se te ocurra, sin cadenas de WhatsApp ni llamados en horario de
                trabajo.
              </p>

              {/*
                El separador del sistema, con su tick ámbar. El hero era la única
                sección sin ningún dispositivo estructural: el trabajo emocional
                lo hacía un destello detrás del texto. Ahora lo hace el sistema.
              */}
              <Hairline onDark className="mt-12 max-w-[32rem] [@media(max-height:820px)]:mt-8" />

              {/*
                La aclaración va ANTES del botón. Debajo, el orden de lectura era
                ilusión → clic → decepción; acá encuadra la decisión en vez de
                desmentirla después. Y los 500 puntos dejan de ser un link de
                14px compitiendo con el botón para ser parte de la promesa.
              */}
              <p className="mt-7 max-w-[46ch] text-small text-bone-300">
                Todavía no lanzamos. Anotate ahora y llevate{" "}
                <span className="num font-semibold text-amber-300">500</span>{" "}
                Puntos Bookit para tu primer turno.
              </p>

              {/*
                Los dos públicos, arriba del pliegue. El hero entero hablaba de
                cliente —eyebrow, título, bajada y CTA— y el dueño de local no
                aparecía hasta dos secciones más abajo, con riesgo de cerrar la
                pestaña antes. Un solo ámbar: el CTA que de verdad funciona.
              */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  text="Sumate a la lista VIP"
                  href="/lista-espera?tipo=cliente"
                  onDark
                />
                <Button text="Tengo un local" href="/#locales" variant="secondary" onDark />
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── 2. Cómo funciona ───────────────────── */}
      <Section id="como-funciona" labelledBy="como-funciona-title">
        <HowItWorks />
      </Section>

      {/* ──────────── 3. Los dos públicos, en una sola pieza ──────────── */}
      <Section
        id="publico"
        labelledBy="publico-title"
        tone="tint"
      >
        <Audiences />
      </Section>

      {/* ──────────── 4. Puntos + Referidos (lienzo oscuro) ──────────── */}
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

      {/* ──────────────── 6. Cierre — la bifurcación ──────────────── */}
      {/*
        Antes: un `display-lg` centrado, dos píldoras y letra chica gris — la
        composición más intercambiable de la página, justo donde el visitante
        decide, y con los dos CTA hablándole sólo al cliente. El dueño de local,
        al que la página acaba de dedicarle una sección entera, llegaba a una
        meta que no tenía nada para él.

        Ahora es la última decisión puesta como tal: un lienzo de marca, un
        título bajo el que los dos públicos pueden pararse, y dos bloques con
        el gancho real de cada uno. El ámbar aparece dos veces porque son dos
        piezas — `docs/MARCA.md`: "Si una pieza necesita dos acentos, son dos
        piezas". Y los dos CTA pesan lo mismo, que es lo que el brief pide y
        la composición anterior desmentía.
      */}
      <Section id="cierre" rhythm="breath" labelledBy="cierre-title" tone="canvas">
        <Reveal className="mx-auto max-w-[20ch] text-center md:max-w-[38ch]">
          <h2
            id="cierre-title"
            className="text-display-lg font-extrabold text-bone-100"
          >
            Cuando Bookit abra en Tandil, ya vas a estar adentro.
          </h2>
        </Reveal>

        <Reveal index={1} className="mx-auto mt-16 max-w-4xl md:mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Lado cliente */}
            <div className="flex flex-col items-start border-b border-white/10 pb-12 md:border-r md:border-b-0 md:pr-14 md:pb-0">
              <Eyebrow onDark>
                Sacás turnos
              </Eyebrow>
              <p className="mt-4 max-w-[30ch] text-bone-300">
                <span className="num font-semibold text-amber-300">500</span> Puntos Bookit de
                regalo, guardados para tu primer turno.
              </p>
              {/* Qué pasa después del clic. Antes no lo decía ninguno de los
                  dos lados, y es el momento de mayor compromiso de la página. */}
              <p className="mt-3 max-w-[32ch] text-xs text-bone-300/80">
                Te avisamos por email cuando abramos. Un nombre y un correo: no pedimos tarjeta.
              </p>
              {/* `mt-auto`: los dos CTA caen en la misma línea de base, como en `Audiences` */}
              <div className="mt-auto pt-8">
                <Button
                  text="Sumate a la lista VIP"
                  href="/lista-espera?tipo=cliente"
                  onDark
                />
              </div>
            </div>

            {/* Lado local */}
            <div className="flex flex-col items-start pt-12 md:pt-0 md:pl-14">
              <Eyebrow onDark>
                Tenés un local
              </Eyebrow>
              <p className="mt-4 max-w-[30ch] text-bone-300">
                Precio fundador de por vida, para los primeros locales de Tandil.
              </p>
              {/* El dueño de local llegaba acá sin una sola línea de qué sigue,
                  en el clic de más riesgo de la página. El dato ya existía en
                  el copy de éxito del formulario; faltaba donde se decide. */}
              <p className="mt-3 max-w-[32ch] text-xs text-bone-300/80">
                Te contactamos por WhatsApp o email con los detalles. Anotarte no te compromete a
                nada.
              </p>
              <div className="mt-auto pt-8">
                <Button
                  text="Quiero mi lugar como fundador"
                  href="/lista-espera?tipo=local"
                  variant="secondary"
                  onDark
                />
              </div>
            </div>
          </div>
        </Reveal>

        <p className="mt-16 text-center text-small text-bone-300">
          Todavía no lanzamos. Te avisamos antes que a nadie.
        </p>
      </Section>
    </>
  );
}
