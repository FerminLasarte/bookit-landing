import type { ReactNode } from "react";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import Section from "./Section";
import { IconPoints, IconReferral } from "./icons";
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
        <Reveal className="mx-auto max-w-[34rem] text-center">
          <Eyebrow onDark>Recompensas</Eyebrow>
          <h2
            id="recompensas-title"
            className="mt-5 text-display-lg font-semibold text-bone-100"
          >
            Los turnos que ya te hacías, ahora te devuelven algo.
          </h2>
        </Reveal>

        <div className="mt-20 grid gap-16 md:grid-cols-2 md:gap-0">
          {/* ── Puntos ── */}
          <Reveal index={1} className="md:pr-14">
            <Eyebrow onDark>
              Puntos Bookit
            </Eyebrow>

            {/* La cifra como pieza gráfica: es lo más grande de la sección */}
            <p className="num mt-6 text-display-2xl text-amber-300">
              500
            </p>
            <p className="mt-4 font-display text-h3 font-semibold text-bone-100">
              puntos de regalo por anotarte.
            </p>

            <p className="mt-5 max-w-[38ch] text-small text-bone-300">
              Y cada turno que reservás por Bookit te deja más. Se acumulan solos y los canjeás en
              los que vienen, en cualquier local de la app.
            </p>

            <ol className="mt-10 space-y-px overflow-hidden rounded-field border border-white/10">
              {[
                { n: "01", label: "Reservás tu turno como siempre" },
                { n: "02", label: "Los puntos se suman solos" },
                { n: "03", label: "Los canjeás en el próximo" },
              ].map((item) => (
                <li key={item.n} className="flex items-center gap-4 bg-white/3 px-5 py-3.5">
                  <span aria-hidden="true" className="num text-base text-amber-300">
                    {item.n}
                  </span>
                  <span className="text-small text-bone-100">{item.label}</span>
                </li>
              ))}
            </ol>
          </Reveal>

          {/* ── Referidos ── */}
          <Reveal id="referidos" index={2} className="border-white/10 md:border-l md:pl-14">
            <Eyebrow onDark>
              Referidos
            </Eyebrow>

            <h3 className="mt-6 font-display text-display-sm font-semibold text-bone-100">
              Invitá y ganen los dos.
            </h3>

            <p className="mt-5 max-w-[38ch] text-small text-bone-300">
              Cada persona que saca turnos con Bookit tiene su código. Compartilo, y cuando alguien
              se registra con él, suman puntos los dos.
            </p>

            <div className="mt-10 rounded-card border border-white/10 bg-white/3 p-6">
              <ReferralFlow />

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs font-semibold text-bone-300">Tu link se ve así</p>
                <p className="mt-2 font-mono text-small break-all text-bone-100">
                  {site.url.replace("https://www.", "")}/invite/
                  <span className="text-amber-300">TUCODIGO</span>
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-[38ch] text-xs text-bone-300">
              Si la persona ya tiene la app instalada, el link la abre directo. Si no, ve tu código
              en la web y lo usa al registrarse.
            </p>

            {/*
             * El programa es sólo entre quienes sacan turnos. Los locales no
             * tienen código ni suman puntos: su beneficio es el precio fundador.
             */}
            <p className="mt-3 max-w-[38ch] text-xs text-bone-300">
              Es un beneficio entre personas que sacan turnos. Los locales no participan del
              programa de referidos.
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
