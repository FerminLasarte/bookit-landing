import { site } from "./site";

export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const navLinks: readonly NavLink[] = [
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Para locales", href: "/#locales" },
  { label: "Puntos", href: "/#puntos" },
  { label: "Planes", href: "/planes" },
  { label: "Soporte", href: "/soporte" },
] as const;

export const navCta = { label: "Descargá la app", href: "/descargar" } as const;

/** La puerta al panel del local: al lado del botón, para todos (hoja de ruta de `docs/PLAN-MI-LOCAL.md`). */
export const navPanel = { label: "Mi local", href: "/mi-local" } as const;

export const footerProducto: readonly NavLink[] = [
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Para locales", href: "/#locales" },
  { label: "Puntos Bookit", href: "/#puntos" },
  { label: "Lista VIP", href: "/lista-espera" },
  { label: "Planes", href: "/planes" },
  { label: "Descargar", href: "/descargar" },
] as const;

export const footerLegales: readonly NavLink[] = [
  { label: "Términos y Condiciones", href: "/legal/terminos" },
  { label: "Política de Privacidad", href: "/legal/privacidad" },
  { label: "Política de Cookies", href: "/legal/cookies" },
  { label: "Eliminación de cuenta y datos", href: "/legal/eliminar-cuenta" },
  { label: "Botón de arrepentimiento", href: "/legal/boton-de-arrepentimiento" },
  {
    label: "Defensa de las y los Consumidores",
    href: site.legal.consumerDefenseUrl,
    external: true,
  },
] as const;

/**
 * Lo que piden Apple y Google por usar sus badges: una vez en el sitio, donde
 * van los avisos legales. Cada línea aparece con el badge de su tienda.
 */
export const footerMarcas = [
  site.app.appStore &&
    "Apple y el logo de Apple son marcas de Apple Inc., registradas en EE. UU. y otros países. App Store es una marca de servicio de Apple Inc.",
  site.app.playStore && "Google Play y el logo de Google Play son marcas de Google LLC.",
].filter(Boolean);
