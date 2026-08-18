"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Search } from "lucide-react";
import Eyebrow from "./Eyebrow";
import { IconPoints } from "./icons";
import { categorias } from "@/content/categorias";
import { steps } from "@/content/steps";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * §6.1.3 — Cómo funciona.
 *
 * La versión anterior era una fila de tres cards, cada una con su propia
 * pantallita adentro: tres marcos, tres bordes y tres sombras compitiendo por
 * la misma atención. Se leía cargado justamente porque repetía el mismo
 * contenedor tres veces.
 *
 * Acá hay una sola pantalla. Los tres pasos son texto — una lista, sin caja —
 * y la pantalla es la que cambia: avanza sola cada `STEP_MS`, se puede tomar
 * el control tocando un paso, y se frena cuando el puntero está encima o
 * cuando la sección no está a la vista. El aire lo hace el vacío entre las dos
 * columnas, no un `gap` más grande entre cards.
 */

/** Cuánto dura cada paso antes de pasar al siguiente. */
const STEP_MS = 5200;

/* ── La pantalla ─────────────────────────────────────────────────────── */

/** Entrada escalonada de las filas dentro de una pantalla. */
const stage = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
};

const row = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const screenTitle = "text-small font-semibold text-ink-900 dark:text-bone-100";
const screenMuted = "text-xs text-ink-500 dark:text-bone-300";

/** Paso 01 — buscar. Acá viven los rubros de Bookit. */
function ScreenBuscar() {
  return (
    <>
      <motion.div
        variants={row}
        className="flex items-center gap-2.5 rounded-pill border border-ink-900/10 bg-cream-50 px-4 py-3 dark:border-white/10 dark:bg-ink-900"
      >
        <Search
          className="h-4 w-4 shrink-0 text-ink-500 dark:text-bone-300"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <span className={screenMuted}>Buscar en {site.city}</span>
      </motion.div>

      <motion.ul variants={row} className="mt-5 flex flex-wrap gap-2">
        {categorias.map((categoria, index) => (
          <li
            key={categoria.value}
            className={cn(
              "rounded-pill border px-3 py-1.5 text-xs font-medium",
              index === 0
                ? "border-amber-500 bg-amber-500 text-ink-900"
                : "border-ink-900/12 text-ink-500 dark:border-white/12 dark:text-bone-300",
            )}
          >
            {categoria.label}
          </li>
        ))}
      </motion.ul>

      <div className="mt-6 space-y-2.5">
        {[
          { name: "Estudio Norte", meta: "Barbería · a 6 cuadras", next: "14:30" },
          { name: "Sala Bruna", meta: "Peluquería · Centro", next: "16:00" },
        ].map((local) => (
          <motion.div
            key={local.name}
            variants={row}
            className="flex items-center justify-between gap-4 rounded-field border border-ink-900/8 bg-cream-50 px-4 py-3 dark:border-white/8 dark:bg-ink-900"
          >
            <div className="min-w-0">
              <p className={cn(screenTitle, "truncate")}>{local.name}</p>
              <p className={cn(screenMuted, "truncate")}>{local.meta}</p>
            </div>
            <span className="num shrink-0 rounded-pill bg-amber-500/12 px-2.5 py-1 text-xs text-amber-700 dark:text-amber-300">
              {local.next}
            </span>
          </motion.div>
        ))}
      </div>
    </>
  );
}

/**
 * Paso 02 — el selector de horarios.
 * Los horarios sólo aparecen acá, donde se explican solos: son los turnos
 * libres de un día, uno elegido y dos ya tomados.
 */
const slots = [
  { time: "09:00", state: "free" },
  { time: "09:45", state: "taken" },
  { time: "10:30", state: "selected" },
  { time: "11:15", state: "free" },
  { time: "12:00", state: "taken" },
  { time: "12:45", state: "free" },
] as const;

