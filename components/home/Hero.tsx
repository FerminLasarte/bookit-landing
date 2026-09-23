import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import SectionHeader from "@/components/ui/SectionHeader";
import { hero } from "@/content/home";
import HeroTelefonos from "./HeroTelefonos";
import RotatingWord from "./RotatingWord";

const listaDeRubros = new Intl.ListFormat("es-AR", { type: "disjunction" }).format(hero.rubros);

/*
 * Sin `Reveal`: está sobre el pliegue, y arrancar en opacidad cero retrasaría
 * el LCP hasta la hidratación.
 */
export default function Hero() {
  return (
    <section id="inicio" aria-labelledby="hero-titulo" className="overflow-x-clip pt-12 md:pt-20">
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
          actions={
            <>
              <Button href={hero.ctaCliente.href}>{hero.ctaCliente.label}</Button>
              <Button href={hero.ctaLocal.href} variant="secondary">
                {hero.ctaLocal.label}
              </Button>
            </>
          }
        />
        <p className="mx-auto mt-5 max-w-[40ch] text-center text-small text-muted">{hero.note}</p>

        <HeroTelefonos
          centro={<Screen id="inicio" eager sizes="(min-width: 768px) 20rem, 76vw" />}
          izquierda={<Screen id="horario" sizes="15rem" />}
          derecha={<Screen id="agenda" sizes="15rem" />}
        />
      </div>
    </section>
  );
}
