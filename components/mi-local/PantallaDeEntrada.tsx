import type { ReactNode } from "react";
import Anchor from "@/components/ui/Anchor";
import Wordmark from "@/components/ui/Wordmark";
import { miLocal } from "@/content/mi-local";

/**
 * La entrada al panel, fuera del sitio (D4 del plan del panel): el logo de
 * Bookit, el título y lo que se hace ahí, sin nav ni footer. Para volver a la
 * web queda el logo y un enlace chico abajo.
 */
export default function PantallaDeEntrada({
  titulo,
  bajada,
  children,
}: {
  titulo: string;
  bajada: string;
  children: ReactNode;
}) {
  const { irALaWeb } = miLocal.entrada;

  return (
    <div className="flex min-h-dvh flex-col px-4 py-6 md:px-8">
      <Anchor href="/" aria-label={irALaWeb} className="ring-focus self-start rounded-pill">
        <Wordmark className="h-7 w-auto" />
      </Anchor>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-12 text-center">
        <div className="max-w-[32rem]">
          <h1 className="text-title font-bold text-fg md:text-[2rem] md:leading-tight md:tracking-[-0.02em]">{titulo}</h1>
          <p className="mt-2 text-body text-muted">{bajada}</p>
        </div>
        {children}
      </div>

      <Anchor href="/" className="ring-focus self-center rounded-pill text-small text-muted hover:text-fg">
        {irALaWeb}
      </Anchor>
    </div>
  );
}
