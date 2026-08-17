import type { Metadata } from "next";
import LegalDoc from "@/components/LegalDoc";
import { privacidad } from "@/content/legal";

export const metadata: Metadata = {
  title: privacidad.title,
  description: privacidad.intro,
  alternates: { canonical: `/legal/${privacidad.slug}` },
};

export default function PrivacidadPage() {
  return <LegalDoc doc={privacidad} />;
}
