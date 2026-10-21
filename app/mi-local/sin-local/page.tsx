import type { Metadata } from "next";
import BotonesDeDescarga from "@/components/abrir-app/BotonesDeDescarga";
import Salir from "@/components/mi-local/Salir";
import Section from "@/components/ui/Section";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";

export const metadata: Metadata = { title: "Sin local" };

/** Una cuenta que no es dueña de un local: la de un cliente, o la de un profesional del equipo. */
export default function SinLocalPage() {
  const copy = miLocal.sinLocal;

  return (
    <Section id="sin-local" as="h1" title={copy.titulo} lede={copy.bajada}>
      <div className="flex flex-col items-center gap-6">
        <BotonesDeDescarga />
        <TextLink href="/planes">{copy.alta}</TextLink>
        <Salir>{copy.otraCuenta}</Salir>
      </div>
    </Section>
  );
}
