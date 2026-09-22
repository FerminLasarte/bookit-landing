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
      {/*
        SIN PADDING ABAJO, y no es un ajuste de aire: el hueco después del
        lienzo lo pone ahora el padding de `#como-funciona`, así que el borde de
        abajo de la card ES el borde de arriba de la sección siguiente. Eso es
        lo que le da al lavado cálido un canto del que nacer. Un degradé
        anclado en una esquina se corta en el borde que define esa esquina; si
        ese borde no existe —si el lavado arranca en medio de la página pelada—
        el corte se lee como una banda mal terminada, porque arriba corta y
        abajo se apaga. Apoyado contra el negro del hero, el corte desaparece
        debajo de un canto que ya estaba.
      */}
      <section data-hero className="pt-2 md:pt-3">
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
            {/*
              EL TÍTULO OCUPA EL LIENZO ENTERO, y eso es lo que arregla las dos
              cosas que estaban mal a la vez. El contenido vivía en 9 de 12
              columnas —757px de los 1020 del lienzo— y desde ahí el titular
              necesitaba tres renglones y sobraba casi un tercio de negro a la
              derecha. Medido a 1440: la frase entera mide 1531px de glifos a
              88px, así que a 757 pide 2,02 renglones y sale en tres, y a 1020
              pide 1,50 y sale en DOS. No hacía falta tocar la escala ni el
              copy; el titular estaba metido en una columna que no era la suya.
            */}
            <Eyebrow onDark>Tandil · Próximo lanzamiento</Eyebrow>

            <h1 className="mt-5 text-display-xl font-extrabold text-bone-100">
              Tu próximo turno, a un clic de distancia.
            </h1>

            {/*
              El separador del sistema, con su tick ámbar, ahora de lado a lado
              del lienzo. Antes medía 32rem y cortaba a la mitad: era el filete
              de una columna, no el del cartel. De ancho completo es lo que
              parte la pieza en dos —promesa arriba, decisión abajo— y lo que
              hace que el lienzo se lea como un objeto y no como una caja con
              texto apoyado en la esquina.
            */}
            <Hairline onDark className="mt-10 [@media(max-height:820px)]:mt-7" />

            {/*
              La banda de abajo, a dos columnas: es la que ocupa la mitad
              derecha que quedaba vacía, y de paso acorta la pila vertical, que
              es lo que mantiene al CTA sobre el pliegue cuando la card cambió
              de proporciones. El orden de lectura se conserva —bajada, después
              la aclaración y el botón—, porque leer una fila es de izquierda a
              derecha.

              LA BANDA PARTE EN `lg`, Y ES UN ARREGLO, NO UN AJUSTE DE AIRE.
              Partía en `md`, y ahí la celda de los CTA deja 288 px para dos
              botones que juntos piden 434 —232 + 12 de hueco + 190—. Con el
              `whitespace-nowrap` que el botón lleva por encima de `sm`, el
              segundo no puede encogerse: se salía 146 px de su celda y el
              `overflow-hidden` del lienzo le cortaba 106. O sea que "Tengo un
              local" aparecía partido al medio, en el cuadro más visible del
              sitio, en todo el rango de 768 a 1059 px. Es exactamente el ítem
              del pre-flight que dice que ningún texto se sale de su contenedor
              donde hay dos columnas, y lo destapó la pasada completa: hasta
              ahora el contrato se había verificado por sección, y la banda del
              hero es la única que se había quedado en `md` cuando `#publico`,
              `#cierre` y `#puntos` bajaron a `lg`.

              Con esto la §3 quaterdecies pasa a ser cierta: la home queda con
              UNA sola regla de partición, dos columnas de 1024 para arriba.
              Entre 768 y 1023 la banda se apila y los dos CTA entran cómodos
              en los 608 px del lienzo.

              Y la fila de botones lleva `flex-wrap`, que cubre lo que la
              partición sola no: a 1024 la celda deja 416 px contra los 434 que
              los dos piden, y el cruce cae exacto en 1060, donde la celda mide
              434. En esos 36 px el segundo baja a su propio renglón en vez de
              recortarse. Es el
              mismo principio que la §3 terdecies le aplicó al rótulo de un
              botón — lo que no entra envuelve, no se desborda—, ahora para la
              fila.
            */}
            <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-8 [@media(max-height:820px)]:mt-7">
              {/* Medida propia: `measure` (64ch) dejaba renglones de 91 caracteres acá. */}
              <p className="text-bone-300 lg:col-span-5">
                Barberías, peluquerías, uñas, depilación y estética de Tandil en una sola app.
                Reservá cuando se te ocurra, sin cadenas de WhatsApp ni llamados en horario de
                trabajo.
              </p>

              <div className="mt-8 lg:col-span-6 lg:col-start-7 lg:mt-0">
                {/*
                  La aclaración va ANTES del botón. Debajo, el orden de lectura era
                  ilusión → clic → decepción; acá encuadra la decisión en vez de
                  desmentirla después. Y los 500 puntos dejan de ser un link de
                  14px compitiendo con el botón para ser parte de la promesa.
                */}
                <p className="max-w-[46ch] text-small text-bone-300">
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
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
      {/*
        Primera sección después del lienzo del hero, y la primera del sitio que
        usa el lavado cálido: el dispositivo que la Fase B0 construyó y que
        todavía no consumía nadie. Va acá porque es la sección que muestra las
        pantallas de la app, o sea el lugar donde el calor que la app tiene
        detrás de sus encabezados aparece de los dos lados del marco.
      */}
      <Section
        id="como-funciona"
        labelledBy="como-funciona-title"
        rhythm="apoyo"
        lavado
        /*
          EL ALCANCE, que es la única perilla del lavado por sección — nunca
          la opacidad—. En móvil va más corto: el degradé no escala con el
          texto, y ahí la sección se aprieta, así que el mismo valor le llega a
          la bajada. Medido en el borde de ARRIBA de cada elemento, que es su
          peor punto, a 375 · 768 · 1024 · 1440:

            rótulo   ink-900 13px   49-60 % de lavado   12,06-12,45:1
            titular  ink-900        39-47 %             12,55-12,78:1
            "01"     ink-500 28-40px  0-6 %              4,63-4,71:1  (pide 3)
            bajadas  ink-500 14px     0 % en las cuatro  4,71:1

          O sea: sobre el lavado sólo hay tinta plena y un ordinal a tamaño de
          display, y el texto chico cae entero fuera del degradé — que es lo
          que la regla de colocación pide, resuelto como estructura y no como
          ajuste de color.

          Los valores descartados, para no volver a probarlos: 32rem deja la
          bajada en 4,64:1 a 1024 y 34rem en 4,67:1 a 1440. Pasan, con 0,14 y
          0,17 de margen, y este repo ya se quemó tres veces con márgenes así.
          Y 24rem en móvil le da a la bajada un 26,5 %, o sea 4,37:1: falla.
        */
        className="[--lavado-y:20rem] md:[--lavado-y:24rem]"
      >
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
