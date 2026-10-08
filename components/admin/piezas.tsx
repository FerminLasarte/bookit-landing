import type { ReactNode } from "react";
import Badge from "@/components/ui/Badge";
import Superficie, { type Tono } from "@/components/ui/Superficie";
import { estados } from "@/content/admin";
import type { EstadoSuscripcion } from "@/lib/admin/datos";
import { cn } from "@/lib/utils";

/*
 * Las piezas del panel. Salen del kit (`Superficie`, `Badge`) y suman lo que
 * un tablero necesita y el sitio no: cifras, bloques con título y tablas.
 */

/** El encabezado de una pantalla del panel: título y una bajada corta. */
export function Encabezado({ titulo, bajada, children }: { titulo: string; bajada?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-title font-bold text-fg md:text-[2rem] md:leading-tight md:tracking-[-0.02em]">
          {titulo}
        </h1>
        {bajada && <p className="mt-1 text-small text-muted">{bajada}</p>}
      </div>
      {children}
    </div>
  );
}

/**
 * Un número protagonista. Sobre los tonos de tile `muted` no llega a AA
 * (Superficie): la etiqueta y el detalle van en `fg` con menos peso.
 */
export function Cifra({
  etiqueta,
  valor,
  detalle,
  tono = "niebla",
}: {
  etiqueta: string;
  valor: ReactNode;
  detalle?: ReactNode;
  tono?: Tono;
}) {
  return (
    <Superficie tone={tono} className="flex flex-col gap-1 p-5">
      <span className="text-small font-medium text-fg/80">{etiqueta}</span>
      <span className="num text-[2rem] leading-none font-extrabold tracking-[-0.03em] text-fg">{valor}</span>
      {detalle && <span className="text-micro text-fg/80">{detalle}</span>}
    </Superficie>
  );
}

/** Una grilla de cifras que se acomoda al ancho. */
export function Cifras({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{children}</div>;
}

/** Un bloque de contenido con su título: lo que se lee, en `surface`. */
export function Bloque({
  titulo,
  bajada,
  children,
  className,
}: {
  titulo: string;
  bajada?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Superficie tone="surface" className={cn("p-5 md:p-6", className)}>
      <h2 className="text-body font-bold text-fg">{titulo}</h2>
      {bajada && <p className="mt-0.5 text-small text-muted">{bajada}</p>}
      <div className="mt-4">{children}</div>
    </Superficie>
  );
}

/** El estado de una suscripción, en el color de lo que significa. */
export function EstadoBadge({ estado }: { estado: EstadoSuscripcion }) {
  const { label, tono } = estados[estado] ?? { label: estado, tono: "atencion" as const };
  return (
    <Badge
      className={cn(
        tono === "bien" && "bg-fg/8 text-fg",
        tono === "atencion" && "bg-accent/20 text-accent-fg",
        tono === "mal" && "bg-danger/12 text-danger",
      )}
    >
      {label}
    </Badge>
  );
}

/** Una etiqueta neutra para un dato corto: el nivel, el canal. */
export function Dato({ children }: { children: ReactNode }) {
  return <Badge className="bg-fg/6 text-fg">{children}</Badge>;
}

/**
 * Una tabla que en el teléfono se desliza de costado en su caja, en vez de
 * empujar la página.
 */
export function Tabla({ columnas, children }: { columnas: string[]; children: ReactNode }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 md:-mx-6 md:px-6">
      <table className="w-full min-w-[40rem] border-collapse text-left text-small">
        <thead>
          <tr className="border-b border-line text-micro text-muted">
            {columnas.map((c) => (
              <th key={c} scope="col" className="py-2 pr-4 font-semibold whitespace-nowrap last:pr-0">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-line [&>tr:last-child]:border-0 [&_td]:py-3 [&_td]:pr-4 [&_td]:align-middle [&_td:last-child]:pr-0">
          {children}
        </tbody>
      </table>
    </div>
  );
}

/** Lo que dice una lista sin filas. */
export function Vacio({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-small text-muted">{children}</p>;
}

/**
 * Barras verticales chicas, una por valor. Sin librería: son treinta barras
 * sin ejes, y una dependencia traería su propia tipografía.
 */
export function Barras({
  valores,
  etiquetas,
  alto = "h-32",
}: {
  valores: number[];
  etiquetas: string[];
  alto?: string;
}) {
  const maximo = Math.max(1, ...valores);
  return (
    <div className={cn("flex items-end gap-[3px]", alto)} role="img" aria-label={etiquetas.map((e, i) => `${e}: ${valores[i]}`).join(", ")}>
      {/* Con pocas barras, cada una tope de 3,5 rem: a todo el ancho de su
          columna, seis meses eran seis bloques. */}
      {valores.map((v, i) => (
        <div key={etiquetas[i]} className="flex h-full flex-1 items-end justify-center">
          <div
            title={`${etiquetas[i]}: ${v}`}
            className={cn("w-full max-w-14 rounded-t-[4px]", v === 0 ? "bg-fg/8" : "bg-accent")}
            style={{ height: v === 0 ? "2px" : `${Math.max(6, (v / maximo) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  );
}
