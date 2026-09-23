import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import SectionHeader from "./SectionHeader";

/**
 * Toda sección de contenido pasa por acá: el aire que la separa de las demás
 * —el único límite del sitio— y su encabezado. Lo que va debajo es propio de
 * cada sección.
 *
 * Con `as="h1"` es el encabezado de una página: arranca a la altura del hero y
 * el título no espera al `Reveal`, que retrasaría el LCP.
 */
export default function Section({
  id,
  as = "h2",
  title,
  lede,
  actions,
  children,
  className,
}: {
  id: string;
  as?: "h1" | "h2";
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const titleId = `${id}-titulo`;
  const esPagina = as === "h1";

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(esPagina ? "pt-12 pb-24 md:pt-20 md:pb-36" : "py-24 md:py-36", className)}
    >
      <div className="wrap">
        <SectionHeader
          as={as}
          id={titleId}
          title={title}
          lede={lede}
          actions={actions}
          escalonado={!esPagina}
        />
        {children && <div className="mt-14 md:mt-20">{children}</div>}
      </div>
    </section>
  );
}
