import type { Metadata } from "next";
import LegalDoc from "@/components/LegalDoc";
import { cookies } from "@/content/legal";

export const metadata: Metadata = {
  title: cookies.title,
  description: cookies.intro,
  alternates: { canonical: `/legal/${cookies.slug}` },
};

export default function CookiesPage() {
  return <LegalDoc doc={cookies} />;
}
