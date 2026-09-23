import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import Screen from "@/components/ui/Screen";
import Section from "@/components/ui/Section";
import Superficie from "@/components/ui/Superficie";
import { cierre } from "@/content/home";
import Abanico from "./Abanico";

export default function Cierre() {
  return (
    <Section id="cierre" title={cierre.title} lede={cierre.lede}>
      <Reveal className="mx-auto max-w-[66rem]">
        <Superficie tone="arena" className="px-4 pb-4 lg:aspect-2/1 lg:p-0">
          <Abanico
            className="h-80 overflow-hidden pt-10 lg:h-full lg:pt-12"
            pantallas={cierre.cascada.map((id) => (
              <Screen key={id} id={id} sizes="(min-width: 1024px) 12rem, 9rem" />
            ))}
          />

          {/* En móvil tapan el corte de la cascada; en escritorio flotan sobre su mitad de abajo. */}
          <div className="relative z-30 -mt-24 grid gap-4 lg:absolute lg:inset-x-10 lg:bottom-10 lg:mt-0 lg:grid-cols-2 lg:gap-6">
            {cierre.puertas.map((puerta, i) => (
              <div
                key={puerta.label}
                className="flex flex-col items-start rounded-card bg-surface p-7 text-left shadow-float"
              >
                <h3 className="text-title font-bold text-fg">{puerta.label}</h3>
                <p className="mt-2 text-pretty text-fg">{puerta.body}</p>
                <p className="mt-2 text-pretty text-small text-muted">{puerta.note}</p>
                {/* `mt-auto`: los dos botones apoyan en la misma línea. */}
                <div className="mt-auto pt-6">
                  <Button href={puerta.cta.href} variant={i === 0 ? "primary" : "secondary"}>
                    {puerta.cta.label}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Superficie>
      </Reveal>
    </Section>
  );
}
