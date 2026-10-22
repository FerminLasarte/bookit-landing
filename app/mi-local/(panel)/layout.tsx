import type { ReactNode } from "react";
import MarcoDelPanel from "@/components/mi-local/MarcoDelPanel";
import { leerLogoDelLocal, leerMiLocal } from "@/lib/mi-local/agenda";

/*
 * Las pantallas de adentro del panel. Quién entra no se decide acá: el proxy
 * manda a entrar a quien no tiene sesión, y `leerMiLocal` (compartida con la
 * página por `cache`) manda a sin-local a quien no es dueño de un local.
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const local = await leerMiLocal();
  return (
    <MarcoDelPanel local={local} logo={await leerLogoDelLocal(local.id)}>
      {children}
    </MarcoDelPanel>
  );
}
