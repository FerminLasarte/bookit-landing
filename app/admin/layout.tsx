import type { Metadata } from "next";
import type { ReactNode } from "react";

/* El panel no se indexa ni se sigue: además está cerrado en robots.ts. */
export const metadata: Metadata = {
  title: { default: "Panel", template: "%s | Panel de Bookit" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
