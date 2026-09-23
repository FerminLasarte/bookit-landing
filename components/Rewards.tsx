import type { ReactNode } from "react";
import Eyebrow from "./Eyebrow";
import Hairline from "./Hairline";
import Reveal from "./ui/Reveal";
import Section from "./Section";
import { IconPoints, IconReferral } from "./ui/icons";
import { site } from "@/content/site";

/**
 * §6.1.6 — Puntos y Referidos, en una sola pantalla.
 *
 * Eran dos secciones con la misma forma (texto a la izquierda, caja a la
 * derecha) una detrás de la otra, y contaban la misma idea: en Bookit el turno
 * te devuelve algo. Acá comparten un único lienzo oscuro, partido por una
 * línea. Es el del medio de los tres de la home: el hero abre, éste marca el
 * compás y el cierre remata.
 *
 * Lo único que se mueve solo es la línea entre las dos personas, que fluye —una
 * animación de ambiente, por detrás del texto— y se apaga con
 * `prefers-reduced-motion`.
 *
 * ESTA SECCIÓN NO TIENE MOVIMIENTO PROPIO. Reimplementaba `Reveal` cuatro
 * veces con `initial / whileInView / viewport / transition` en línea y los
 * mismos valores —el D7 de la auditoría—, así que cuando el paso 5 llevó el
 * reveal al token de 560ms esta sección no se habría enterado y habría quedado
 * corriendo a 700ms sola. Ahora usa `Reveal`, que es el único lugar donde ese
 * movimiento está escrito.
 *
 * La cifra tampoco tiene el suyo: era un `motion.span` que subía 16px en 300ms
 * —el reveal, con otra duración— dentro de un bloque que ya estaba revelándose.
 * Entra con su bloque.
 */

/* ── El flujo de referidos ───────────────────────────────────────────── */

function Node({
  label,
  badge,
  children,
}: {
  label: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-24 shrink-0 flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/25 bg-amber-300/8 text-amber-300">
        {children}
      </div>
      <p className="mt-3 text-xs font-semibold text-bone-100">{label}</p>
      <p className="num mt-1 text-small text-amber-300">{badge}</p>
    </div>
  );
}

/** La línea que une a las dos personas. Fluye hacia la derecha, en loop. */
function ReferralFlow() {
  return (
    <div className="flex items-start justify-center gap-2">
      <Node label="Vos" badge="+ puntos">
        <IconPoints className="h-6 w-6" />
      </Node>

      <div className="relative mt-8 min-w-0 flex-1">
        <svg
          viewBox="0 0 120 24"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="h-6 w-full"
        >
          <path
            d="M2 12 C 34 -4, 86 28, 118 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="4 8"
            className="animate-flow text-amber-300/45"
          />
        </svg>
      </div>

      <Node label="Quien invitás" badge="+ puntos">
        <IconReferral className="h-6 w-6" />
      </Node>
    </div>
  );
}

/* ── La sección ──────────────────────────────────────────────────────── */

