/**
 * SVG propios. Los iconos "de sección" no pueden venir de una librería (§3),
 * y nunca se usa emoji como iconografía (§4.7).
 * `lucide-react` queda reservado a utilitarios (mail, instagram, arrow, check, copy).
 */

type IconProps = {
  className?: string;
};

const base = "h-full w-full";

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
