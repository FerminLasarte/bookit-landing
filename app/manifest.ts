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
    /*
     * Los dos hex son de las piezas que NO ven el `@theme`: un manifiesto de
     * PWA es JSON, no CSS. Es la misma excepción inherente que `app/og/` y el
     * `themeColor` del `viewport`, y está declarada en el contrato.
     *
     * Lo que sí era deuda es el VALOR. `background_color` decía `#FBF9F5`, un
     * crema cálido que no es ningún token del sitio —`cream-50` es `#FBFCFD`,
     * con R-B = -2—, o sea un color huérfano de una paleta anterior. Es el
     * fondo del splash de la app instalada, y el splash tiene que ser el mismo
     * blanco con el que la página pinta su primer cuadro o hay un destello al
     * abrir. `theme_color` ya era el canónico (`amber-500`).
     */
    background_color: "#FBFCFD",
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
