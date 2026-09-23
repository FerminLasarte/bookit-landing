import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TipoHerramienta = "tijera" | "peine" | "secador" | "esmalte" | "navaja" | "brocha";

/** Una hoja de la tijera, dibujada desde el eje. `lado` es -1 (arriba) o 1 (abajo). */
function Hoja({ lado }: { lado: 1 | -1 }) {
  return (
    <g style={{ transform: `rotate(calc(var(--apertura) * ${-lado}deg))` }}>
      <path d={`M0 ${0.9 * -lado} L-15 0 L0 ${2.6 * lado} Z`} />
      <path d={`M0 ${0.9 * -lado} L6 ${4.6 * -lado}`} fill="none" />
      <circle cx="10.5" cy={6 * -lado} r="3.8" />
    </g>
  );
}

/*
 * Cada herramienta se dibuja en horizontal, con la punta en el origen y el
 * mango hacia la derecha; el grupo de afuera la gira 45° para que apunte
 * arriba a la izquierda, como una flecha. El origen es la punta: el punto
 * exacto del click.
 */
const DIBUJOS: Record<TipoHerramienta, ReactNode> = {
  tijera: (
    <g transform="translate(15 0)">
      <Hoja lado={-1} />
      <Hoja lado={1} />
      <circle r="1" className="fill-fg" />
    </g>
  ),
  peine: (
    <>
      <path d="M3 0v5.5M5.7 0v5.5M8.4 0v5.5M11.1 0v5.5M13.8 0v5.5M16.5 0v5.5M19.2 0v5.5M21.9 0v5.5M24.6 0v5.5M27.3 0v5.5" fill="none" />
      <rect x="0" y="-3.5" width="30" height="3.5" rx="1.2" />
    </>
  ),
  secador: (
    <>
      <rect x="13" y="4" width="5.5" height="13" rx="2.5" transform="rotate(-8 15.75 4)" />
      <rect x="0" y="-2.8" width="8" height="5.6" rx="1" />
      <rect x="6" y="-6.5" width="19" height="13" rx="6.5" />
      <path d="M21.5 -3.5v7" fill="none" />
    </>
  ),
  esmalte: (
    <>
      <rect x="0" y="-2.2" width="14" height="4.4" rx="2.2" />
      <rect x="13.5" y="-3.6" width="3.5" height="7.2" rx="0.8" />
      <rect x="17" y="-7" width="14" height="14" rx="4" />
      <rect x="19.5" y="-4.5" width="9" height="9" rx="2.2" className="fill-accent" />
    </>
  ),
  navaja: (
    <>
      <rect x="15" y="-4.5" width="19" height="4.5" rx="2" />
      <path d="M0 0H17V-6.5H5Q0 -6.5 0 0Z" />
      <circle cx="17" cy="-2.2" r="0.9" className="fill-fg" />
    </>
  ),
  brocha: (
    <>
      <path d="M14 -2.4L32 -1.3Q33.6 0 32 1.3L14 2.4Z" />
      <rect x="9" y="-3.2" width="5.5" height="6.4" rx="0.8" />
      <path d="M0 0Q1.5 -4.2 9 -4.2V4.2Q1.5 4.2 0 0Z" className="fill-accent" />
    </>
  ),
};

/**
 * Una herramienta de peluquería o estética, en el trazo del sitio: tinta
 * sobre `surface`, así se lee sobre cualquier fondo. La tijera abre sus hojas
 * según `--apertura` (grados), que pone quien la usa.
 */
export default function Herramienta({ tipo, className }: { tipo: TipoHerramienta; className?: string }) {
  return (
    <svg
      viewBox="-8 -8 40 40"
      aria-hidden="true"
      className={cn(
        "size-10 fill-surface stroke-fg [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.5]",
        className,
      )}
    >
      <g transform="rotate(45)">{DIBUJOS[tipo]}</g>
    </svg>
  );
}
