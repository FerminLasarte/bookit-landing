import { Fragment, type ReactNode } from "react";
import TextLink from "@/components/ui/TextLink";
import { planes } from "@/content/planes";

/*
 * El pie del paywall de la app: enlaces chicos separados por una barra, para
 * lo que no es contratar. Son enlaces y no botones para no disputarle el peso
 * al botón de arriba, que es uno solo.
 */

export const enlaceDelPie =
  "ring-focus inline-flex min-h-11 items-center rounded-[4px] px-[0.34rem] text-[0.8rem] font-medium text-muted hover:text-fg";

export default function PieDelPaywall({ children }: { children: ReactNode[] }) {
  const enlaces = children.filter(Boolean);
  return (
    <nav aria-label="Más opciones" className="flex flex-wrap items-center justify-center">
      {enlaces.map((enlace, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span aria-hidden="true" className="text-[0.8rem] text-fg/20">
              |
            </span>
          )}
          {enlace}
        </Fragment>
      ))}
    </nav>
  );
}

/** Los términos y la privacidad: van al lado del botón de pago. */
export const legalesDelPie = [
  <TextLink key="terminos" href="/legal/terminos" tone="quiet" className={enlaceDelPie}>
    {planes.pie.terminos}
  </TextLink>,
  <TextLink key="privacidad" href="/legal/privacidad" tone="quiet" className={enlaceDelPie}>
    {planes.pie.privacidad}
  </TextLink>,
];
