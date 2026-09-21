import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bookit — Turnos para belleza y cuidado personal",
    short_name: site.name,
    description:
      "Reservá turnos en barberías, peluquerías, manicura, estética, masajes y depilación de tu ciudad.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF9F5",
    theme_color: "#D78A1D",
    lang: "es-AR",
    categories: ["lifestyle", "beauty"],
    // Con extensión: Next sirve estos iconos como `/icon.png` y
    // `/apple-icon.png`. Sin ella los dos daban 404 — invisible en la página
    // (el `<head>` sí los linkea bien) pero rompía los iconos de la PWA
    // instalada, y metía un error de consola en cada carga.
    icons: [
      { src: "/icon.png", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