/**
 * LA COMPOSICIÓN: dos entradas apiladas, no dos columnas.
 *
 * Era título CENTRADO + dos columnas, y después de `#cierre` quedaba como la
 * única sección de la home que todavía usaba las dos cosas que la auditoría
 * contó: 5 de 6 secciones abrían con rótulo + `display-lg` en la misma posición
 * y 4 de 6 resolvían el cuerpo con una partición en dos columnas.
 *
 * Acá el cuerpo deja de ser una partición y pasa a ser un registro de dos
 * entradas separadas por filetes: Puntos primero, Referidos después. No es la
 * misma fila dos veces — la primera pone la cifra contra su explicación (4 | 7)
 * y la segunda el argumento contra el diagrama (5 | 6)—, y es la forma que el
 * manual pide por default cuando el contenido sólo se lee: "un grupo se lee por
 * su aire, no por su borde".
 *
 * Las dos filas se parten en `lg`, no en `md`. A 768 px la celda de la cifra
 * deja 170 px y "puntos de regalo por anotarte." sale en tres renglones; la del
 * argumento deja 220 px y el párrafo baja a cuatro palabras por línea. Con eso
 * la home queda con una sola regla de partición: **dos columnas de 1024 para
 * arriba**, que es donde ya parten `#publico` —por los 321 px que mide su CTA
 * más largo— y la banda de `#cierre`.
 *
 * Lo que sale, y lo dice la auditoría: las tres líneas de "01 · 02 · 03"
 * repetían dos veces lo mismo. Contaban los pasos 01, 02 y 03 de
 * `#como-funciona` con otras palabras, y además repetían el párrafo que tenían
 * justo encima — "Se acumulan solos y los canjeás en los que vienen"—. Con
 * ellas se va uno de los dos recuadros que la sección tenía por dentro.
 *
 * Y sale el otro: el panel de Referidos. Sobre un lienzo no hay cards (§3
 * sexies), y este no era ni siquiera de las que se toman: el link es un
 * EJEMPLO de cómo se ve un código, no un código que alguien copie — el que se
 * copia vive en `ReferralCode`, y ése sí es una card. Queda con aire y un
 * filete, que es lo que la regla pide.
 *
 * LA CIFRA PASA A SER EL TÍTULO DE SU ENTRADA, y eso arregla algo que no era
 * de composición: el "500" era un `<p>` suelto y el título de Puntos era otro
 * `<p>` que empezaba en minúscula, así que la sección tenía un solo `h3` —el de
 * Referidos— y la mitad de Puntos no figuraba en el esquema del documento. En
 * un `h3` los dos pedazos se leen juntos, "500 puntos de regalo por anotarte",
 * que es la frase entera y lo que un lector de pantalla necesita escuchar.
 */