function ScreenHorarios() {
  return (
    <>
      <motion.div variants={row} className="flex items-baseline justify-between gap-4">
        <div>
          <p className={screenTitle}>Estudio Norte</p>
          <p className={screenMuted}>Corte + barba · 45 min</p>
        </div>
        <p className={screenMuted}>Hoy</p>
      </motion.div>

      <motion.ul variants={row} className="mt-5 grid grid-cols-3 gap-2.5">
        {slots.map((slot) => (
          <li key={slot.time}>
            <span
              className={cn(
                "num flex items-center justify-center rounded-field border py-3 text-base",
                slot.state === "selected" && "border-amber-500 bg-amber-500 text-ink-900",
                slot.state === "free" &&
                  "border-ink-900/12 text-ink-900 dark:border-white/12 dark:text-bone-100",
                // El tachado ya dice que está ocupado: no hace falta bajarle la
                // opacidad al texto, que era lo que le rompía el contraste.
                slot.state === "taken" &&
                  "border-ink-900/8 text-ink-500 line-through dark:border-white/8 dark:text-bone-300",
              )}
            >
              {slot.time}
              {slot.state === "taken" && <span className="sr-only"> (ocupado)</span>}
              {slot.state === "selected" && <span className="sr-only"> (elegido)</span>}
            </span>
          </li>
        ))}
      </motion.ul>

      <motion.div
        variants={row}
        className="mt-6 flex items-center justify-center rounded-pill bg-ink-900 py-3 text-small font-semibold text-bone-100 dark:bg-bone-100 dark:text-ink-900"
      >
        Confirmar turno
      </motion.div>
    </>
  );
}

/** Paso 03 — el saldo de puntos, como se ve en la app. */
const ledger = [
  { label: "Corte en Estudio Norte", amount: "+50" },
  { label: "Uñas en Sala Bruna", amount: "+50" },
  { label: "Bienvenida a la lista VIP", amount: "+500" },
] as const;

function ScreenPuntos() {
  return (
    <>
      <motion.div variants={row} className="flex items-center gap-2.5">
        <IconPoints className="h-5 w-5 text-amber-600 dark:text-amber-300" />
        <p className={screenTitle}>Puntos Bookit</p>
      </motion.div>

      <motion.p
        variants={row}
        className="num mt-3 text-[3.5rem] leading-none text-amber-600 dark:text-amber-300"
      >
        600
      </motion.p>

      <motion.p variants={row} className={cn(screenMuted, "mt-2")}>
        Disponibles para tu próximo turno
      </motion.p>

      <ul className="mt-6 space-y-px overflow-hidden rounded-field border border-ink-900/8 dark:border-white/8">
        {ledger.map((item) => (
          <motion.li
            key={item.label}
            variants={row}
            className="flex items-center justify-between gap-4 bg-cream-50 px-4 py-3 dark:bg-ink-900"
          >
            <span className={cn(screenMuted, "truncate")}>{item.label}</span>
            <span className="num shrink-0 text-small text-amber-700 dark:text-amber-300">
              {item.amount}
            </span>
          </motion.li>
        ))}
      </ul>
    </>
  );
}

const screens = [ScreenBuscar, ScreenHorarios, ScreenPuntos] as const;

/* ── El dispositivo ──────────────────────────────────────────────────── */

/**
 * Marco del teléfono. Es el único contenedor de la sección, así que se puede
 * permitir el detalle: borde fino, sombra larga y el destello ámbar detrás.
 */
