import type { TipoHerramienta } from "@/components/ui/Herramienta";

/** La herramienta que hace de cursor en cada sección de la home. */
export const herramientaPorSeccion = {
  inicio: "tijera",
  "como-funciona": "peine",
  locales: "secador",
  puntos: "esmalte",
  testimonios: "navaja",
  faq: "brocha",
  cierre: "tijera",
} as const satisfies Record<string, TipoHerramienta>;

/** Fuera de esas secciones, y en el resto de las rutas. */
export const herramientaPorDefecto: TipoHerramienta = "tijera";
