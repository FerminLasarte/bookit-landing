/**
 * SVG propios. Los iconos "de sección" no pueden venir de una librería (§3),
 * y nunca se usa emoji como iconografía (§4.7).
 * `lucide-react` queda reservado a utilitarios (mail, instagram, arrow, check, copy).
 */

type IconProps = {
  className?: string;
};

const base = "h-full w-full";

/** Marco de calendario con un hueco marcado: "hay lugar". */
export function IconSlot({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className || base}>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="13" width="5" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}

/** Tijera — el rubro. */
export function IconShears({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className || base}>
      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 15.5 18.5 3M16 15.5 5.5 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Moneda con centro ámbar — los Puntos Bookit. */
export function IconPoints({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className || base}>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

/** Dos nodos unidos — el flujo de referidos. */
export function IconReferral({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className || base}>
      <circle cx="6" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="17" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8.5 8.75 15.5 15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Persiana de local. */
export function IconStore({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className || base}>
      <path
        d="M4 9.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 9.5 5.2 4.6A1 1 0 0 1 6.1 4h11.8a1 1 0 0 1 .9.6L21 9.5H3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9.5 20v-5.5h5V20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Instagram. Propio porque `lucide-react` quitó los iconos de marca en la v1.
 * Trazo de 1.5 para que combine con el resto de los utilitarios.
 */
export function IconInstagram({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className || base}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.75" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.25" cy="6.75" r="1.1" fill="currentColor" />
    </svg>
  );
}

/** Check dentro de un círculo — bullets de lista. */
export function IconCheck({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className || base}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m8 12.5 2.6 2.6L16 9.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
