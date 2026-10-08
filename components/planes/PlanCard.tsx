import Image, { type StaticImageData } from "next/image";
import { Check } from "lucide-react";
import { sufijoDeCiclo } from "@/content/planes";
import { pesos } from "@/lib/formato";
import type { Destaque, Nivel, TarjetaDePlan } from "@/lib/planes";
import { cn } from "@/lib/utils";
import local from "@/assets/emoji3d/local.png";
import corona from "@/assets/emoji3d/corona.png";
import equipo from "@/assets/emoji3d/equipo.png";

/*
 * Un plan, entero: qué es, cuánto sale y qué trae. Es la card del paywall de
 * la app (`plan_card.dart`) con sus medidas, pasadas a rem desde un iPhone
 * 17 Pro: la misma pieza con tres grados de vestimenta —sobria, marcada,
 * premium— que dice la base, y el emoji del nivel cortado por la esquina.
 *
 * Lo único que agrega la web es el precio de lista tachado al lado del
 * número cuando hay precio fundador: en la tienda no se puede mostrar.
 */

/** El emoji de cada nivel, el mismo de la app: el local, la corona y el equipo. */
const emojis: Record<Nivel, StaticImageData> = { esencial: local, pro: corona, equipo };

const vestimenta: Record<Destaque, string> = {
  sobrio: "card-plan-sobrio",
  marcado: "card-plan-marcado",
  premium: "card-plan-premium",
};

export default function PlanCard({ tarjeta, esTuPlan = false }: { tarjeta: TarjetaDePlan; esTuPlan?: boolean }) {
  const premium = tarjeta.destaque === "premium";
  // Sobre la oscura el texto es blanco: la card no cambia con el tema.
  const tinta = premium ? "text-white" : "text-fg";
  const tenue = premium ? "text-white/72" : "text-muted";
  // Al que ya lo contrató, "Recomendado" no le dice nada.
  const chip = esTuPlan ? "Tu plan" : tarjeta.distintivo;
  const tachado = tarjeta.precioLista !== tarjeta.precio;
  const porMes = tarjeta.plan === "anual" ? `${pesos(Math.round(tarjeta.precio / 12 / 100) * 100)} por mes` : null;

  return (
    <article
      aria-label={tarjeta.rotulo}
      className={cn(
        "relative isolate flex h-full min-h-[26.2rem] flex-col overflow-hidden rounded-card p-[1.125rem] text-left",
        vestimenta[tarjeta.destaque],
      )}
    >
      <Image
        src={emojis[tarjeta.nivel]}
        alt=""
        sizes="8rem"
        className="emoji-3d pointer-events-none absolute -top-[0.32rem] -right-[1.3rem] -z-10 size-[8rem] rotate-[9.2deg] select-none [--emoji-demora:250ms]"
      />

      {/* El nombre y el precio le dejan el costado al emoji; la bajada arranca debajo de él. */}
      <div className="min-h-[6.8rem] pr-[5.5rem]">
        {chip && (
          <span
            className={cn(
              "mb-2 inline-block rounded-pill border px-2 py-[0.2rem] text-[0.8rem] font-bold",
              premium ? "border-white/30 bg-white/14 text-white" : "border-accent/30 bg-accent/10 text-accent-fg",
            )}
          >
            {chip}
          </span>
        )}
        <h2 className={cn("truncate text-[1.35rem] leading-[1.1] font-extrabold tracking-[-0.025rem]", tinta)}>
          {tarjeta.rotulo}
        </h2>
        <p className="mt-[0.28rem] flex flex-wrap items-baseline gap-x-1.5">
          <span className={cn("num text-[min(2rem,8vw)] leading-[1.1] font-bold tracking-[-0.0625rem]", tinta)}>
            {pesos(tarjeta.precio)}
          </span>
          {tachado && (
            <s className={cn("num text-[0.87rem]", tenue)}>
              <span className="sr-only">Antes </span>
              {pesos(tarjeta.precioLista)}
            </s>
          )}
        </p>
        <p className={cn("text-[0.87rem]", tenue)}>{sufijoDeCiclo[tarjeta.plan]}</p>
        {porMes && <p className={cn("num mt-[0.17rem] text-[0.87rem] font-semibold", tenue)}>{porMes}</p>}
      </div>

      {tarjeta.bajada && (
        <p className={cn("mt-[0.42rem] text-[0.87rem] leading-[1.35]", tenue)}>{tarjeta.bajada}</p>
      )}

      {tarjeta.beneficios.length > 0 && (
        <ul className="mt-4 flex flex-col gap-[0.45rem]">
          {tarjeta.beneficios.map((beneficio) => (
            <li key={beneficio} className={cn("flex items-start gap-[0.45rem] text-[0.87rem] leading-[1.3]", tinta)}>
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-[1.08rem] shrink-0 items-center justify-center rounded-full",
                  premium ? "bg-white/16 text-white" : "bg-accent/12 text-accent-fg",
                )}
              >
                <Check className="size-[0.7rem]" strokeWidth={3.5} />
              </span>
              <span className={premium ? "opacity-92" : undefined}>{beneficio}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
