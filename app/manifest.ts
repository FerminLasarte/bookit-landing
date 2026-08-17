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
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
