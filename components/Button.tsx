import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * El botón del sitio. Reemplaza a `AnimatedButton`.
 *
 * Es una pieza web propia, no una derivación de la app: decidido el 22/9/2026 y
 * declarado como divergencia en `docs/MARCA.md`. De la app se conserva la
 * paleta y la sensación al apretar; la forma se resolvió acá, porque el botón
 * de la app pone rótulo BLANCO sobre el ámbar y eso da 2,78:1 — la misma falla
 * que el brief pedía y que `docs/DECISIONES.md` §1.1 ya había rechazado.
 *
 * DOS VARIANTES, no cuatro. Medido sobre las 15 capturas, la app usa tres
 * niveles de énfasis y el tercero no es un botón: es un link de texto ámbar sin
 * contenedor. Así que `glass` y `quiet` se retiran, y `ink` se convierte en la
 * única alternativa. `quiet` tenía un solo uso en todo el sitio.
 *
 * PLANO, no biselado. El botón anterior era una cápsula con degradé, dos
 * `inset` de biselado, dos sombras externas, un destello radial de hover, un
 * `translate-y` de 2px y un panel que entraba en 500ms con el rótulo duplicado
 * en el DOM deslizándose 800ms. La tabla de Movimiento del manual da 180ms para
 * "algo chico cambia", y el dial `MOTION_INTENSITY` del contrato está en 3, que
 * es "hover y active, nada más". Sobre el degradé la tinta caía a 5,07-5,71:1
 * según la franja; sobre el ámbar plano da 5,27:1 parejo.
 *
 * CONTRASTE, medido contra el fondo real (§3 del manual):
 *
 *   acción            ink-900 sobre amber-500 ....... 5,27:1
 *                     ink-900 sobre amber-400 (hover) 5,74:1
 *   alternativa       bone-100 sobre ink-950 ........ 14,40:1
 *                     bone-100 sobre ink-800 (hover)  12,44:1
 *   alternativa/onDark ink-900 sobre bone-100 ....... 11,40:1
 *                     ink-900 sobre bone-300 (hover)  8,87:1
 *
 * Ojo con un número heredado: `DECISIONES.md` §1.1 decía que la tinta sobre el
 * ámbar daba 6,66:1. Son 5,27:1 — 6,66 es el número de `amber-500` sobre
 * `ink-950`, transpuesto. La decisión sigue en pie (5,27 > 4,5), el margen es
 * más chico de lo que el repo creía, y es lo que obliga a que el hover aclare.
 *
 * `onDark` declara la superficie, como hace `Eyebrow`. No se adivina: la
 * alternativa es una píldora sólida, y su tono tiene que ser el opuesto al de
 * la superficie o desaparece. Los cantos son complementarios y sobran — la
 * píldora tinta da 18,0:1 contra `cream-50` y 1,0:1 contra `marca-profunda`; la
 * de hueso, al revés. Esto es lo que retira `glass`, que sobre claro componía
 * blanco sobre `white/10` y daba 1,02:1 (el peor número del D1).
 */

type Variant = "primary" | "secondary";
type Size = "default" | "compact";

/**
 * Dos tamaños, no tres. El de 60px es el alto que mide el botón de la app, y
 * era el que ya usaban 13 de los 17 llamados. El compacto existe sólo para el
 * nav, que es el único lugar donde el botón convive con links de 15px.
 */
const sizeClasses: Record<Size, string> = {
  default: "h-15 px-10 text-base",
  compact: "h-10 px-6 text-xs",
};

/**
 * Cada variante declara reposo y hover. El hover de la acción ACLARA: ver
 * `--color-amber-400` en `globals.css`, oscurecer rompe AA.
 *
 * Sin borde en ninguna: las tres formas son superficies con relleno, y el manual dice
 * "sombra o borde, nunca los dos" — acá no hay ninguno de los dos, porque el
 * relleno ya separa (13,6:1 en el peor caso, que es la píldora tinta sobre el
 * lavado cálido).
 */
