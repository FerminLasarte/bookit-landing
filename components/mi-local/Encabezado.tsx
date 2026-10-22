import type { ReactNode } from "react";

/** El encabezado de una pantalla del panel: el título, una bajada y la acción principal a la derecha. */
export default function Encabezado({ titulo, bajada, accion }: { titulo: string; bajada?: ReactNode; accion?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-title font-bold text-fg md:text-[2rem] md:leading-tight md:tracking-[-0.02em]">{titulo}</h1>
        {bajada && <p className="mt-1 text-body text-fg first-letter:uppercase">{bajada}</p>}
      </div>
      {accion}
    </header>
  );
}
