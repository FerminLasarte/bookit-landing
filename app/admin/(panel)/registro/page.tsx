import type { Metadata } from "next";
import { aLista, Bloque, Encabezado, paginaPedida, Paginas, Selector, Tabla, Vacio } from "@/components/admin/piezas";
import QueHizo from "@/components/admin/QueHizo";
import TextLink from "@/components/ui/TextLink";
import { acciones, registroAdmin } from "@/content/admin";
import { leerRegistro } from "@/lib/admin/datos";
import { leerVista } from "@/lib/admin/vista";
import { fecha, numero } from "@/lib/formato";

export const metadata: Metadata = { title: "Registro" };

const BASE = "/admin/registro";
const UUID = /^[0-9a-f-]{36}$/i;

type Params = { tipo?: string; local?: string; p?: string };

/**
 * Todo lo que hizo el equipo, también lo que no es de un local
 * (docs/PLAN-ADMIN-V5.md, pasos T y U): paginado, por tipo y por local, con
 * `admin_registro` (BooKit `docs/admin-panel.md`, sección 22).
 */
export default async function Registro({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const tipo = registroAdmin.tipos.find((t) => t.valor === params.tipo);
  const local = params.local && UUID.test(params.local) ? params.local : undefined;
  const pagina = paginaPedida(params.p);
  const { porPagina } = await leerVista();
  const { total, filas } = await leerRegistro({
    acciones: tipo?.acciones,
    idComercio: local,
    limite: porPagina,
    desde: (pagina - 1) * porPagina,
  });
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  const puestos = { tipo: tipo?.valor, local };
  const nombreDelLocal = local ? (filas[0]?.comercio ?? registroAdmin.esteLocal) : null;

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo={registroAdmin.titulo} bajada={registroAdmin.bajada} />

      <Selector
        etiqueta={registroAdmin.filtrar}
        opciones={[
          { clave: "todas", label: registroAdmin.todas, href: aLista(BASE, puestos, { tipo: undefined }), elegida: !tipo },
          ...registroAdmin.tipos.map((t) => ({
            clave: t.valor,
            label: t.label,
            href: aLista(BASE, puestos, { tipo: t.valor }),
            elegida: t === tipo,
          })),
        ]}
      />

      {nombreDelLocal && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-small">
          <span className="font-semibold text-fg">{registroAdmin.soloDe(nombreDelLocal)}</span>
          <TextLink href={aLista(BASE, puestos, { local: undefined })}>{registroAdmin.todosLosLocales}</TextLink>
        </p>
      )}

      <Bloque titulo={tipo?.label ?? registroAdmin.todas} bajada={`${numero(total)} ${total === 1 ? "acción" : "acciones"}`}>
        {filas.length === 0 ? (
          <Vacio>{tipo || local ? registroAdmin.vacioDelTipo : registroAdmin.vacio}</Vacio>
        ) : (
          <Tabla columnas={["Fecha", "Quién", "Qué", "Local", "Nota"]}>
            {filas.map((a, i) => (
              <tr key={`${a.creado_el}-${a.accion}-${i}`}>
                <td className="whitespace-nowrap">{fecha(a.creado_el)}</td>
                <td>{a.email ?? acciones.registro.sinCuenta}</td>
                <td>
                  <QueHizo accion={a} />
                </td>
                <td>
                  {a.id_comercio ? (
                    <span className="flex flex-col">
                      <TextLink href={`/admin/comercios/${a.id_comercio}`}>{a.comercio ?? "Sin nombre"}</TextLink>
                      {!local && (
                        <TextLink href={aLista(BASE, puestos, { local: a.id_comercio })} tone="quiet" className="text-micro">
                          {registroAdmin.verSolo}
                        </TextLink>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="text-muted">{a.detalle.nota}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Bloque>

      <Paginas pagina={pagina} paginas={paginas} href={(p) => aLista(BASE, puestos, { p: String(p) })} />
    </div>
  );
}
