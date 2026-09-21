"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import Eyebrow from "./Eyebrow";
import { IconPoints, IconReferral } from "./icons";
import { site } from "@/content/site";

/**
 * §6.1.6 — Puntos y Referidos, en una sola pantalla.
 *
 * Eran dos secciones con la misma forma (texto a la izquierda, caja a la
 * derecha) una detrás de la otra, y contaban la misma idea: en Bookit el turno
 * te devuelve algo. Acá comparten un único lienzo oscuro — el segundo y último
 * de la página — partido por una línea.
 *
 * Lo que le da vida es que las dos mitades se mueven: la cifra cuenta desde
 * cero cuando entra en pantalla, y la línea entre las dos personas fluye. Las
 * dos cosas se apagan con `prefers-reduced-motion`.
 */

/* ── La cifra ────────────────────────────────────────────────────────── */

/**
 * Cuenta de 0 a `to` la primera vez que entra en pantalla.
 *
 * El número real va en un `sr-only` aparte: un lector de pantalla tiene que
 * leer "500", no la cuenta entera fotograma a fotograma.
 */
/**
 * La cifra entra, no cuenta.
 *
 * Antes era un odómetro de 0 a 500 en 1,8s con `easeOutExpo`. Tres problemas:
 * mostraba valores que no son —lo agarré en 492 y en 140— cuando el hero acaba
 * de prometer 500 exactos; un contador animado es la gramática visual de una
 * métrica en vivo, y esto es un regalo fijo en un producto que no tiene ninguna
 * métrica real; y `docs/MARCA.md` (Movimiento) pide movimiento "corto y físico",
 * con 300ms para algo que entra. 1,8s de números girando no es ninguna de las
 * dos cosas.
 *
 * Ahora sube 16px y aparece, con la misma curva que usa el resto de la página.
 * El número es el número desde el primer frame, así que tampoco hace falta el
 * `sr-only` que antes existía para que el lector no leyera la cuenta.
 */
function CountUp({ to }: { to: number }) {
  const reduced = useReducedMotion();

  return (
    <motion.span
      className="inline-block"
      initial={reduced ? undefined : { opacity: 0, y: 16 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {to}
    </motion.span>
  );
}

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
            stroke="rgba(232,180,95,0.45)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="4 8"
            className="animate-flow"
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
    <section
      data-canvas
      id="puntos"
      aria-labelledby="recompensas-title"
      className="relative isolate overflow-hidden py-32 md:py-44"
    >
      {/*
       * El lienzo oscuro va en su propia capa con `fade-y`: en vez de cortar el
       * papel con una línea recta, la tinta entra y sale con un degradé. El
       * padding (8rem) es mayor que el difuminado (6rem) a propósito: cuando
       * empieza el texto, el fondo ya es tinta plena y el contraste se sostiene.
       */}
      {/*
        `marca-profunda`, no `ink-950`: en modo oscuro `ink-950` ES el fondo de
        la página, así que el lienzo desaparecía y la sección se quedaba sin
        canvas justo en el tema donde más lo necesita. El negro con tinte ámbar
        del manual es distinto en los dos temas — es la idea de marca, no un
        artefacto del tema. Lo comparte con el hero: son las dos piezas tipo
        cartel de la página, y cada una tiene un solo acento ámbar (acá, el 500).
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-marca-profunda fade-y [--fade-y:6rem] dark:border-y dark:border-white/12 dark:[--fade-y:0rem]"
      />

      {/* Aurora de fondo: lenta, muy difusa, siempre por detrás del texto */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 animate-aurora rounded-full bg-[radial-gradient(circle,rgba(215,138,29,0.14)_0%,rgba(215,138,29,0)_65%)]"
      />

      <div className="wrap relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-64px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-[34rem] text-center"
        >
          <Eyebrow onDark>Recompensas</Eyebrow>
          <h2
            id="recompensas-title"
            className="mt-5 text-display-lg font-semibold text-bone-100"
          >
            Los turnos que ya te hacías, ahora te devuelven algo.
          </h2>
        </motion.div>

        <div className="mt-20 grid gap-16 md:grid-cols-2 md:gap-0">
          {/* ── Puntos ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-64px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="md:pr-14"
          >
            <Eyebrow onDark variant="label">
              Puntos Bookit
            </Eyebrow>

            {/* La cifra como pieza gráfica: es lo más grande de la sección */}
            <p className="num mt-6 text-[clamp(4.5rem,11vw,8.5rem)] leading-[0.85] text-amber-300">
              <CountUp to={500} />
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
          </motion.div>

          {/* ── Referidos ── */}
          <motion.div
            id="referidos"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-64px" }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="border-white/10 md:border-l md:pl-14"
          >
            <Eyebrow onDark variant="label">
              Referidos
            </Eyebrow>

            <h3 className="mt-6 font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-bone-100">
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
