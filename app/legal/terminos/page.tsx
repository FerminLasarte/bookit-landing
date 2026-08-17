import type { Metadata } from "next";
import LegalDoc from "@/components/LegalDoc";
import { terminos } from "@/content/legal";

export const metadata: Metadata = {
  title: terminos.title,
  description: terminos.intro,
  alternates: { canonical: `/legal/${terminos.slug}` },
};

export default function TerminosPage() {
  return <LegalDoc doc={terminos} />;
}
