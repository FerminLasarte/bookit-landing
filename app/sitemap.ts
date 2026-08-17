import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/** Sólo páginas indexables: `/invite/*` es personal y va noindex. */
const routes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/lista-espera", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/descargar", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/soporte", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/legal/terminos", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/legal/privacidad", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/legal/cookies", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/legal/eliminar-cuenta", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/legal/boton-de-arrepentimiento", priority: 0.3, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${site.url}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
