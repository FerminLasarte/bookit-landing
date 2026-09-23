import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import SectionHeader from "@/components/ui/SectionHeader";
import { hero } from "@/content/home";
import RotatingWord from "./RotatingWord";

const listaDeRubros = new Intl.ListFormat("es-AR", { type: "disjunction" }).format(hero.rubros);

/*
 * Sin `Reveal`: está sobre el pliegue, y arrancar en opacidad cero retrasaría
 * el LCP hasta la hidratación.
 */
export default function Hero() {
  return (
    <section aria-labelledby="hero-titulo" className="overflow-x-clip pt-12 md:pt-20">
      <div className="wrap">
        <SectionHeader
          as="h1"
          id="hero-titulo"
          title={
            <>
              {hero.title} <span className="sr-only">{listaDeRubros}</span>
              <span className="block text-accent-fg">
                <RotatingWord words={hero.rubros} />
              </span>
            </>
          }
          lede={hero.lede}
        />

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button href={hero.ctaCliente.href}>{hero.ctaCliente.label}</Button>
          <Button href={hero.ctaLocal.href} variant="secondary">
            {hero.ctaLocal.label}
          </Button>
        </div>
        <p className="mx-auto mt-5 max-w-[40ch] text-center text-small text-muted">{hero.note}</p>

        {/* Las dos caras del turno: quien reserva al centro, el local detrás. */}
        <div className="relative mx-auto mt-16 flex max-w-[56rem] justify-center md:mt-20">
          <Screen
            id="horario"
            sizes="15rem"
            className="absolute top-20 left-0 hidden w-60 -rotate-6 md:block lg:left-8"
          />
          <Screen
            id="agenda"
            sizes="15rem"
            className="absolute top-20 right-0 hidden w-60 rotate-6 md:block lg:right-8"
          />
          <Screen id="inicio" eager sizes="(min-width: 768px) 20rem, 76vw" className="relative w-[76vw] max-w-80" />
        </div>
      </div>
    </section>
  );
}