export default function Rewards() {
  return (
    /*
     * EL LIENZO PASÓ A SER UN OBJETO CON ESQUINAS, y eso es todo lo que cambia
     * acá — el contenido de esta sección se recompone en su propio paso, que en
     * el orden del contrato viene después de `#cierre`.
     *
     * La pieza dejó de pintarse a mano: era la tercera copia del mismo lienzo
     * y ahora la pone `Section` con `tone="canvas"`, que es también quien sabe
     * que el filo va sólo en oscuro y que `data-canvas` tiene que ir en la card
     * y no en la sección. Con ella se van la capa de fondo propia, el
     * `overflow-hidden` de la sección y el `data-canvas-capa`, que no lo leía
     * nadie desde que la §3 septies borró la lectura en vivo de máscaras.
     *
     * `marca-profunda` y no `ink-950`: en modo oscuro `ink-950` ES el fondo de
     * la página, así que el lienzo desaparecía y la sección se quedaba sin
     * canvas justo en el tema donde más lo necesita. El negro con tinte ámbar
     * del manual es el mismo en los dos temas — es la idea de marca, no un
     * artefacto del tema. Lo comparte con el hero y con el cierre: son las tres
     * piezas tipo cartel de la página, y cada una tiene un solo acento ámbar.
     */
    <Section id="puntos" labelledBy="recompensas-title" rhythm="breath" tone="canvas">
      {/* Aurora de fondo: lenta, muy difusa, siempre por detrás del texto, y
          ahora recortada por las esquinas del lienzo. El ámbar sale de la
          utilidad `destello`; estaba escrito como `rgba(215,138,29,…)` a mano,
          que es el hex canónico pero suelto. */}
      <div
        aria-hidden="true"
        className="destello pointer-events-none absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 animate-aurora rounded-full"
      />

      {/* `relative`: sin posicionar, el texto queda por debajo de la aurora,
          que es un absoluto hermano. */}
      <div className="relative">
        {/*
          El encabezado deja de estar centrado. El anti-center bias es de la
          skill y el contrato lo toma; lo que decide acá es que ésta era la
          última sección centrada de la página y que el lienzo, desde la
          §3 terdecies, ya no es una banda a sangre: es un objeto con su propio
          margen, así que el texto no tiene de qué apartarse.
        */}
        <Reveal>
          <Eyebrow onDark>Recompensas</Eyebrow>
          <h2
            id="recompensas-title"
            className="mt-5 max-w-[20ch] text-display-lg font-semibold text-bone-100"
          >
            Los turnos que ya te hacías, ahora te devuelven algo.
          </h2>
        </Reveal>

        {/* ── Entrada 1 · Puntos ── */}
        <Hairline onDark className="mt-12 md:mt-16" />

        <Reveal index={1} className="mt-10 md:mt-12 lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Eyebrow onDark>Puntos Bookit</Eyebrow>
            {/*
              La cifra y su frase son UN título, no dos párrafos. Visualmente
              la cifra manda —es lo más grande de la página— y en el esquema del
              documento la entrada existe, que antes no pasaba.
            */}
            <h3 className="mt-6 font-display text-display-sm font-semibold text-bone-100">
              {/* El espacio explícito: el `block` lo esconde en pantalla, y sin
                  él el texto del encabezado es "500puntos". */}
              <span className="num block text-display-2xl text-amber-300">500</span>{" "}
              puntos de regalo por anotarte.
            </h3>
          </div>

          <p className="mt-6 max-w-[42ch] text-bone-300 lg:col-span-7 lg:col-start-6 lg:mt-0 lg:self-end">
            Y cada turno que reservás por Bookit te deja más. Se acumulan solos y los canjeás en
            los que vienen, en cualquier local de la app.
          </p>
        </Reveal>

        {/* ── Entrada 2 · Referidos ── */}
        <Hairline onDark className="mt-14 md:mt-20" />

        <Reveal id="referidos" index={2} className="mt-10 md:mt-12 lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Eyebrow onDark>Referidos</Eyebrow>

            <h3 className="mt-6 font-display text-display-sm font-semibold text-bone-100">
              Invitá y ganen los dos.
            </h3>

            <p className="mt-5 max-w-[38ch] text-bone-300">
              Cada persona que saca turnos con Bookit tiene su código. Compartilo, y cuando alguien
              se registra con él, suman puntos los dos.
            </p>

            {/*
              Las dos aclaraciones salen de `text-xs`. Eran el otro "relleno o
              de más" de la auditoría —letra chica acumulada— y el problema no
              era lo que dicen sino a qué tamaño: 12px es un escalón que el
              `@theme` no declara, puesto a mano. En `text-small` sobre el
              lienzo dan 11,60:1, y es el mismo movimiento que hizo `#cierre`.
            */}
            <p className="mt-6 max-w-[38ch] text-small text-bone-300">
              Si la persona ya tiene la app instalada, el link la abre directo. Si no, ve tu código
              en la web y lo usa al registrarse.
            </p>

            {/*
             * El programa es sólo entre quienes sacan turnos. Los locales no
             * tienen código ni suman puntos: su beneficio es el precio fundador.
             */}
            <p className="mt-3 max-w-[38ch] text-small text-bone-300">
              Es un beneficio entre personas que sacan turnos. Los locales no participan del
              programa de referidos.
            </p>
          </div>

          {/*
            El diagrama, sin recuadro. Antes vivía en un panel con borde dentro
            de un lienzo que ahora también tiene borde: dos rectángulos
            redondeados anidados para agrupar algo que sólo se mira.
          */}
          <div className="mt-10 lg:col-span-6 lg:col-start-7 lg:mt-0">
            <ReferralFlow />

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-small font-semibold text-bone-300">Tu link se ve así</p>
              <p className="mt-2 font-mono text-small break-all text-bone-100">
                {site.url.replace("https://www.", "")}/invite/
                <span className="text-amber-300">TUCODIGO</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
