"use client";

import { useEffect, useRef, useState } from "react";
import type { Nivel, TarjetaDePlan } from "@/lib/planes";
import { cn } from "@/lib/utils";
import PlanCard from "./PlanCard";

/*
 * Los planes, uno al lado del otro. En el teléfono es el carrusel de la app
 * (`paywall_plan_carousel.dart`): se elige deslizando, las vecinas asoman al
 * 92 % y atenuadas, y tocarlas las trae al frente. Desde `md` las tres entran
 * en fila al mismo tamaño y un clic elige; la elegida queda adelante igual.
 *
 * La card del frente **es** la elección: el botón vive abajo y contrata ésa.
 */

const ESCRITORIO = "(min-width: 768px)";

export default function CarruselDePlanes({
  tarjetas,
  elegido,
  onElegir,
}: {
  tarjetas: TarjetaDePlan[];
  elegido: Nivel;
  onElegir: (nivel: Nivel) => void;
}) {
  const pista = useRef<HTMLDivElement>(null);
  const indice = Math.max(
    0,
    tarjetas.findIndex((t) => t.nivel === elegido),
  );
  // La página al frente, en decimales, para que el achique acompañe al dedo.
  const [pagina, setPagina] = useState(indice);
  const [enFila, setEnFila] = useState(true);

  useEffect(() => {
    const consulta = matchMedia(ESCRITORIO);
    const actualizar = () => setEnFila(consulta.matches);
    actualizar();
    consulta.addEventListener("change", actualizar);
    return () => consulta.removeEventListener("change", actualizar);
  }, []);

  // En fila no hay scroll: el frente es el elegido.
  useEffect(() => {
    if (enFila) setPagina(indice);
  }, [enFila, indice]);

  // En el teléfono, arranca en el elegido sin animar.
  useEffect(() => {
    const el = pista.current;
    if (enFila || !el) return;
    const ancho = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
    el.scrollTo({ left: indice * ancho, behavior: "instant" });
    setPagina(indice);
    // Sólo al cambiar de modo: después manda el dedo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enFila]);

  useEffect(() => {
    const el = pista.current;
    if (enFila || !el) return;
    let quieto = 0;
    const alDeslizar = () => {
      const ancho = (el.firstElementChild as HTMLElement | null)?.offsetWidth || 1;
      const actual = el.scrollLeft / ancho;
      setPagina(actual);
      window.clearTimeout(quieto);
      quieto = window.setTimeout(() => {
        const t = tarjetas[Math.round(actual)];
        if (t) onElegir(t.nivel);
      }, 120);
    };
    el.addEventListener("scroll", alDeslizar, { passive: true });
    return () => {
      el.removeEventListener("scroll", alDeslizar);
      window.clearTimeout(quieto);
    };
  }, [enFila, tarjetas, onElegir]);

  const traer = (i: number) => {
    const t = tarjetas[i];
    if (!t) return;
    if (enFila) return onElegir(t.nivel);
    const el = pista.current;
    const ancho = (el?.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
    el?.scrollTo({ left: i * ancho, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={pista}
        className={cn(
          "flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-[7%] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "md:justify-center md:overflow-visible md:px-0",
        )}
      >
        {tarjetas.map((tarjeta, i) => {
          const distancia = Math.min(Math.abs(pagina - i), 1);
          const alFrente = distancia < 0.5;
          return (
            <div
              key={tarjeta.nivel}
              className="relative w-[86%] shrink-0 snap-center px-[0.39rem] py-[0.56rem] md:w-[21.6rem]"
            >
              <div
                className={cn("h-full", enFila && "transition-[scale,opacity] duration-[280ms] ease-out-cubic")}
                style={{ scale: 1 - distancia * 0.08, opacity: 1 - distancia * 0.45 }}
              >
                <PlanCard tarjeta={tarjeta} esTuPlan={tarjeta.esElActual} />
              </div>
              <button
                type="button"
                aria-pressed={alFrente}
                aria-label={`Elegir ${tarjeta.rotulo}`}
                onClick={() => traer(i)}
                className={cn(
                  "ring-focus absolute inset-x-[0.39rem] inset-y-[0.56rem] rounded-card",
                  alFrente && !enFila && "pointer-events-none",
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Dónde estás parado: con las vecinas asomando, el que entra tiene que saber que hay tres. */}
      <div aria-hidden="true" className="mt-[0.28rem] flex items-center justify-center gap-[0.28rem] md:hidden">
        {tarjetas.map((t, i) => (
          <span
            key={t.nivel}
            className={cn(
              "h-[0.43rem] rounded-pill transition-[width,background-color] duration-200",
              Math.round(pagina) === i ? "w-[0.97rem] bg-accent" : "w-[0.43rem] bg-fg/18",
            )}
          />
        ))}
      </div>
    </div>
  );
}
