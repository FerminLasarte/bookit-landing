import type { TipoHerramienta } from "@/components/ui/Herramienta";

/**
 * La herramienta que hace de cursor en cada sección, por su `id`: las de la
 * home y las de /descargar (que repite `locales`, con la misma herramienta).
 */
export const herramientaPorSeccion = {
  inicio: "tijera",
  "como-funciona": "peine",
  locales: "secador",
  puntos: "esmalte",
  testimonios: "navaja",
  faq: "brocha",
  cierre: "tijera",
  "por-dentro": "peine",
} as const satisfies Record<string, TipoHerramienta>;

/** Fuera de esas secciones, y en el resto de las rutas. */
export const herramientaPorDefecto: TipoHerramienta = "tijera";
