import Link from "next/link";
import type { ReactNode } from "react";

type Size = "sm" | "md" | "lg";
type Variant = "primary" | "ink" | "glass" | "quiet";

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-6 text-xs",
  md: "h-[50px] px-8 text-sm",
  lg: "h-[60px] px-10 text-base",
};

/**
 * Cada variante define: cómo se ve en reposo, de qué color entra el panel de hover,
 * y de qué color queda el texto entrante (que siempre tiene que contrastar con el panel).
 */
const variantClasses: Record<Variant, { base: string; panel: string; hoverText: string }> = {
  // CTA principal: ámbar de marca → invierte a papel con texto tinta.
  // El texto va en tinta y no en blanco: blanco sobre #D78A1D da 2,78:1 y no
  // pasa AA a 16px. Tinta sobre el mismo ámbar da 6,75:1 sin tocar la marca.
  primary: {
    base: "border-amber-500 bg-amber-500 text-ink-900",
    panel: "bg-cream-50",
    hoverText: "text-ink-900",
  },
  // CTA secundario sólido sobre papel: tinta → invierte a ámbar
  ink: {
    base: "border-ink-900 bg-ink-900 text-bone-100 dark:border-bone-100 dark:bg-bone-100 dark:text-ink-900",
    panel: "bg-amber-500",
    hoverText: "text-ink-900",
  },
  // Sobre el hero oscuro / imagen: vidrio → invierte a papel
  glass: {
    base: "border-white/20 bg-white/10 text-white backdrop-blur-md",
    panel: "bg-cream-50",
    hoverText: "text-ink-900",
  },
  // Terciario: sólo contorno, para acciones de bajo peso
  quiet: {
    base: "border-ink-900/15 bg-transparent text-ink-900 dark:border-white/20 dark:text-bone-100",
    panel: "bg-ink-900 dark:bg-bone-100",
    hoverText: "text-bone-100 dark:text-ink-900",
  },
};

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
  const v = variantClasses[variant];

  const isExternal = external ?? (!!href && /^(https?:|mailto:|tel:)/.test(href));

  const rootClasses = [
    "group relative inline-flex items-center justify-center overflow-hidden rounded-[48px] border font-bold",
    "transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-[1.02]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 dark:focus-visible:ring-offset-ink-900",
    "disabled:pointer-events-none disabled:opacity-55",
    "motion-reduce:transition-none motion-reduce:hover:scale-100",
    fullWidth ? "w-full" : "w-full md:w-auto",
    sizeClasses[size],
    v.base,
    className,
  ].join(" ");

  const inner = (
    <>
      {/* Panel de hover: entra desde arriba y "endereza" las esquinas */}
      <span className="absolute inset-0 z-0 overflow-hidden rounded-[48px]" aria-hidden="true">
        <span
          className={`absolute inset-0 h-full w-full -translate-y-[101%] rounded-[48px] ${v.panel} transition-all duration-500 ease-[cubic-bezier(0.4,0,0,1)] group-hover:translate-y-0 group-hover:rounded-none motion-reduce:transition-none`}
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
