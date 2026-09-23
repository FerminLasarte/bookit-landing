import type { Metadata } from "next";
import LegalDoc from "@/components/legal/LegalDoc";
import { botonArrepentimiento } from "@/content/legal";

export const metadata: Metadata = {
  title: botonArrepentimiento.title,
  description: botonArrepentimiento.intro,
  alternates: { canonical: `/legal/${botonArrepentimiento.slug}` },
};

export default function BotonDeArrepentimientoPage() {
  return <LegalDoc doc={botonArrepentimiento} />;
}
