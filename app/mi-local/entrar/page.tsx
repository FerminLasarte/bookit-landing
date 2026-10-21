import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Entrar from "@/components/planes/Entrar";
import Section from "@/components/ui/Section";
import { miLocal } from "@/content/mi-local";
import { leerSesion } from "@/lib/planes";

export const metadata: Metadata = { title: "Entrar" };

/** Entrar a la agenda. Sólo entrar: quien no tiene cuenta tampoco tiene local, y el alta está en /planes. */
export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await leerSesion()) redirect("/mi-local");
  const { error } = await searchParams;
  const { entrar } = miLocal;

  return (
    <Section id="entrar" as="h1" title={entrar.titulo} lede={entrar.bajada}>
      <Entrar error={(error && entrar.errores[error]) ?? null} destino="/mi-local" conAlta={false} />
    </Section>
  );
}
