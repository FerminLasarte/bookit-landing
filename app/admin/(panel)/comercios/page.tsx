import type { Metadata } from "next";
import Link from "next/link";
import {
  aLista,
  Bloque,
  Busqueda,
  Dato,
  Encabezado,
  EstadoBadge,
  paginaPedida,
  Paginas,
  Tabla,
  Vacio,
} from "@/components/admin/piezas";
import { acciones, canales, filtrosComercios, niveles, planes } from "@/content/admin";
import { leerComercios, POR_PAGINA, type FiltroComercios } from "@/lib/admin/datos";
import { fecha, haceCuanto, numero } from "@/lib/formato";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Comercios" };

type Params = { q?: string; estado?: string; p?: string };

const BASE = "/admin/comercios";

export default async function Comercios({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const estado = filtrosComercios.some((f) => f.valor === params.estado)
    ? (params.estado as FiltroComercios)
    : undefined;
  const pagina = paginaPedida(params.p);
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

      <Busqueda etiqueta="Nombre del local o mail del dueño" valor={params.q} conservar={{ estado }} />

      <nav aria-label="Filtrar por estado" className="-mx-1 flex flex-wrap gap-1">
        {filtrosComercios.map((f) => {
          const elegido = (f.valor ?? undefined) === estado;
          return (
            <Link
              key={f.label}
              href={aLista(BASE, params, { estado: f.valor ?? undefined, p: undefined })}
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
                  <div className="flex flex-wrap gap-1">
                    {c.dado_de_baja_el ? <Dato>De baja</Dato> : <EstadoBadge estado={c.estado} />}
                    {!c.visible && <Dato>{acciones.visibilidad.oculto}</Dato>}
                  </div>
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

      <Paginas pagina={pagina} paginas={paginas} href={(p) => aLista(BASE, params, { p: String(p) })} />
    </div>
  );
}
