import type { Metadata } from "next";
import Link from "next/link";
import { Bloque, Encabezado, EstadoBadge, Tabla, Vacio } from "@/components/admin/piezas";
import { canales, estadosAlta, motivosIncidencia, planes, reembolsos } from "@/content/admin";
import { leerCobros } from "@/lib/admin/datos";
import { fecha, fechaConAnio, haceCuanto, pesos } from "@/lib/admin/formato";

export const metadata: Metadata = { title: "Cobros" };

/** El link a la ficha de un local, o su nombre suelto si ya no existe. */
function AComercio({ id, nombre }: { id: string | null | undefined; nombre: string | null | undefined }) {
  if (!id) return <span className="text-muted">{nombre ?? "Sin local"}</span>;
  return (
    <Link href={`/admin/comercios/${id}`} className="ring-focus rounded-[4px] font-semibold text-fg hover:underline">
      {nombre ?? "Sin nombre"}
    </Link>
  );
}

/** Lo que hay que mirar de la plata: débitos que fallaron, altas a medias e incidencias. */
export default async function Cobros() {
  const c = await leerCobros();

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo="Cobros" bajada="Lo que necesita que alguien lo mire." />

      <Bloque
        titulo="Incidencias de pago abiertas"
        bajada="Plata de un turno que el webhook no pudo resolver solo. Salen en el mail de las 04:00 hasta que se cierran."
      >
        {c.incidencias_abiertas.length === 0 ? (
          <Vacio>No hay incidencias abiertas.</Vacio>
        ) : (
          <Tabla columnas={["Fecha", "Local", "Motivo", "Monto", "Reembolso", "Detalle"]}>
            {c.incidencias_abiertas.map((i) => (
              <tr key={`${i.creado_el}-${i.motivo}`}>
                <td className="whitespace-nowrap">{fecha(i.creado_el)}</td>
                <td>
                  <AComercio id={i.id_comercio} nombre={i.comercio} />
                </td>
                <td>{motivosIncidencia[i.motivo] ?? i.motivo}</td>
                <td className="num">{pesos(i.monto)}</td>
                <td>{reembolsos[i.reembolso] ?? i.reembolso}</td>
                <td className="text-muted">{i.detalle}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Bloque>

      <Bloque
        titulo="Suscripciones con problemas"
        bajada="En gracia, el local todavía aparece; cortado o suspendido, ya no."
      >
        {c.debitos_con_problemas.length === 0 ? (
          <Vacio>Todos los locales están al día.</Vacio>
        ) : (
          <Tabla columnas={["Local", "Estado", "Plan", "Cobra", "Venció"]}>
            {c.debitos_con_problemas.map((d) => (
              <tr key={d.id_comercio}>
                <td>
                  <AComercio id={d.id_comercio} nombre={d.nombre} />
                </td>
                <td>
                  <EstadoBadge estado={d.estado} />
                </td>
                <td>{planes[d.plan] ?? d.plan}</td>
                <td>{canales[d.canal] ?? d.canal}</td>
                <td className="whitespace-nowrap">
                  {fecha(d.vencimiento)} <span className="text-micro text-muted">({haceCuanto(d.vencimiento)})</span>
                </td>
              </tr>
            ))}
          </Tabla>
        )}
      </Bloque>

      <Bloque titulo="Altas a medias" bajada="Eligieron un plan de Mercado Pago y no autorizaron el débito, o lo cancelaron.">
        {c.altas_abandonadas.length === 0 ? (
          <Vacio>No hay altas a medias.</Vacio>
        ) : (
          <Tabla columnas={["Fecha", "Mail", "Plan", "Estado"]}>
            {c.altas_abandonadas.map((a) => (
              <tr key={`${a.email}-${a.creado_el}`}>
                <td className="whitespace-nowrap">{fecha(a.creado_el)}</td>
                <td>{a.email ?? "—"}</td>
                <td>{planes[a.plan] ?? a.plan}</td>
                <td>{estadosAlta[a.estado] ?? a.estado}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Bloque>

      <Bloque titulo="Últimos pagos de suscripción" bajada="Los 50 más recientes de Mercado Pago.">
        {c.ultimos_pagos.length === 0 ? (
          <Vacio>Todavía no hay pagos.</Vacio>
        ) : (
          <Tabla columnas={["Fecha", "Local", "Plan", "Pago de Mercado Pago"]}>
            {c.ultimos_pagos.map((p) => (
              <tr key={p.mp_payment_id}>
                <td className="whitespace-nowrap">{fechaConAnio(p.creado_el)}</td>
                <td>
                  <AComercio id={p.id_comercio} nombre={p.comercio} />
                </td>
                <td>{planes[p.plan] ?? p.plan}</td>
                <td className="num text-muted">{p.mp_payment_id}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Bloque>
    </div>
  );
}