const variantClasses: Record<Variant, { onLight: string; onDark: string }> = {
  primary: {
    // El ámbar no cambia con el tema ni con la superficie: es el mismo hex
    // en claro, en oscuro y sobre lienzo (§10 del manual).
    onLight: "bg-amber-500 text-ink-900 hover:bg-amber-400",
    onDark: "bg-amber-500 text-ink-900 hover:bg-amber-400",
  },
  secondary: {
    // Sobre superficie: píldora tinta, que en tema oscuro invierte a hueso
    // porque una píldora oscura sobre página oscura no se ve.
    onLight: cn(
      "bg-ink-950 text-bone-100 hover:bg-ink-800",
      "dark:bg-bone-100 dark:text-ink-900 dark:hover:bg-bone-300",
    ),
    // Sobre lienzo `marca-profunda`: píldora hueso en LOS DOS temas, porque el
    // lienzo no cambia con el tema.
    onDark: "bg-bone-100 text-ink-900 hover:bg-bone-300",
  },
};

interface ButtonProps {
  text: string;
  href?: string; // omitir cuando es un <button>
  type?: "button" | "submit"; // si no hay href, renderiza <button>
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  size?: Size;
  variant?: Variant;
  /**
   * El botón se apoya sobre un lienzo `marca-profunda`. Lo declara quien lo
   * usa, igual que en `Eyebrow`: la alternativa tiene que invertir su tono o
   * desaparece, y el anillo de foco necesita el color real de atrás.
   */
  onDark?: boolean;
  fullWidth?: boolean;
  external?: boolean; // fuerza <a> (mailto:, tel:, instagram, stores)
  className?: string;
  /** Etiqueta accesible cuando el texto visible no alcanza. */
  ariaLabel?: string;
}

export default function Button({
  text,
  href,
  type = "button",
  onClick,
  disabled = false,
  icon,
  size = "default",
  variant = "primary",
  onDark = false,
  fullWidth = false,
  external,
  className,
  ariaLabel,
}: ButtonProps) {
  const isExternal = external ?? (!!href && /^(https?:|mailto:|tel:)/.test(href));

  const classes = cn(
    "inline-flex items-center justify-center gap-2.5 rounded-pill font-bold whitespace-nowrap",
    // 180ms: "algo chico cambia" en la tabla de Movimiento del manual. Sólo
    // `colors` y `transform`, que son las dos propiedades que no reflowean.
    //
    // La duración se lee del token como variable y no como `duration-chico`,
    // porque en Tailwind v4 `duration-*` no es un namespace de tema: sólo
    // acepta un número o un valor arbitrario. Es la razón por la que los cuatro
    // `--duration-*` de `globals.css` no los leía nadie (D6 de la auditoría).
    "transition-[color,background-color,transform] duration-[var(--duration-chico)] ease-out-cubic",
    // Tap del manual: con superficie se hunde a 0.97. Las tres formas tienen
    // superficie, así que ninguna usa la caída a opacidad 0.4.
    "active:scale-tap",
    "motion-reduce:transition-none motion-reduce:active:scale-100",
    // El anillo de foco necesita el color REAL de atrás para su primer tramo.
    // Sobre lienzo es `marca-profunda` en los dos temas.
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
    onDark
      ? "focus-visible:ring-offset-marca-profunda"
      : "focus-visible:ring-offset-cream-50 dark:focus-visible:ring-offset-ink-950",
    "disabled:pointer-events-none disabled:opacity-55",
    onDark ? variantClasses[variant].onDark : variantClasses[variant].onLight,
    sizeClasses[size],
    fullWidth ? "w-full" : "w-full md:w-auto",
    className,
  );

  const inner = (
    <>
      {icon}
      {text}
    </>
  );

  if (href && !disabled) {
    if (isExternal) {
      return (
        <a
          href={href}
          aria-label={ariaLabel}
          className={classes}
          {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} aria-label={ariaLabel} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={classes}
    >
      {inner}
    </button>
  );
}
