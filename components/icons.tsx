/**
 * SVG propios. Los iconos "de sección" no pueden venir de una librería (§3),
 * y nunca se usa emoji como iconografía (§4.7).
 * `lucide-react` queda reservado a utilitarios (mail, instagram, arrow, check, copy).
 */

type IconProps = {
  className?: string;
};

const base = "h-full w-full";

/*
 * SE FUERON `IconSlot` (un marco de calendario con un hueco marcado) e
 * `IconStore` (una persiana de local). Abrían las dos mitades de `Audiences` y
 * no los usaba nadie más. En la Fase C cada mitad pasó a abrir con la captura
 * real de la pantalla que le toca: donde había un símbolo de la cosa, va la
 * cosa. Es el mismo movimiento que borró el teléfono dibujado a mano de
 * `HowItWorks`, y el mismo criterio con el que la §3 octies le sacó el ícono a
 * cada beneficio de `/lista-espera` — un bloque que ya muestra lo que es no
 * necesita además un glifo que lo represente.
 *
 * Se borran en vez de quedarse sin lectores: un export que no usa nadie es la
 * forma más segura de que alguien lo use mal (§3 sexies, sobre los dos tokens
 * de sombra).
 */

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
