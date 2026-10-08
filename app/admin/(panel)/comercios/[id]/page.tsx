import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Barras, Bloque, Dato, Encabezado, EstadoBadge, Tabla, Vacio } from "@/components/admin/piezas";
import TextLink from "@/components/ui/TextLink";
import { canales, estadosAlta, motivosIncidencia, niveles, planes, reembolsos } from "@/content/admin";
import { leerComercio } from "@/lib/admin/datos";
import { fecha, fechaConAnio, haceCuanto, mes, numero, pesos } from "@/lib/admin/formato";

export const metadata: Metadata = { title: "Comercio" };

const UUID = /^[0-9a-f-]{36}$/i;

/** Un renglón de una ficha: qué es y cuánto vale. */
function Fila({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 text-small last:border-0">
      <dt className="text-muted">{etiqueta}</dt>
      <dd className="text-right text-fg">{children}</dd>
    </div>
  );
}

export default async function Comercio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const c = await leerComercio(id);
  if (!c) notFound();

  const activos = c.profesionales.filter((p) => p.esta_activo);

  return (
    <div className="flex flex-col gap-6">
      <TextLink href="/admin/comercios" className="self-start text-small">
        ← Comercios
      </TextLink>

      <Encabezado
        titulo={c.nombre}
        bajada={[c.direccion, c.localidad, c.instagram && `@${c.instagram}`].filter(Boolean).join(" · ")}
      >
        <div className="flex flex-wrap gap-2">
          {c.dado_de_baja_el ? <Dato>De baja {fecha(c.dado_de_baja_el)}</Dato> : <EstadoBadge estado={c.estado} />}
          <Dato>{niveles[c.nivel] ?? c.nivel}</Dato>
          {c.es_fundador && <Dato>Fundador</Dato>}
        </div>
      </Encabezado>

      <div className="grid gap-3 md:grid-cols-2">
        <Bloque titulo="Suscripción">
          <dl>
            <Fila etiqueta="Plan">{planes[c.plan] ?? c.plan}</Fila>
            <Fila etiqueta="Cobra">{canales[c.canal] ?? c.canal}</Fila>
            <Fila etiqueta="Vence">
              {fechaConAnio(c.vencimiento)}
              {c.cancela_al_vencer && <span className="block text-micro text-danger">No renueva</span>}
            </Fila>
            <Fila etiqueta="Débito de Mercado Pago">{c.tiene_debito_mp ? "Activo" : "No"}</Fila>
            {c.alta && (
              <Fila etiqueta="Alta">
                {planes[c.alta.plan] ?? c.alta.plan} · {estadosAlta[c.alta.estado] ?? c.alta.estado}
              </Fila>
            )}
            <Fila etiqueta="En Bookit desde">{fechaConAnio(c.creado_el)}</Fila>
          </dl>
        </Bloque>

        <Bloque titulo="Dueño">
          <dl>
            <Fila etiqueta="Nombre">{c.duenio.nombre ?? "—"}</Fila>
            <Fila etiqueta="Mail">{c.duenio.email ?? "—"}</Fila>
            <Fila etiqueta="Teléfono">{c.duenio.telefono ?? "—"}</Fila>
            <Fila etiqueta="Último ingreso">{haceCuanto(c.duenio.ultimo_ingreso)}</Fila>
            <Fila etiqueta="Mercado Pago para señas">
              {!c.mercado_pago
                ? "Sin vincular"
                : c.mercado_pago.caida_el
                  ? `Se cayó el ${fecha(c.mercado_pago.caida_el)}`
                  : `Vinculado el ${fecha(c.mercado_pago.vinculado_el)}`}
            </Fila>
            <Fila etiqueta="Efectivo · puntos">
              {c.acepta_efectivo ? "Acepta" : "No acepta"} · {c.habilita_puntos ? "Suma puntos" : "Sin puntos"}
            </Fila>
          </dl>
        </Bloque>
      </div>

      <Bloque titulo="Turnos por mes" bajada="Reservados, sin las reservas de Mercado Pago que nadie pagó.">
        <Barras
          valores={c.turnos_por_mes.map((m) => m.reservados)}
          etiquetas={c.turnos_por_mes.map((m) => mes(m.mes))}
          alto="h-24"
        />
        <div className="mt-2 grid grid-cols-6 text-center text-micro text-muted">
          {c.turnos_por_mes.map((m) => (
            <span key={m.mes}>
              {mes(m.mes)}
              <span className="num block text-fg">
                {numero(m.completados)}/{numero(m.reservados)}
              </span>
            </span>
          ))}
        </div>
        <p className="mt-2 text-micro text-muted">Completados sobre reservados.</p>
      </Bloque>

      <div className="grid gap-3 md:grid-cols-2">
        <Bloque titulo="Profesionales" bajada={`${numero(activos.length)} activos`}>
          {c.profesionales.length === 0 ? (
            <Vacio>Sin profesionales.</Vacio>
          ) : (
            <ul className="flex flex-col">
              {c.profesionales.map((p, i) => (
                <li key={`${p.nombre}-${i}`} className="flex justify-between border-b border-line py-2.5 text-small last:border-0">
                  <span className={p.esta_activo ? "text-fg" : "text-muted line-through"}>{p.nombre}</span>
                  <span className="text-muted">{p.con_cuenta ? "Con cuenta" : "Sin cuenta"}</span>
                </li>
              ))}
            </ul>
          )}
        </Bloque>

        <Bloque titulo="Servicios">
          {c.servicios.length === 0 ? (
            <Vacio>Sin servicios.</Vacio>
          ) : (
            <ul className="flex flex-col">
              {c.servicios.map((s, i) => (
                <li key={`${s.nombre}-${i}`} className="flex justify-between gap-4 border-b border-line py-2.5 text-small last:border-0">
                  <span className={s.esta_activo ? "text-fg" : "text-muted line-through"}>{s.nombre}</span>
                  <span className="num whitespace-nowrap text-muted">
                    {pesos(s.precio)} · {s.duracion_minutos} min
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Bloque>
      </div>

      <Bloque titulo="Pagos de suscripción" bajada="Los de Mercado Pago. Los de Apple y Google están en RevenueCat.">
        {c.pagos_suscripcion.length === 0 ? (
          <Vacio>Sin pagos.</Vacio>
        ) : (
          <Tabla columnas={["Fecha", "Plan", "Pago de Mercado Pago"]}>
            {c.pagos_suscripcion.map((p) => (
              <tr key={p.mp_payment_id}>
                <td>{fechaConAnio(p.creado_el)}</td>
                <td>{planes[p.plan] ?? p.plan}</td>
                <td className="num text-muted">{p.mp_payment_id}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Bloque>

      {c.incidencias.length > 0 && (
        <Bloque titulo="Incidencias de pago">
          <Tabla columnas={["Fecha", "Motivo", "Monto", "Reembolso", "Detalle"]}>
            {c.incidencias.map((i) => (
              <tr key={`${i.creado_el}-${i.motivo}`}>
                <td className="whitespace-nowrap">{fecha(i.creado_el)}</td>
                <td>{motivosIncidencia[i.motivo] ?? i.motivo}</td>
                <td className="num">{pesos(i.monto)}</td>
                <td>{i.resuelto_el ? "Resuelta" : (reembolsos[i.reembolso] ?? i.reembolso)}</td>
                <td className="text-muted">{i.detalle}</td>
              </tr>
            ))}
          </Tabla>
        </Bloque>
      )}
    </div>
  );
}
