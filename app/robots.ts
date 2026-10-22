import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Las invitaciones son personales, el endpoint no se indexa, el
        // panel es del equipo y la agenda es de cada local.
        disallow: ["/invite/", "/api/", "/admin", "/mi-local"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
