import type { Metadata } from "next";
import Link from "next/link";
import LocalesDePersona from "@/components/admin/LocalesDePersona";
import { aLista, Bloque, Busqueda, Encabezado, paginaPedida, Paginas, Tabla, Vacio } from "@/components/admin/piezas";
import { leerPersonas, POR_PAGINA } from "@/lib/admin/datos";
import { fecha, haceCuanto, numero } from "@/lib/formato";

export const metadata: Metadata = { title: "Personas" };

type Params = { q?: string; p?: string };

const BASE = "/admin/personas";

/** Las cuentas de Bookit: clientes, dueños y profesionales (paso C de docs/PLAN-ADMIN.md). */
export default async function Personas({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const pagina = paginaPedida(params.p);
  const { total, filas } = await leerPersonas({
    busqueda: params.q,
    limite: POR_PAGINA,
    desde: (pagina - 1) * POR_PAGINA,
  });
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo="Personas" bajada={`${numero(total)} ${total === 1 ? "cuenta" : "cuentas"}`} />

      <Busqueda etiqueta="Mail o nombre" valor={params.q} />

      <Bloque titulo="Cuentas" bajada="De las más nuevas a las más viejas.">
        {filas.length === 0 ? (
          <Vacio>No hay cuentas con esa búsqueda.</Vacio>
        ) : (
          <Tabla columnas={["Persona", "Locales", "Alta", "Último ingreso"]}>
            {filas.map((p) => (
              <tr key={p.id_usuario}>
                <td>
                  <Link
                    href={`/admin/personas/${p.id_usuario}`}
                    className="ring-focus block rounded-[4px] font-semibold text-fg hover:underline"
                  >
                    {p.nombre ?? p.email ?? "Sin nombre"}
                  </Link>
                  {p.nombre && <span className="text-micro text-muted">{p.email}</span>}
                </td>
                <td>
                  <LocalesDePersona locales={p.locales} vacio="Cliente" />
                </td>
                <td className="whitespace-nowrap text-muted">{fecha(p.alta)}</td>
                <td className="whitespace-nowrap text-muted">{haceCuanto(p.ultimo_ingreso)}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Bloque>

      <Paginas pagina={pagina} paginas={paginas} href={(p) => aLista(BASE, params, { p: String(p) })} />
    </div>
  );
}
