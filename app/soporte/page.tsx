import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Mail, Phone } from "lucide-react";
import Anchor from "@/components/ui/Anchor";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { IconInstagram } from "@/components/ui/icons";
import { soporte, type Canal } from "@/content/paginas";

export const metadata: Metadata = {
  title: "Soporte",
  description:
    "Cómo contactarnos por tu cuenta, la app o tus datos: email, Instagram y teléfono. Tiempos de respuesta y links a los legales de Bookit.",
  alternates: { canonical: "/soporte" },
};

const ICONO = "mx-auto size-5 text-muted";

const iconos: Record<Canal["id"], ReactNode> = {
  email: <Mail className={ICONO} strokeWidth={1.75} aria-hidden="true" />,
  instagram: <IconInstagram className={ICONO} />,
  telefono: <Phone className={ICONO} strokeWidth={1.75} aria-hidden="true" />,
};

export default function SoportePage() {
  const { tiempos, datos } = soporte;

  return (
    <Section id="soporte" as="h1" title={soporte.title} lede={soporte.lede}>
      <ul className="mx-auto grid max-w-[28rem] gap-4 lg:max-w-[60rem] lg:grid-cols-3">
        {soporte.canales.map((canal, index) => (
          <Reveal as="li" key={canal.id} index={index}>
            {/* La card entera es el link. */}
            <Anchor href={canal.href} className="ring-focus group block h-full rounded-card">
              <Superficie
                tone="surface"
                className="h-full p-7 text-center transition-colors duration-(--duration-chico) group-hover:border-fg/25"
              >
                {iconos[canal.id]}
                <p className="mt-4 text-small text-muted">{canal.label}</p>
                <p className="mt-1 font-bold [overflow-wrap:anywhere] text-fg">
                  <span className={canal.id === "telefono" ? "num" : undefined}>{canal.value}</span>
                </p>
                <p className="mx-auto mt-3 max-w-[26ch] text-pretty text-small text-muted">{canal.hint}</p>
              </Superficie>
            </Anchor>
          </Reveal>
        ))}
      </ul>

      <div className="mx-auto mt-20 grid max-w-[60rem] gap-12 md:mt-28 md:grid-cols-2 md:gap-16">
        <Reveal as="section">
          <h2 className="text-title font-bold text-fg">{tiempos.title}</h2>
          <ul className="mt-4 space-y-2 text-pretty text-small text-muted">
            {tiempos.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal as="section" index={1}>
          <h2 className="text-title font-bold text-fg">{datos.title}</h2>
          <p className="mt-4 text-pretty text-small text-muted">
            {datos.body}
            <TextLink href={datos.link.href}>{datos.link.label}</TextLink>.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