function Device({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {/* Destello de ambiente: detrás del marco, nunca sobre el texto */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-10 animate-aurora rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(215,138,29,0.16)_0%,rgba(215,138,29,0)_68%)]"
      />

      <div className="relative mx-auto max-w-[22rem] rounded-[2.5rem] border border-ink-900/10 bg-paper p-3 shadow-[0_32px_80px_-32px_rgba(21,19,17,0.35)] dark:border-white/10 dark:bg-ink-800">
        {/* Muesca: dos trazos, sin dibujar un iPhone entero */}
        <div
          aria-hidden="true"
          className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink-900/12 dark:bg-white/12"
        />
        <div className="min-h-[24rem] rounded-[1.75rem] bg-paper p-5 dark:bg-ink-800">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── La sección ──────────────────────────────────────────────────────── */

export default function HowItWorks() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  // `amount: 0.4` — sólo avanza cuando la sección está realmente mirándose.
  const inView = useInView(ref, { amount: 0.4 });

  // Un timeout por paso, no un interval: al tocar un paso el reloj arranca de cero.
  useEffect(() => {
    if (reduced || paused || !inView) return;
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % steps.length),
      STEP_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active, paused, inView, reduced]);

  const Screen = screens[active] ?? ScreenBuscar;

  return (
    <div
      ref={ref}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="md:grid md:grid-cols-12 md:items-center md:gap-16">
        {/* ── Columna de texto ── */}
        <div className="md:col-span-6">
          <Eyebrow>Cómo funciona</Eyebrow>
          <h2
            id="como-funciona-title"
            className="mt-5 text-display-lg font-semibold text-ink-900 dark:text-bone-100"
          >
            Tres pasos, y el turno ya está.
          </h2>

          <ol className="mt-14 space-y-1">
            {steps.map((step, index) => {
              const isActive = index === active;
              return (
                <li key={step.n} className="relative">
                  {/* La barra ámbar viaja entre pasos: un solo elemento, no tres */}
                  {isActive && !reduced && (
                    <motion.span
                      layoutId="how-rail"
                      aria-hidden="true"
                      className="absolute top-1 left-0 h-[calc(100%-0.5rem)] w-0.5 rounded-full bg-amber-500"
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  {isActive && reduced && (
                    <span
                      aria-hidden="true"
                      className="absolute top-1 left-0 h-[calc(100%-0.5rem)] w-0.5 rounded-full bg-amber-500"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    aria-current={isActive ? "step" : undefined}
                    className="ring-focus block w-full rounded-sm py-4 pl-7 text-left"
                  >
                    <span className="flex items-baseline gap-4">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "num text-2xl transition-colors duration-500",
                          isActive
                            ? "text-amber-700 dark:text-amber-300"
                            : "text-ink-500/50 dark:text-bone-300/40",
                        )}
                      >
                        {step.n}
                      </span>
                      <span className="flex-1">
                        <span
                          className={cn(
                            "block font-display text-h3 font-semibold transition-colors duration-500",
                            isActive
                              ? "text-ink-900 dark:text-bone-100"
                              : "text-ink-500 dark:text-bone-300",
                          )}
                        >
                          {step.title}
                        </span>
                        <span
                          className={cn(
                            "mt-2 block max-w-[42ch] text-small text-ink-500 transition-opacity duration-500 dark:text-bone-300",
                            isActive ? "opacity-100" : "opacity-45",
                          )}
                        >
                          {step.body}
                        </span>
                      </span>
                    </span>

                    {/* Reloj del paso: la única pista de que esto avanza solo */}
                    {isActive && !reduced && (
                      <span
                        aria-hidden="true"
                        className="mt-4 block h-px w-full origin-left bg-ink-900/8 dark:bg-white/10"
                      >
                        <motion.span
                          key={`${active}-${paused}-${inView}`}
                          className="block h-px origin-left bg-amber-500/70"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: paused || !inView ? 0 : 1 }}
                          transition={{
                            duration: paused || !inView ? 0 : STEP_MS / 1000,
                            ease: "linear",
                          }}
                          style={{ width: "100%" }}
                        />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ── La pantalla ── */}
        <div className="mt-16 md:col-span-6 md:mt-0">
          <Device>
            {/* `aria-live` no: el texto de la izquierda ya cuenta los tres pasos */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                variants={stage}
                initial={reduced ? undefined : "hidden"}
                animate="show"
                exit={reduced ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Screen />
              </motion.div>
            </AnimatePresence>
          </Device>
        </div>
      </div>
    </div>
  );
}
