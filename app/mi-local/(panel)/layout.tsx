import type { ReactNode } from "react";
import MarcoDelPanel from "@/components/mi-local/MarcoDelPanel";
import { leerMiLugar } from "@/lib/mi-local/lugar";

/*
 * Las pantallas de adentro del panel. Quién entra no se decide acá: el proxy
 * manda a entrar a quien no tiene sesión, y `leerMiLugar` (compartida con la
 * página por `cache`) manda a sin-local a quien no tiene un lugar en ningún
 * local.
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  return <MarcoDelPanel lugar={await leerMiLugar()}>{children}</MarcoDelPanel>;
}
