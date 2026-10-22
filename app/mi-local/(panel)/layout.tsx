import type { ReactNode } from "react";
import MarcoDelPanel from "@/components/mi-local/MarcoDelPanel";
import { leerMiLocal } from "@/lib/mi-local/agenda";

/*
 * Las pantallas de adentro del panel. Quién entra no se decide acá: el proxy
 * manda a entrar a quien no tiene sesión, y `leerMiLocal` (compartida con la
 * página por `cache`) manda a sin-local a quien no es dueño de un local.
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  return <MarcoDelPanel local={await leerMiLocal()}>{children}</MarcoDelPanel>;
}
