import Link from "next/link";
import type { ReactNode } from "react";

type Size = "sm" | "md" | "lg";
type Variant = "primary" | "ink" | "glass" | "quiet";
/** Todo lo que no es el CTA principal comparte la animación de panel. */
type SecondaryVariant = Exclude<Variant, "primary">;

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-6 text-xs",
  md: "h-[50px] px-8 text-sm",
  lg: "h-[60px] px-10 text-base",
};

/**
 * Variantes secundarias. Cada una define: cómo se ve en reposo, de qué color
 * entra el panel de hover, y de qué color queda el texto entrante (que siempre
 * tiene que contrastar con el panel).
 */
const variantClasses: Record<SecondaryVariant, { base: string; panel: string; hoverText: string }> =
  {
    // CTA secundario sólido sobre papel: tinta → invierte a ámbar
    ink: {
      base: "border border-ink-900 bg-ink-950 text-bone-100 dark:border-bone-100 dark:bg-bone-100 dark:text-ink-900",
      panel: "bg-amber-500",
      hoverText: "text-ink-900",
    },
    // Sobre el hero oscuro / imagen: vidrio → invierte a papel
    glass: {
      base: "border border-white/20 bg-white/10 text-white backdrop-blur-md",
      panel: "bg-cream-50",
      hoverText: "text-ink-900",
    },
    // Terciario: sólo contorno, para acciones de bajo peso
    quiet: {
      base: "border border-ink-900/15 bg-transparent text-ink-900 dark:border-white/20 dark:text-bone-100",
      panel: "bg-ink-950 dark:bg-bone-100",
      hoverText: "text-bone-100 dark:text-ink-900",
    },
  };

/**
 * El CTA principal (§4.5).
 *
 * No es un rectángulo de color plano: es una cápsula con volumen. El degradé
 * vertical del ámbar de marca hace la luz, el `inset` blanco de arriba y el
 * marrón de abajo hacen el borde biselado, y la sombra ámbar difusa lo levanta
 * del papel. En hover sube 2px, la sombra crece, y en `active` vuelve a apoyar:
 * el botón se siente como un objeto físico que se puede apretar.
 *
 * El texto va en tinta y no en blanco: blanco sobre el ámbar de marca da 2,78:1
 * y no pasa AA a 16px.
 *
 * Contraste real de la tinta sobre el degradé, medido por franjas: la banda que
 * ocupan las mayúsculas va del 40% al 60% del alto, y ahí da **5,07 a 5,71:1**.
 * (El comentario anterior decía 6,75:1, que es el número contra el ámbar plano,
 * no contra este gradiente. El borde inferior baja a 4,08:1, pero ahí no hay
 * texto: la descendente más larga no llega.)
 *
 * Sin borde: `docs/MARCA.md` dice "Sombra o borde. Nunca los dos", y acá había
 * un borde de 1px bajo una sombra de 20px. El canto lo dibujan los dos `inset`.
 */
const primaryClasses = [
  "text-ink-900",
  "bg-[linear-gradient(180deg,var(--color-cta-luz)_0%,var(--color-amber-500)_52%,var(--color-cta-sombra)_100%)]",
  "shadow-cta",
  "transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
  "hover:-translate-y-0.5",
  "hover:shadow-cta-hover",
  "active:translate-y-0 active:scale-[0.985] active:duration-100",
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
].join(" ");

interface AnimatedButtonProps {
  text: string;
  href?: string; // omitir cuando es un <button>
  type?: "button" | "submit"; // si no hay href, renderiza <button>
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  size?: Size;
  variant?: Variant;
  fullWidth?: boolean;
  external?: boolean; // fuerza <a> (mailto:, tel:, instagram, stores)
  className?: string;
  /** Etiqueta accesible cuando el texto visible no alcanza. */
  ariaLabel?: string;
}

