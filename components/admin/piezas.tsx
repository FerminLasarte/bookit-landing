import type { ReactNode } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Superficie, { type Tono } from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { estados } from "@/content/admin";
import { enlaceDeTelefono } from "@/lib/admin/contacto";
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
  return <Badge tono={tono}>{label}</Badge>;
}

/** Una etiqueta neutra para un dato corto: el nivel, el canal. */
export function Dato({ children }: { children: ReactNode }) {
  return <Badge tono="neutro">{children}</Badge>;
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

/** Un renglón de una ficha: qué es y cuánto vale. Va dentro de un `<dl>`. */
export function Fila({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 text-small last:border-0">
      <dt className="text-muted">{etiqueta}</dt>
      <dd className="text-right text-fg">{children}</dd>
    </div>
  );
}

/** Un mail que abre el correo, o la raya si no hay. */
export function Mail({ email }: { email: string | null }) {
  return email ? <TextLink href={`mailto:${email}`}>{email}</TextLink> : "—";
}

/** Un teléfono que abre WhatsApp si el número da, si no llama (D4). La raya si no hay. */
export function Telefono({ numero }: { numero: string | null }) {
  if (!numero) return "—";
  const { href, whatsapp } = enlaceDeTelefono(numero);
  return (
    <TextLink href={href}>
      {numero}
      {whatsapp && " · WhatsApp"}
    </TextLink>
  );
}

export type ParamsDeLista = Record<string, string | undefined>;

/** El link a una lista del panel con otros parámetros. Los vacíos no van. */
export function aLista(base: string, actual: ParamsDeLista, cambios: ParamsDeLista) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...actual, ...cambios })) if (v) params.set(k, v);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

/** La página que pide la URL, desde 1. */
export const paginaPedida = (p: string | undefined) => Math.max(1, Number(p) || 1);

/**
 * La búsqueda de una lista: un GET a la misma página, así que funciona sin
 * JavaScript y queda en la URL. `conservar`: los filtros que siguen puestos.
 */
export function Busqueda({
  etiqueta,
  valor,
  conservar = {},
}: {
  etiqueta: string;
  valor?: string;
  conservar?: ParamsDeLista;
}) {
  return (
    <form className="flex flex-wrap gap-2" role="search">
      <label htmlFor="q" className="sr-only">
        Buscar por {etiqueta.toLowerCase()}
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={valor}
        placeholder={etiqueta}
        className="ring-focus min-h-11 min-w-0 flex-1 rounded-field border border-line bg-surface px-4 text-small text-fg placeholder:text-muted"
      />
      {Object.entries(conservar).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
      <Button type="submit" variant="secondary" size="compact">
        Buscar
      </Button>
    </form>
  );
}

/** Anterior y siguiente, si hay más de una página. `href` arma el link de una página. */
export function Paginas({ pagina, paginas, href }: { pagina: number; paginas: number; href: (p: number) => string }) {
  if (paginas <= 1) return null;
  return (
    <nav aria-label="Páginas" className="flex items-center justify-center gap-3 text-small">
      {pagina > 1 && (
        <Button href={href(pagina - 1)} variant="secondary" size="compact">
          Anterior
        </Button>
      )}
      <span className="text-muted">
        Página {pagina} de {paginas}
      </span>
      {pagina < paginas && (
        <Button href={href(pagina + 1)} variant="secondary" size="compact">
          Siguiente
        </Button>
      )}
    </nav>
  );
}
