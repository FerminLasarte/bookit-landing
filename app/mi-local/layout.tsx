import type { Metadata } from "next";
import type { ReactNode } from "react";

/* La agenda es de cada local: no se indexa ni se sigue. También está cerrada en robots.ts. */
export const metadata: Metadata = {
  title: { default: "Mi local", template: "%s | Mi local" },
  robots: { index: false, follow: false },
};

export default function MiLocalLayout({ children }: { children: ReactNode }) {
  return children;
}
