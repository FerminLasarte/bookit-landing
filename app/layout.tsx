import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/Footer";
import { site } from "@/content/site";
import "./globals.css";

/*
 * Una sola familia para todo (manual de marca §4). `--font-display` y
 * `--font-sans` apuntan a esta misma variable desde `globals.css`: el nombre
 * display se conserva porque lo usan los componentes, no porque haya dos
 * tipografías.
 *
 * Los cinco pesos son los que el manual declara disponibles. En la app la
 * fuente va empaquetada; acá va por `next/font`, que la self-hostea en el
 * build — no hay request a Google en runtime.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Bookit | Tu próximo turno a un clic",
    template: "%s | Bookit",
  },
  description:
    "Descargá la app oficial de Bookit para gestionar tus reservas en barberías, peluquerías y centros de estética de forma rápida y sencilla.",
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "es_AR",
    url: site.url,
    title: "Bookit | Tu próximo turno a un clic",
    description:
      "Barberías, peluquerías, uñas, depilación y estética de Tandil en una sola app. Reservá cuando se te ocurra.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bookit | Tu próximo turno a un clic",
    description:
      "Barberías, peluquerías, uñas, depilación y estética de Tandil en una sola app.",
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#D78A1D",
  colorScheme: "light dark",
};

/** JSON-LD. Sin `AggregateRating`: no hay reviews reales (§9). */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      email: site.email,
      sameAs: [site.instagram.url],
      address: {
        "@type": "PostalAddress",
        addressLocality: site.city,
        addressRegion: site.province,
        addressCountry: "AR",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${site.url}/#app`,
      name: site.name,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "iOS, Android",
      description:
        "App de reservas de turnos para barberías, peluquerías, manicura, estética, masajes y depilación.",
      publisher: { "@id": `${site.url}/#organization` },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "ARS",
        description: "Gratis para quienes sacan turnos.",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es-AR"
      className={jakarta.variable}
    >
      <body className="flex min-h-dvh flex-col">
        <script
          type="application/ld+json"
          // JSON-LD estático: no hay input de usuario en este objeto.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Nav />
        <main id="contenido" className="flex-1 pt-20 md:pt-24">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
