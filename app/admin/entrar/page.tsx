import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import Superficie from "@/components/ui/Superficie";
import Wordmark from "@/components/ui/Wordmark";

export const metadata: Metadata = { title: "Entrar" };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <Section id="entrar" as="h1" title="Panel de Bookit" lede="Para el equipo. Entrá con tu cuenta de Google.">
      <Superficie tone="surface" className="mx-auto flex max-w-sm flex-col items-center gap-6 p-8">
        <Wordmark className="h-9 text-fg" />
        <form action="/admin/auth/google" method="post" className="w-full">
          <Button type="submit" className="w-full">
            Entrar con Google
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-center text-small text-danger">
            No pudimos entrar con Google. Probá de nuevo.
          </p>
        )}
      </Superficie>
    </Section>
  );
}
