import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import Anchor, { type AnchorProps } from "./Anchor";

type Variant = "primary" | "secondary";
type Size = "default" | "compact";

/*
 * El primario lleva tinta sobre el ámbar (5,27:1): el blanco de la app daría
 * 2,78:1. El secundario es una píldora llena y no un contorno, porque un borde
 * que sostiene solo un control necesita 3:1. MARCA, Divergencia 6.
 */
const variants: Record<Variant, string> = {
  primary: "bg-accent text-ink-900 hover:bg-accent-hover",
  secondary: "bg-fg text-page hover:bg-fg/85",
};

const sizes: Record<Size, string> = {
  default: "min-h-12 px-6 text-body",
  compact: "min-h-10 px-4 text-small",
};

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type Props =
  | (Common & Omit<AnchorProps, keyof Common>)
  | (Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Common>);

export default function Button({ variant = "primary", size = "default", className, ...props }: Props) {
  const classes = cn(
    "ring-focus magnetico inline-flex items-center justify-center gap-2 rounded-pill text-center font-semibold",
    "active:scale-(--scale-tap) motion-reduce:active:scale-100",
    "disabled:pointer-events-none disabled:opacity-55",
    variants[variant],
    sizes[size],
    className,
  );

  if (props.href !== undefined) return <Anchor {...props} data-magnetico className={classes} />;

  const { type = "button", ...rest } = props;
  return <button type={type} {...rest} data-magnetico className={classes} />;
}
