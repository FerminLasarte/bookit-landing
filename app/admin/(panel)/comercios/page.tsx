import type { Metadata } from "next";
import Link from "next/link";
import { Bloque, Dato, Encabezado, EstadoBadge, Tabla, Vacio } from "@/components/admin/piezas";
import Button from "@/components/ui/Button";
import { canales, filtrosComercios, niveles, planes } from "@/content/admin";
import { leerComercios, type FiltroComercios } from "@/lib/admin/datos";
import { fecha, haceCuanto, numero } from "@/lib/formato";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Comercios" };

const POR_PAGINA = 50;

type Params = { q?: string; estado?: string; p?: string };

/** El link a esta misma lista con otros parámetros. */
function aLista(actual: Params, cambios: Params) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...actual, ...cambios })) if (v) params.set(k, v);
  const query = params.toString();
  return query ? `/admin/comercios?${query}` : "/admin/comercios";
}

export default async function Comercios({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const estado = filtrosComercios.some((f) => f.valor === params.estado)
    ? (params.estado as FiltroComercios)
    : undefined;
  const pagina = Math.max(1, Number(params.p) || 1);
  const { total, filas } = await leerComercios({
    busqueda: params.q,
    estado,
    limite: POR_PAGINA,
    desde: (pagina - 1) * POR_PAGINA,
  });
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo="Comercios" bajada={`${numero(total)} ${total === 1 ? "local" : "locales"}`} />

      <form className="flex flex-wrap gap-2" role="search">
        <label htmlFor="q" className="sr-only">
          Buscar por nombre del local o mail del dueño
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={params.q}
          placeholder="Nombre del local o mail del dueño"
          className="ring-focus min-h-11 min-w-0 flex-1 rounded-field border border-line bg-surface px-4 text-small text-fg placeholder:text-muted"
        />
        {estado && <input type="hidden" name="estado" value={estado} />}
        <Button type="submit" variant="secondary" size="compact">
          Buscar
        </Button>
      </form>

      <nav aria-label="Filtrar por estado" className="-mx-1 flex flex-wrap gap-1">
        {filtrosComercios.map((f) => {
          const elegido = (f.valor ?? undefined) === estado;
          return (
            <Link
              key={f.label}
              href={aLista(params, { estado: f.valor ?? undefined, p: undefined })}
              aria-current={elegido ? "true" : undefined}
              className={cn(
                "ring-focus flex min-h-10 items-center rounded-pill px-4 text-small font-semibold",
                elegido ? "bg-fg text-page" : "text-fg hover:bg-fg/6",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      <Bloque titulo="Locales" bajada="De los más nuevos a los más viejos.">
        {filas.length === 0 ? (
          <Vacio>No hay locales con ese filtro.</Vacio>
        ) : (
          <Tabla columnas={["Local", "Estado", "Plan", "Vence", "Turnos 30 d", "Último turno", "Alta"]}>
            {filas.map((c) => (
              <tr key={c.id_comercio}>
                <td>
                  <Link
                    href={`/admin/comercios/${c.id_comercio}`}
                    className="ring-focus block rounded-[4px] font-semibold text-fg hover:underline"
                  >
                    {c.nombre}
                  </Link>
                  <span className="text-micro text-muted">
                    {[c.localidad, c.email_duenio].filter(Boolean).join(" · ") || "Sin dueño"}
                  </span>
                </td>
                <td>
                  {c.dado_de_baja_el ? <Dato>De baja</Dato> : <EstadoBadge estado={c.estado} />}
                </td>
                <td className="whitespace-nowrap">
                  <span className="text-fg">
                    {niveles[c.nivel] ?? c.nivel} · {planes[c.plan] ?? c.plan}
                  </span>
                  <span className="block text-micro text-muted">{canales[c.canal] ?? c.canal}</span>
                </td>
                <td className="whitespace-nowrap">
                  {fecha(c.vencimiento)}
                  {c.cancela_al_vencer && <span className="block text-micro text-danger">No renueva</span>}
                </td>
                <td className="num">{numero(c.turnos_30d)}</td>
                <td className="whitespace-nowrap text-muted">{haceCuanto(c.ultimo_turno)}</td>
                <td className="whitespace-nowrap text-muted">{fecha(c.creado_el)}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Bloque>

      {paginas > 1 && (
        <nav aria-label="Páginas" className="flex items-center justify-center gap-3 text-small">
          {pagina > 1 && (
            <Button href={aLista(params, { p: String(pagina - 1) })} variant="secondary" size="compact">
              Anterior
            </Button>
          )}
          <span className="text-muted">
            Página {pagina} de {paginas}
          </span>
          {pagina < paginas && (
            <Button href={aLista(params, { p: String(pagina + 1) })} variant="secondary" size="compact">
              Siguiente
            </Button>
          )}
        </nav>
      )}
    </div>
  );
}
