import type { ReactNode } from "react";
import MarcoDelAdmin from "@/components/admin/MarcoDelAdmin";

/*
 * El marco del panel. Quién entra no se decide acá: el proxy manda a
 * /admin/entrar a quien no tiene sesión, y cada lectura de `lib/admin/datos`
 * le cierra la sesión y manda a /admin/sin-acceso a quien no es del equipo.
 */
export default function PanelLayout({ children }: { children: ReactNode }) {
  return <MarcoDelAdmin>{children}</MarcoDelAdmin>;
}
