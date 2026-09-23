import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

/**
 * Toda sección de contenido pasa por acá: el aire que la separa de las demás
 * —el único límite del sitio— y su encabezado. Lo que va debajo es propio de
 * cada sección.
 */
export default function Section({
  id,
  title,
  lede,
  children,
  className,
}: {
  id: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const titleId = `${id}-titulo`;

  return (
    <section id={id} aria-labelledby={titleId} className={cn("py-24 md:py-36", className)}>
      <div className="wrap">
        <Reveal>
          <SectionHeader id={titleId} title={title} lede={lede} />
        </Reveal>
        <div className="mt-14 md:mt-20">{children}</div>
      </div>
    </section>
  );
}
