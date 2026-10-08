import type { ReactNode } from "react";
import AdminNav from "@/components/admin/AdminNav";

/*
 * El marco del panel. Quién entra no se decide acá: el proxy manda a
 * /admin/entrar a quien no tiene sesión, y cada lectura de `lib/admin/datos`
 * manda a /admin/sin-acceso a quien no es del equipo.
 */
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminNav />
      <div className="wrap py-8 md:py-12">{children}</div>
    </>
  );
}