export default function AnimatedButton({
  text,
  href,
  type = "button",
  onClick,
  disabled = false,
  icon,
  size = "md",
  variant = "primary",
  fullWidth = false,
  external,
  className = "",
  ariaLabel,
}: AnimatedButtonProps) {
  const isPrimary = variant === "primary";

  const isExternal = external ?? (!!href && /^(https?:|mailto:|tel:)/.test(href));

  const rootClasses = [
    // Sin `border` acá: alcanzaba también al `primary`, que no lleva borde
    // (sombra o borde, nunca los dos). Cada variante secundaria declara el suyo.
    "group relative inline-flex items-center justify-center overflow-hidden rounded-pill font-bold",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 dark:focus-visible:ring-offset-ink-950",
    "disabled:pointer-events-none disabled:opacity-55",
    isPrimary
      ? primaryClasses
      : [
          "transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-[1.02]",
          "motion-reduce:transition-none motion-reduce:hover:scale-100",
          variantClasses[variant as SecondaryVariant].base,
        ].join(" "),
    fullWidth ? "w-full" : "w-full md:w-auto",
    sizeClasses[size],
    className,
  ].join(" ");

  const inner = isPrimary ? <PrimaryInner text={text} icon={icon} /> : (
    <SecondaryInner text={text} icon={icon} variant={variant as SecondaryVariant} />
  );

  if (href && !disabled) {
    if (isExternal) {
      return (
        <a
          href={href}
          aria-label={ariaLabel}
          className={rootClasses}
          {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} aria-label={ariaLabel} className={rootClasses}>
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
      className={rootClasses}
    >
      {inner}
    </button>
  );
}

/**
 * Las tres capas del CTA principal, de atrás hacia adelante:
 *
 *  1. El vidrio: una luz fija en la mitad de arriba. Es lo que le da la forma de
 *     cápsula pulida, y no se mueve nunca.
 *  2. El reflejo: un haz inclinado que cruza el botón cada 6 segundos. Es la
 *     animación que vive dentro del botón — corta, espaciada, imposible de
 *     confundir con un estado de carga.
 *  3. La luz de hover: un foco cálido que se enciende desde arriba cuando el
 *     puntero entra, para que el hover se sienta antes de leer el cambio.
 *
 * Ninguna capa toca el layout (sólo opacidad y transform), así que el texto
 * nunca se mueve de lugar.
 */
function PrimaryInner({ text, icon }: { text: string; icon?: ReactNode }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-pill bg-[linear-gradient(180deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0)_100%)]"
      />

      {/*
        Acá había un brillo que barría la cápsula cada 6s, para siempre, en
        todos los botones primarios del sitio. `docs/MARCA.md` (Movimiento):
        "nada gira esperando". El volumen ya lo hacen el biselado y la sombra,
        y la respuesta al puntero la hace el destello de hover de abajo: un
        brillo que se mueve solo no informaba nada, sólo pedía atención.
      */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_140%_at_50%_-20%,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0)_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
      />

      <span className="relative flex items-center gap-2.5 whitespace-nowrap">
        {icon && (
          // El ícono acompaña el hover con un empujón mínimo: 1px, lo justo
          // para que el conjunto se sienta vivo sin que el texto baile.
          <span className="flex transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-px group-active:translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
            {icon}
          </span>
        )}
        {text}
      </span>
    </>
  );
}

/** El panel que entra desde arriba y "endereza" las esquinas. */
function SecondaryInner({
  text,
  icon,
  variant,
}: {
  text: string;
  icon?: ReactNode;
  variant: SecondaryVariant;
}) {
  const v = variantClasses[variant];

  return (
    <>
      <span className="absolute inset-0 z-0 overflow-hidden rounded-pill" aria-hidden="true">
        <span
          className={`absolute inset-0 h-full w-full -translate-y-[101%] rounded-pill ${v.panel} transition-all duration-500 ease-[cubic-bezier(0.4,0,0,1)] group-hover:translate-y-0 group-hover:rounded-none motion-reduce:transition-none`}
        />
      </span>

      <span className="relative z-10 flex items-center gap-2.5 overflow-hidden">
        {/* Texto en reposo: cae y desaparece */}
        <span className="flex items-center gap-2.5 whitespace-nowrap transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[160%] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
          {icon}
          {text}
        </span>

        {/* Texto entrante: cae desde arriba y ocupa el lugar */}
        <span
          className={`absolute inset-0 flex -translate-y-[160%] items-center justify-center gap-2.5 whitespace-nowrap ${v.hoverText} transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 motion-reduce:hidden`}
          aria-hidden="true"
        >
          {icon}
          {text}
        </span>
      </span>
    </>
  );
}
