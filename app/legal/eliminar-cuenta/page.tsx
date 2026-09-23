import type { Metadata } from "next";
import LegalDoc from "@/components/legal/LegalDoc";
import { eliminarCuenta } from "@/content/legal";

export const metadata: Metadata = {
  title: eliminarCuenta.title,
  description: eliminarCuenta.intro,
  alternates: { canonical: `/legal/${eliminarCuenta.slug}` },
};

export default function EliminarCuentaPage() {
  return <LegalDoc doc={eliminarCuenta} />;
}
