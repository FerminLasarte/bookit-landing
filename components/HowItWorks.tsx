import type { ReactNode } from "react";
import { Search } from "lucide-react";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import { IconPoints } from "./icons";
import { categorias } from "@/content/categorias";
import { steps } from "@/content/steps";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * §6.1.3 — Cómo funciona.
 *
 * Cada paso es una card que muestra la pantalla real que le corresponde en la app:
 * buscar por rubro, elegir un horario, ver el saldo de puntos. Por eso las tres
 * cards son distintas entre sí — una fila de tres cards iguales con un icono
 * genérico arriba es justo lo que el brief prohíbe (§4.7).
 */

const cardShell =
  "flex h-full flex-col rounded-card border border-ink-900/8 bg-paper p-6 shadow-[0_1px_0_rgba(0,0,0,0.03)] md:p-7 dark:border-white/8 dark:bg-ink-800";

/** Marco interior: hace de "pantalla" dentro de la card. */
const screenShell =
  "rounded-field border border-ink-900/8 bg-cream-50 p-4 dark:border-white/8 dark:bg-ink-900";

function StepCard({
  n,
  title,
  body,
  children,
  className = "",
}: {
  n: string;
  title: string;
  body: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(cardShell, className)}>
      <div className="flex items-baseline gap-3">
        <span
          aria-hidden="true"
          className="font-mono text-sm font-medium tabular-nums text-amber-700 dark:text-amber-300"
        >
          {n}
        </span>
        <h3 className="text-h3 font-semibold text-ink-900 dark:text-bone-100">{title}</h3>
      </div>

      <p className="mt-3 text-small text-ink-500 dark:text-bone-300">{body}</p>

      {/* La "pantalla" va al pie de la card, empujada por el mt-auto */}
      <div className="mt-6 pt-1">{children}</div>
    </div>
  );
}

/** Paso 01 — buscador con los rubros de Bookit. Acá viven las categorías. */
function BuscadorPreview() {
  return (
    <div className={screenShell}>
      <div className="flex items-center gap-2.5 rounded-pill border border-ink-900/10 bg-paper px-3.5 py-2 dark:border-white/10 dark:bg-ink-800">
        <Search
          className="h-4 w-4 shrink-0 text-ink-500 dark:text-bone-300"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <span className="text-small text-ink-500 dark:text-bone-300">Buscar en {site.city}</span>
      </div>

      <ul className="mt-3.5 flex flex-wrap gap-2">
        {categorias.map((categoria, index) => (
          <li
            key={categoria.value}
            className={cn(
              "rounded-pill border px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
              // El primero va "elegido", como un filtro activo de la app
              index === 0
                ? "border-amber-500 bg-amber-500 text-ink-900"
                : "border-ink-900/12 bg-paper text-ink-900 hover:border-ink-900/30 dark:border-white/12 dark:bg-ink-800 dark:text-bone-100 dark:hover:border-white/30",
            )}
          >
            {categoria.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Paso 02 — el selector de horarios.
 * Los horarios sólo aparecen acá, donde se explican solos: son los turnos libres
 * de un día, uno elegido y uno ya tomado.
 */
const slots = [
  { time: "09:00", state: "free" },
  { time: "09:45", state: "taken" },
  { time: "10:30", state: "selected" },
  { time: "11:15", state: "free" },
  { time: "12:00", state: "taken" },
  { time: "12:45", state: "free" },
] as const;

function HorariosPreview() {
  return (
    <div className={screenShell}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-small font-semibold text-ink-900 dark:text-bone-100">Elegí un horario</p>
        <p className="text-xs text-ink-500 dark:text-bone-300">Hoy</p>
      </div>

      <ul className="mt-3.5 grid grid-cols-3 gap-2">
        {slots.map((slot) => (
          <li key={slot.time}>
            <span
              className={cn(
                "flex items-center justify-center rounded-pill border py-2 font-mono text-xs font-medium tabular-nums",
                slot.state === "selected" &&
                  "border-amber-500 bg-amber-500 text-ink-900",
                slot.state === "free" &&
                  "border-ink-900/12 bg-paper text-ink-900 dark:border-white/12 dark:bg-ink-800 dark:text-bone-100",
                // El tachado ya dice que está ocupado: no hace falta bajarle la
                // opacidad al texto, que era lo que le rompía el contraste.
                slot.state === "taken" &&
                  "border-ink-900/8 bg-transparent text-ink-500 line-through dark:border-white/8 dark:text-bone-300",
              )}
            >
              {slot.time}
              {slot.state === "taken" && <span className="sr-only"> (ocupado)</span>}
              {slot.state === "selected" && <span className="sr-only"> (elegido)</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Paso 03 — el saldo de puntos, como se ve en la app. */
function PuntosPreview() {
  return (
    <div className={screenShell}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <IconPoints className="h-5 w-5 text-amber-600 dark:text-amber-300" />
          <p className="text-small font-semibold text-ink-900 dark:text-bone-100">Puntos Bookit</p>
        </div>
        <p className="font-display text-2xl font-extrabold tabular-nums text-amber-600 dark:text-amber-300">
          500
        </p>
      </div>

      <div className="mt-4 border-t border-ink-900/8 pt-3.5 dark:border-white/8">
        <p className="text-xs text-ink-500 dark:text-bone-300">
          Canjealos en tu próximo turno, en cualquier local de la app.
        </p>
      </div>
    </div>
  );
}

const previews = [BuscadorPreview, HorariosPreview, PuntosPreview] as const;

/** Grilla asimétrica: 5 / 7 arriba, y la tercera corrida a la derecha. */
const spans = ["md:col-span-5", "md:col-span-7", "md:col-span-7 md:col-start-6"] as const;

export default function HowItWorks() {
  return (
    <div>
      <Reveal>
        <Eyebrow>Cómo funciona</Eyebrow>
        <h2
          id="como-funciona-title"
          className="measure mt-5 text-display-lg font-semibold text-ink-900 dark:text-bone-100"
        >
          Tres pasos, y el turno ya está.
        </h2>
      </Reveal>

      <ol className="mt-12 grid gap-4 md:grid-cols-12 md:gap-5">
        {steps.map((step, index) => {
          const Preview = previews[index] ?? BuscadorPreview;
          return (
            <Reveal as="li" key={step.n} index={index} className={cn("block", spans[index])}>
              <StepCard n={step.n} title={step.title} body={step.body}>
                <Preview />
              </StepCard>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
