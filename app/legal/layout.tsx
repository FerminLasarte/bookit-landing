import type { ReactNode } from "react";

/** Layout de lectura para los legales: medida angosta y aire arriba y abajo. */
export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="py-16 md:py-24">
      <div className="wrap">{children}</div>
    </div>
  );
}
