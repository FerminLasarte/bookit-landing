import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Serif,
  JetBrains_Mono,
  Manrope,
} from "next/font/google";
import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { site } from "@/content/site";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
  variable: "--font-bricolage",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
});

/**
 * La tipografía de las cifras (§4.6.3).
 *
 * Los números no se escriben con la misma tipografía que el texto: un serif
 * editorial de un solo peso al lado del grotesk extrabold de los títulos hace
 * que cada cifra se lea como una pieza gráfica y no como texto más. Va en
 * `.num`, que es lo único que la usa.
 */
const instrument = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  variable: "--font-instrument",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["500"],
  variable: "--font-jetbrains",
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
      className={`${bricolage.variable} ${manrope.variable} ${instrument.variable} ${jetbrains.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <script
          type="application/ld+json"
          // JSON-LD estático: no hay input de usuario en este objeto.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Nav />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
