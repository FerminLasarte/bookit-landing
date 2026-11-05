import type { Metadata } from "next";
import { aLista, Bloque, Encabezado, Selector, Tabla, Vacio } from "@/components/admin/piezas";
import QueHizo from "@/components/admin/QueHizo";
import TextLink from "@/components/ui/TextLink";
import { acciones, registroAdmin } from "@/content/admin";
import { leerEquipo } from "@/lib/admin/datos";
import { fecha } from "@/lib/formato";

export const metadata: Metadata = { title: "Registro" };

const BASE = "/admin/registro";

/**
 * Todo lo que hizo el equipo, también lo que no es de un local
 * (docs/PLAN-ADMIN-V5.md, paso T). Son las últimas 100 de `admin_equipo`: el
 * filtro por tipo va sobre esas, hasta que la base pagine (paso U).
 */
export default async function Registro({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const [{ tipo: pedido }, { acciones: registro }] = await Promise.all([searchParams, leerEquipo()]);
  const tipo = registroAdmin.tipos.find((t) => t.valor === pedido);
  const filas = tipo ? registro.filter((a) => tipo.acciones.includes(a.accion)) : registro;

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo={registroAdmin.titulo} bajada={registroAdmin.bajada} />

      <Selector
        etiqueta={registroAdmin.filtrar}
        opciones={[
          { clave: "todas", label: registroAdmin.todas, href: BASE, elegida: !tipo },
          ...registroAdmin.tipos.map((t) => ({
            clave: t.valor,
            label: t.label,
            href: aLista(BASE, {}, { tipo: t.valor }),
            elegida: t === tipo,
          })),
        ]}
      />

      <Bloque titulo={tipo?.label ?? registroAdmin.todas}>
        {filas.length === 0 ? (
          <Vacio>{registro.length === 0 ? registroAdmin.vacio : registroAdmin.vacioDelTipo}</Vacio>
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
                    <TextLink href={`/admin/comercios/${a.id_comercio}`}>{a.comercio ?? "Sin nombre"}</TextLink>
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
    </div>
  );
}
