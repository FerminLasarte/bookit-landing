import type { Metadata } from "next";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import Hairline from "@/components/Hairline";
import ComoFunciona from "@/components/home/ComoFunciona";
import Hero from "@/components/home/Hero";
import ParaLocales from "@/components/home/ParaLocales";
import Preguntas from "@/components/home/Preguntas";
import Puntos from "@/components/home/Puntos";
import Testimonios from "@/components/home/Testimonios";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/Section";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />

      <ComoFunciona />

      <ParaLocales />

      <Puntos />

      <Testimonios />

      <Preguntas />

      {/* ──────────────── 6. Cierre — la bifurcación ──────────────── */}
      {/*
        Antes: un `display-lg` centrado, dos píldoras y letra chica gris — la
        composición más intercambiable de la página, justo donde el visitante
        decide, y con los dos CTA hablándole sólo al cliente. El dueño de local,
        al que la página acaba de dedicarle una sección entera, llegaba a una
        meta que no tenía nada para él. De ahí salió la bifurcación: un título
        bajo el que los dos públicos pueden pararse, y dos bloques con el gancho
        real de cada uno.

        LA FASE C LE CAMBIA LA GEOMETRÍA, no el contenido. El lienzo dejó de ser
        una banda a sangre y pasa a ser un objeto con esquinas dentro del `wrap`
        —la respuesta a la pregunta que la §3 nonies dejó abierta, y la que
        resuelve el D10 de la auditoría: el cierre y el footer daban 1,03:1 y
        eran dos bandas oscuras pegadas; ahora el footer es el piso sobre el que
        el cierre se apoya. Ver `Section`.

        Y con el lienzo hecho objeto vuelve a aplicar la medición del hero: el
        contenido vivía en un `max-w-4xl` centrado dentro de un lienzo a sangre
        de 1440 px, o sea 270 px de negro muerto a cada lado. Ese ancho era la
        distancia al borde de la PANTALLA, y ya no hay borde de pantalla: el
        lienzo es el margen. El contenido toma la card entera.

        EL PARECIDO CON EL HERO ES DELIBERADO. Son los dos lienzos `marca-
        profunda` de la home, los dos con titular a lo ancho, filete y una banda
        de a dos abajo, y enmarcan la página. Lo que los separa es la simetría:
        el hero es una voz hablándole a dos personas y su banda es 5 | 6, y acá
        son dos ofertas que tienen que pesar igual, así que la banda es 6 | 6.
      */}
      <Section id="cierre" rhythm="breath" labelledBy="cierre-title" tone="canvas">
        <Reveal>
          {/* Sin `max-w`: 53 caracteres a `display-lg` rompen en dos renglones
              dentro de los 1020 px del lienzo. Centrado y a 38ch eran tres. */}
          <h2
            id="cierre-title"
            className="text-display-lg font-extrabold text-bone-100"
          >
            Cuando Bookit abra en Tandil, ya vas a estar adentro.
          </h2>

          {/*
            Subió. Era la última línea de la página, centrada y sola debajo de
            las dos columnas: un huérfano. Acá es la bajada del titular, y el
            cierre pasa a terminar en los dos CTA, que es donde tiene que
            terminar la última decisión de la página.
          */}
          <p className="mt-6 max-w-[46ch] text-bone-300">
            Todavía no lanzamos. Te avisamos antes que a nadie.
          </p>
        </Reveal>

        {/* El mismo filete del hero, de lado a lado del lienzo: parte la pieza
            en dos — lo que se promete arriba, lo que se decide abajo. */}
        <Hairline onDark className="mt-12 md:mt-16" />

        {/*
          La banda se parte en `lg` y no en `md`, por el mismo número que la de
          `Audiences`: el CTA del local mide 321 px y a 768 px cada columna deja
          248. A 1024 deja 376 y entra con holgura. Apiladas ocupan el ancho del
          lienzo, que es de sobra.
        */}
        <Reveal index={1} className="mt-12 md:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Lado cliente */}
            <div className="flex flex-col items-start border-b border-white/10 pb-12 lg:border-r lg:border-b-0 lg:pr-14 lg:pb-0">
              <Eyebrow onDark>Sacás turnos</Eyebrow>
              <p className="mt-4 max-w-[30ch] text-bone-300">
                <span className="num font-semibold text-amber-300">500</span> Puntos Bookit de
                regalo, guardados para tu primer turno.
              </p>
              {/* Qué pasa después del clic. Antes no lo decía ninguno de los
                  dos lados, y es el momento de mayor compromiso de la página.
                  A `text-small` y sin el `/80`: iba en `text-xs` con la tinta
                  al 80 %, que es un sexto valor de tinta puesto a mano para
                  algo que el sitio ya resuelve con un token. Es la misma línea
                  que el hero pone en `text-small text-bone-300`, y ahí da
                  11,60:1 contra 7,68:1. */}
              <p className="mt-3 max-w-[36ch] text-small text-bone-300">
                Te avisamos por email cuando abramos. Un nombre y un correo: no pedimos tarjeta.
              </p>
              {/* `mt-auto`: los dos CTA caen en la misma línea de base, como en `Audiences` */}
              <div className="mt-auto pt-10">
                <Button
                  text="Sumate a la lista VIP"
                  href="/lista-espera?tipo=cliente"
                  onDark
                />
              </div>
            </div>

            {/* Lado local */}
            <div className="flex flex-col items-start pt-12 lg:pt-0 lg:pl-14">
              <Eyebrow onDark>Tenés un local</Eyebrow>
              <p className="mt-4 max-w-[30ch] text-bone-300">
                Precio fundador de por vida, para los primeros locales de Tandil.
              </p>
              {/* El dueño de local llegaba acá sin una sola línea de qué sigue,
                  en el clic de más riesgo de la página. El dato ya existía en
                  el copy de éxito del formulario; faltaba donde se decide. */}
              <p className="mt-3 max-w-[36ch] text-small text-bone-300">
                Te contactamos por WhatsApp o email con los detalles. Anotarte no te compromete a
                nada.
              </p>
              <div className="mt-auto pt-10">
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
      </Section>
    </>
  );
}
