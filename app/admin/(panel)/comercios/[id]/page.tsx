import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CambiarVisibilidad from "@/components/admin/CambiarVisibilidad";
import ExtenderPrueba from "@/components/admin/ExtenderPrueba";
import { Barras, Bloque, Dato, Encabezado, EstadoBadge, Fila, Mail, Tabla, Telefono, Vacio } from "@/components/admin/piezas";
import ResolverIncidencia from "@/components/admin/ResolverIncidencia";
import TextLink from "@/components/ui/TextLink";
import {
  acciones,
  canales,
  estados,
  estadosAlta,
  historia,
  motivosIncidencia,
  niveles,
  planes,
  reembolsos,
} from "@/content/admin";
import { leerComercio, type AccionDelEquipo, type FichaComercio } from "@/lib/admin/datos";
import { fecha, fechaConAnio, haceCuanto, hora, mes, numero, pesos } from "@/lib/formato";

export const metadata: Metadata = { title: "Comercio" };

const UUID = /^[0-9a-f-]{36}$/i;

/*
 * Cuándo va "Extender la prueba" (BooKit `docs/admin-panel.md`, sección 4):
 * en prueba, cobrada por nadie todavía o por Mercado Pago, empezada y sin
 * suspender ni dar de baja. La base rechaza lo demás igual.
 */
const CANALES_DE_LA_TIENDA = ["app_store", "play_store", "tienda"];
const sePuedeExtender = (c: FichaComercio) =>
  c.plan === "prueba" &&
  !CANALES_DE_LA_TIENDA.includes(c.canal) &&
  c.estado !== "pendiente" &&
  c.estado !== "suspendida" &&
  !c.dado_de_baja_el;

/*
 * Por qué un local visible igual no aparece: la regla de la base
 * (`_local_a_la_vista()`) pide además que esté al día o en gracia. La baja lo
 * deja suspendido, pero se dice como baja.
 */
function porQueNoSeVe(c: FichaComercio) {
  const { visibilidad } = acciones;
  if (c.dado_de_baja_el) return visibilidad.noSeVePorBaja;
  if (c.estado === "al_dia" || c.estado === "en_gracia") return null;
  return visibilidad.noSeVePorEstado((estados[c.estado]?.label ?? c.estado).toLowerCase());
}

/** Una fila del registro, en una frase. */
function queHizo(a: AccionDelEquipo) {
  const { registro } = acciones;
  switch (a.accion) {
    case "resolver_incidencia":
      return registro.resolvio(a.detalle.antes.id_pago_mp);
    case "extender_prueba":
      return registro.extendio(a.detalle.dias, fechaConAnio(a.detalle.despues.vencimiento));
    case "cambiar_visibilidad":
      return a.detalle.despues.visible ? registro.mostro : registro.oculto;
    default:
      // Una acción que la base ya anota y la web todavía no conoce: BooKit la suma primero.
      return <span className="text-muted">{(a as { accion: string }).accion}</span>;
  }
}

export default async function Comercio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const c = await leerComercio(id);
  if (!c) notFound();

  const activos = c.profesionales.filter((p) => p.esta_activo);
  const noSeVe = porQueNoSeVe(c);

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
          {!c.visible && <Dato>{acciones.visibilidad.oculto}</Dato>}
        </div>
      </Encabezado>

      <Bloque
        titulo={acciones.visibilidad.titulo}
        bajada={c.visible ? (noSeVe ?? acciones.visibilidad.seVe) : acciones.visibilidad.oculta}
      >
        <CambiarVisibilidad idComercio={c.id_comercio} visible={c.visible} noSeVe={noSeVe} />
      </Bloque>

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
          {sePuedeExtender(c) && (
            <div className="mt-3">
              <ExtenderPrueba idComercio={c.id_comercio} conDebito={c.tiene_debito_mp} noRenueva={c.cancela_al_vencer} />
            </div>
          )}
        </Bloque>

        <Bloque titulo="Dueño">
          <dl>
            <Fila etiqueta="Nombre">
              {c.duenio.id_usuario ? (
                <TextLink href={`/admin/personas/${c.duenio.id_usuario}`}>{c.duenio.nombre ?? "Ver su ficha"}</TextLink>
              ) : (
                (c.duenio.nombre ?? "—")
              )}
            </Fila>
            <Fila etiqueta="Mail">
              <Mail email={c.duenio.email} />
            </Fila>
            <Fila etiqueta="Teléfono">
              <Telefono numero={c.duenio.telefono} />
            </Fila>
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

      <Bloque titulo={historia.titulo} bajada={historia.bajada}>
        {c.cambios_de_estado.length === 0 ? (
          <Vacio>{historia.vacia}</Vacio>
        ) : (
          <ul className="flex flex-col">
            {c.cambios_de_estado.map((k, i) => (
              <li
                key={`${k.cambiado_el}-${i}`}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line py-2.5 text-small last:border-0"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <EstadoBadge estado={k.estado_anterior} />
                  <span aria-hidden className="text-muted">
                    →
                  </span>
                  <span className="sr-only">a</span>
                  <EstadoBadge estado={k.estado_nuevo} />
                  {k.por_el_equipo && <span className="text-micro text-muted">{historia.desdeElPanel}</span>}
                </span>
                <span className="num whitespace-nowrap text-muted">
                  {fechaConAnio(k.cambiado_el)} · {hora(k.cambiado_el)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Bloque>

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
          <Tabla columnas={["Fecha", "Motivo", "Monto", "Reembolso", "Detalle", ""]}>
            {c.incidencias.map((i) => (
              <tr key={i.id_pago_mp}>
                <td className="whitespace-nowrap">{fecha(i.creado_el)}</td>
                <td>{motivosIncidencia[i.motivo] ?? i.motivo}</td>
                <td className="num">{pesos(i.monto)}</td>
                <td>{i.resuelto_el ? "Resuelta" : (reembolsos[i.reembolso] ?? i.reembolso)}</td>
                <td className="text-muted">{i.detalle}</td>
                <td>{!i.resuelto_el && <ResolverIncidencia idPago={i.id_pago_mp} />}</td>
              </tr>
            ))}
          </Tabla>
        </Bloque>
      )}

      {c.acciones.length > 0 && (
        <Bloque titulo={acciones.registro.titulo} bajada={acciones.registro.bajada}>
          <Tabla columnas={["Fecha", "Quién", "Qué", "Nota"]}>
            {c.acciones.map((a) => (
              <tr key={`${a.creado_el}-${a.accion}`}>
                <td className="whitespace-nowrap">{fecha(a.creado_el)}</td>
                <td>{a.email ?? acciones.registro.sinCuenta}</td>
                <td>{queHizo(a)}</td>
                <td className="text-muted">{a.detalle.nota}</td>
              </tr>
            ))}
          </Tabla>
        </Bloque>
      )}
    </div>
  );
}
