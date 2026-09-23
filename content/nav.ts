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
  { label: "Soporte", href: "/soporte" },
] as const;

export const navCta = { label: "Sumate a la lista VIP", href: "/lista-espera" } as const;

export const footerProducto: readonly NavLink[] = [
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Para locales", href: "/#locales" },
  { label: "Puntos Bookit", href: "/#puntos" },
  { label: "Lista VIP", href: "/lista-espera" },
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
