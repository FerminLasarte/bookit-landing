import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import Hairline from "@/components/Hairline";
import WaitlistForm from "@/components/WaitlistForm";
import { IconCheck } from "@/components/icons";
import { site } from "@/content/site";
import type { Audience } from "@/content/waitlist";

const title = "Tandil, tu forma de sacar turnos está por cambiar";
const description =
  "Anotate en la lista VIP y llevate 500 Puntos Bookit de regalo para tu primer turno. Barberías, uñas, depilación y más, todo en una sola app.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/lista-espera" },
  openGraph: {
    title: `Bookit | ${title}`,
    description,
    url: `${site.url}/lista-espera`,
  },
  twitter: {
    title: `Bookit | ${title}`,
    description:
      "Anotate en la lista VIP y llevate 500 Puntos Bookit de regalo para tu primer turno.",
  },
};

const beneficios = [
  "Te avisamos antes que a nadie cuando lancemos.",
  "500 Puntos Bookit para tu primer turno.",
  "Sin costo y podés darte de baja cuando quieras.",
] as const;

export default async function ListaEsperaPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  // `?tipo=local` preselecciona el público (§6.2).
  const initialAudience: Audience | null = tipo === "local" ? "local" : null;

  return (
    <div className="py-16 md:py-24">
      <div className="wrap">
        <div className="md:grid md:grid-cols-12 md:gap-10">
          <aside className="md:col-span-4">
            <Eyebrow>Lista VIP · {site.city}</Eyebrow>

            <ul className="mt-8 space-y-4">
              {beneficios.map((beneficio) => (
                <li key={beneficio} className="flex items-start gap-3">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
                  <span className="text-small text-ink-500 dark:text-bone-300">{beneficio}</span>
                </li>
              ))}
            </ul>

            <Hairline className="mt-10" />

            <p className="mt-8 max-w-[34ch] text-small text-ink-500 dark:text-bone-300">
              Estamos armando la lista de fundadores en {site.city}. Todavía no lanzamos: te
              escribimos en cuanto la app esté lista.
            </p>
          </aside>

          <div className="mt-10 md:col-span-7 md:col-start-6 md:mt-0">
            <WaitlistForm initialAudience={initialAudience} headingAs="h1" />
          </div>
        </div>
      </div>
    </div>
  );
}
