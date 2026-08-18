import AnimatedButton from "./AnimatedButton";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import { IconCheck, IconSlot, IconStore } from "./icons";
import { featuresCliente, featuresLocal } from "@/content/features";
import { cn } from "@/lib/utils";

/**
 * §6.1 — los dos públicos, en una sola pieza.
 *
 * Antes eran dos secciones de pantalla completa, una detrás de la otra, y la
 * comparación (que es el punto) quedaba a un scroll de distancia. Acá son las
 * dos mitades de un mismo objeto: mismo borde, mismo radio, sin `gap` entre
 * ellas. El corte de color es el que dice "son dos lados de lo mismo".
 *
 * En mobile se apilan, y el objeto sigue leyéndose como uno solo porque el
 * borde exterior nunca se parte.
 */

function Bullet({ onDark = false }: { onDark?: boolean }) {
  return (
    <IconCheck
      className={cn(
        "mt-0.5 h-4.5 w-4.5 shrink-0",
        onDark ? "text-amber-300" : "text-amber-600 dark:text-amber-300",
      )}
    />
  );
}

function Features({ items, onDark = false }: { items: readonly string[]; onDark?: boolean }) {
  return (
    <ul className="mt-8 space-y-4">
      {items.map((feature) => (
        <li key={feature} className="flex items-start gap-3.5">
          <Bullet onDark={onDark} />
          <span className={cn("text-small", onDark ? "text-bone-100" : "text-ink-900 dark:text-bone-100")}>
            {feature}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function Audiences() {
  return (
    <div>
      <Reveal className="md:max-w-[40rem]">
        <Eyebrow>Los dos lados del mostrador</Eyebrow>
        <h2
          id="publico-title"
          className="mt-5 text-display-lg font-semibold text-ink-900 dark:text-bone-100"
        >
          El mismo turno, mirado desde los dos lados.
        </h2>
      </Reveal>

      <Reveal index={1} className="mt-14">
        {/* Un solo contenedor, dos mitades: el borde exterior no se corta nunca */}
        <div className="overflow-hidden rounded-card border border-ink-900/10 dark:border-white/10">
          <div className="grid md:grid-cols-2">
            {/* ── Mitad clara: quien saca turnos ── */}
            <article
              id="clientes"
              aria-labelledby="clientes-title"
              className="flex flex-col border-b border-ink-900/10 bg-paper p-8 md:border-r md:border-b-0 md:p-12 dark:border-white/10 dark:bg-ink-800"
            >
              <IconSlot className="h-7 w-7 text-amber-600 dark:text-amber-300" />
              <Eyebrow className="mt-6">Para quien saca turnos</Eyebrow>
              <h3
                id="clientes-title"
                className="mt-3 font-display text-h3 font-semibold text-ink-900 md:text-[1.75rem] md:leading-[1.15] dark:text-bone-100"
              >
                Sacar turno debería llevar 30 segundos.
              </h3>

              <Features items={featuresCliente} />

              {/* `mt-auto`: las dos mitades apoyan el botón en la misma línea */}
              <div className="mt-auto pt-10">
                <AnimatedButton
                  text="Sumate a la lista VIP"
                  href="/lista-espera"
                  variant="ink"
                  size="md"
                />
              </div>
            </article>

            {/* ── Mitad oscura: comercios ── */}
            <article
              id="locales"
              aria-labelledby="locales-title"
              className="relative flex flex-col overflow-hidden bg-ink-900 p-8 md:p-12"
            >
              {/*
               * Dos capas de calor. Sobre papel el corte ya lo hace el color de
               * fondo; en dark, tinta sobre tinta casi no se distingue, y es el
               * lavado ámbar el que separa una mitad de la otra.
               */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(150deg,rgba(215,138,29,0.12)_0%,rgba(215,138,29,0.02)_45%,transparent_70%)]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 animate-aurora rounded-full bg-[radial-gradient(circle,rgba(215,138,29,0.2)_0%,rgba(215,138,29,0)_70%)]"
              />

              <div className="relative flex flex-1 flex-col">
                <IconStore className="h-7 w-7 text-amber-300" />
                <Eyebrow className="mt-6" onDark>
                  Para comercios
                </Eyebrow>
                <h3
                  id="locales-title"
                  className="mt-3 font-display text-h3 font-semibold text-bone-100 md:text-[1.75rem] md:leading-[1.15]"
                >
                  Tu agenda, sin idas y vueltas.
                </h3>

                <Features items={featuresLocal} onDark />

                <p className="mt-8 border-l-2 border-amber-500 pl-4 text-small text-bone-300">
                  <strong className="font-semibold text-amber-300">
                    Precio fundador de por vida.
                  </strong>{" "}
                  Cupos limitados para los primeros locales que se suman antes del lanzamiento.
                </p>

                <div className="mt-auto pt-10">
                  <AnimatedButton
                    text="Quiero mi lugar como fundador"
                    href="/lista-espera?tipo=local"
                    variant="glass"
                    size="md"
                  />
                </div>
              </div>
            </article>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
