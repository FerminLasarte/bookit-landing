import Badge from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import Superficie, { type Tono } from "@/components/ui/Superficie";
import { mostrarTestimonios, sonDePrueba, testimonios, type Testimonio } from "@/content/testimonios";
import { cn } from "@/lib/utils";

/** Por posición: la alta, la ancha y las dos chicas. Sin `miel`: el ámbar de las comillas no se lee ahí. */
const CELDAS: readonly { tono: Tono; className?: string }[] = [
  { tono: "arena", className: "lg:row-span-2" },
  { tono: "niebla", className: "lg:col-span-2" },
  { tono: "niebla" },
  { tono: "arena" },
];

function Cita({ testimonio, tono, destacada }: { testimonio: Testimonio; tono: Tono; destacada: boolean }) {
  return (
    <Superficie as="figure" tone={tono} className="flex h-full flex-col p-8 md:p-10">
      <span aria-hidden="true" className="block h-8 text-display leading-none text-accent-fg">
        “
      </span>
      <blockquote
        className={cn("mt-4 text-pretty text-fg", destacada ? "text-title font-bold" : "text-body")}
      >
        {testimonio.cita}
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-8">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-ink-900"
        >
          {testimonio.nombre[0]}
        </span>
        <span className="text-small text-fg">
          <span className="block font-semibold">{testimonio.nombre}</span>
          {testimonio.rol}
        </span>
      </figcaption>
    </Superficie>
  );
}

export default function Testimonios() {
  if (!mostrarTestimonios) return null;

  return (
    <Section
      id="testimonios"
      title={testimonios.title}
      lede={
        <>
          {testimonios.lede}
          {sonDePrueba && (
            <span className="mt-4 flex justify-center">
              <Badge>Datos de prueba</Badge>
            </span>
          )}
        </>
      }
    >
      <div className="mx-auto grid max-w-[36rem] gap-6 lg:max-w-[66rem] lg:grid-cols-3">
        {testimonios.citas.map((testimonio, i) => {
          const celda = CELDAS[i % CELDAS.length]!;
          return (
            <Reveal key={testimonio.nombre} index={i} className={celda.className}>
              <Cita testimonio={testimonio} tono={celda.tono} destacada={i === 0} />
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
