import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CambiarFundador from "@/components/admin/CambiarFundador";
import CambiarVisibilidad from "@/components/admin/CambiarVisibilidad";
import DarCortesia from "@/components/admin/DarCortesia";
import ExtenderPrueba from "@/components/admin/ExtenderPrueba";
import { DetalleDePausa, MarcaDePausa, queCambioLaPausa } from "@/components/admin/Pausa";
import BarraDeAcciones from "@/components/admin/BarraDeAcciones";
import {
  Barras,
  Bloque,
  Dato,
  Encabezado,
  EstadoBadge,
  Fila,
  Mail,
  Selector,
  Tabla,
  Telefono,
  Vacio,
} from "@/components/admin/piezas";
import QueHizo from "@/components/admin/QueHizo";
import Reactivar from "@/components/admin/Reactivar";
import ResolverIncidencia from "@/components/admin/ResolverIncidencia";
import SumarFundador from "@/components/admin/SumarFundador";
import Suspender from "@/components/admin/Suspender";
import TextLink from "@/components/ui/TextLink";
import {
  acciones,
  canales,
  estados,
  estadosAlta,
  fichaAdmin,
  historia,
  motivosIncidencia,
  niveles,
  pausa,
  planes,
  porCiclo,
  reembolsos,
  type ParteDeLaFicha,
} from "@/content/admin";
import {
  leerComercio,
  type AccionDelEquipo,
  type CambioDeEstado,
  type CambioDePausa,
  type FichaComercio,
} from "@/lib/admin/datos";
import { fecha, fechaConAnio, haceCuanto, hora, mes, mesYAnio, numero, pesos } from "@/lib/formato";

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
 * Cuándo va "Dar días de cortesía" (sección 16): de Mercado Pago, con plan
 * pago, en gracia o cortado y sin dar de baja (D9 de la v3).
 */
const PLANES_PAGOS = ["semanal", "mensual", "anual"];
const sePuedeDarCortesia = (c: FichaComercio) =>
  c.canal === "mercado_pago" &&
  PLANES_PAGOS.includes(c.plan) &&
  (c.estado === "en_gracia" || c.estado === "cortada") &&
  !c.dado_de_baja_el;

/*
 * Cuándo va "Sumar como fundador" (BooKit `docs/admin-panel.md`, sección 12):
 * un local que nunca pagó y no se sumó antes. El que espera en `pendiente`
 * figura como de la tienda sin haber comprado nada, por eso entra igual. El
 * tope de 10 lo controla la base.
 */
const esDelLanzamiento = (c: FichaComercio) => c.acciones.some((a) => a.accion === "sumar_fundador");
const sePuedeSumarFundador = (c: FichaComercio) =>
  !c.dado_de_baja_el &&
  c.estado !== "suspendida" &&
  !esDelLanzamiento(c) &&
  (c.estado === "pendiente" ||
    (c.plan === "prueba" && !CANALES_DE_LA_TIENDA.includes(c.canal) && !c.tiene_debito_mp));

/**
 * El débito de Mercado Pago y lo que cobra (sección 19, D2 de la v4). Sin
 * monto, o con un ciclo que no conocemos, sólo "Activo".
 */
function debito(c: FichaComercio) {
  if (!c.tiene_debito_mp) return "No";
  const ciclo = c.plan_debito ? porCiclo[c.plan_debito] : undefined;
  return c.monto_debito !== null && ciclo ? `Activo · ${pesos(c.monto_debito)} ${ciclo}` : "Activo";
}

/*
 * Por qué un local visible igual no aparece, con los motivos que calcula la
 * base (`no_aparece_por`): la suscripción primero, que además no lo deja tomar
 * turnos, y la pausa del local. La baja lo deja suspendido, pero se dice como
 * baja. Que esté oculto ya lo dice el bloque.
 */
function porQueNoSeVe(c: FichaComercio) {
  const { visibilidad } = acciones;
  if (c.no_aparece_por.includes("estado")) {
    if (c.dado_de_baja_el) return visibilidad.noSeVePorBaja;
    if (c.estado === "suspendida") return visibilidad.noSeVePorSuspension;
    return visibilidad.noSeVePorEstado((estados[c.estado]?.label ?? c.estado).toLowerCase());
  }
  return c.no_aparece_por.includes("pausa") ? pausa.noSeVe : null;
}

/**
 * La historia de la ficha: los cambios de estado, los de la pausa y lo que
 * hizo el equipo, intercalados por fecha.
 */
type Hito = { cuando: string } & (
  | { estado: CambioDeEstado }
  | { pausa: CambioDePausa }
  | { accion: AccionDelEquipo }
);
const historiaDe = (c: FichaComercio): Hito[] =>
  [
    ...c.cambios_de_estado.map((k) => ({ cuando: k.cambiado_el, estado: k })),
    ...c.cambios_de_pausa.map((k) => ({ cuando: k.cambiado_el, pausa: k })),
    ...c.acciones.map((a) => ({ cuando: a.creado_el, accion: a })),
  ].sort((a, b) => b.cuando.localeCompare(a.cuando));

const parteElegida = (pedida: string | undefined): ParteDeLaFicha =>
  fichaAdmin.partes.find((p) => p.clave === pedida)?.clave ?? "resumen";

export default async function Comercio({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pestana?: string }>;
}) {
  const [{ id }, { pestana }] = await Promise.all([params, searchParams]);
  if (!UUID.test(id)) notFound();
  const c = await leerComercio(id);
  if (!c) notFound();

  const parte = parteElegida(pestana);
  const noSeVe = porQueNoSeVe(c);
  const delLanzamiento = esDelLanzamiento(c);
  const suspendido = c.estado === "suspendida";
  const deLaTienda = CANALES_DE_LA_TIENDA.includes(c.canal);
  const abiertas = c.incidencias.filter((i) => !i.resuelto_el).length;
  const base = `/admin/comercios/${c.id_comercio}`;

  return (
    <div className="flex flex-col gap-6">
      <TextLink href="/admin/comercios" className="self-start text-small">
        ← {fichaAdmin.volver}
      </TextLink>

      <Encabezado
        titulo={c.nombre}
        bajada={[c.direccion, c.localidad, c.instagram && `@${c.instagram}`].filter(Boolean).join(" · ")}
      >
        <div className="flex flex-wrap gap-2">
          {c.dado_de_baja_el ? <Dato>De baja {fecha(c.dado_de_baja_el)}</Dato> : <EstadoBadge estado={c.estado} />}
          <Dato>{niveles[c.nivel] ?? c.nivel}</Dato>
          {c.es_fundador && <Dato>{delLanzamiento ? acciones.lanzamiento.marca : "Fundador"}</Dato>}
          {!c.visible && <Dato>{acciones.visibilidad.oculto}</Dato>}
          <MarcaDePausa pausa={c.pausa} />
        </div>
      </Encabezado>

      <BarraDeAcciones etiqueta={fichaAdmin.acciones}>
        {sePuedeExtender(c) && (
          <ExtenderPrueba idComercio={c.id_comercio} conDebito={c.tiene_debito_mp} noRenueva={c.cancela_al_vencer} />
        )}
        {sePuedeDarCortesia(c) && (
          <DarCortesia
            idComercio={c.id_comercio}
            diasGracia={c.dias_gracia}
            conDebito={c.tiene_debito_mp}
            noRenueva={c.cancela_al_vencer}
          />
        )}
        {sePuedeSumarFundador(c) && <SumarFundador idComercio={c.id_comercio} />}
        {!c.dado_de_baja_el && (
          <CambiarFundador
            idComercio={c.id_comercio}
            esFundador={c.es_fundador}
            deLaTienda={deLaTienda}
            conDebito={c.tiene_debito_mp}
            delLanzamiento={delLanzamiento}
          />
        )}
        <CambiarVisibilidad idComercio={c.id_comercio} visible={c.visible} noSeVe={noSeVe} />
        {!c.dado_de_baja_el &&
          (suspendido ? (
            <Reactivar
              idComercio={c.id_comercio}
              vencimiento={c.vencimiento}
              noRenueva={c.cancela_al_vencer}
              deLaTienda={deLaTienda}
            />
          ) : (
            <Suspender idComercio={c.id_comercio} conDebito={c.tiene_debito_mp} deLaTienda={deLaTienda} />
          ))}
      </BarraDeAcciones>

      <div className="border-b border-line pb-3">
        <Selector
          etiqueta={fichaAdmin.pestanas}
          scroll={false}
          opciones={fichaAdmin.partes.map((p) => ({
            clave: p.clave,
            label:
              p.clave === "suscripcion" && abiertas > 0 ? (
                <>
                  {p.label}
                  <span className="num rounded-pill bg-danger px-1.5 text-micro text-page" title={fichaAdmin.abiertas(abiertas)}>
                    {abiertas}
                  </span>
                </>
              ) : (
                p.label
              ),
            href: p.clave === "resumen" ? base : `${base}?pestana=${p.clave}`,
            elegida: p.clave === parte,
          }))}
        />
      </div>

      {parte === "resumen" && <Resumen c={c} noSeVe={noSeVe} suspendido={suspendido} />}
      {parte === "suscripcion" && <Suscripcion c={c} />}
      {parte === "turnos" && <Turnos c={c} />}
      {parte === "equipo" && <EquipoYServicios c={c} />}
      {parte === "historia" && <Historia c={c} />}
    </div>
  );
}

/** Lo de todos los días: si se ve, si entra, con quién hablar y cómo le va. */
function Resumen({ c, noSeVe, suspendido }: { c: FichaComercio; noSeVe: string | null; suspendido: boolean }) {
  const { visibilidad, acceso } = acciones;
  const ultimo = c.turnos_por_mes.at(-1);

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Bloque titulo={visibilidad.titulo} bajada={c.visible ? (noSeVe ?? visibilidad.seVe) : visibilidad.oculta}>
        {c.pausa && <DetalleDePausa pausa={c.pausa} />}
      </Bloque>

      <Bloque
        titulo={acceso.titulo}
        bajada={c.dado_de_baja_el ? acceso.deBaja : suspendido ? acceso.suspendido : acceso.entra}
      />

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

      {ultimo && (
        <Bloque titulo={fichaAdmin.ultimoMes.titulo(mesYAnio(`${ultimo.mes}-01`))} bajada={fichaAdmin.ultimoMes.bajada}>
          <dl>
            <Fila etiqueta={fichaAdmin.ultimoMes.reservados}>{numero(ultimo.reservados)}</Fila>
            <Fila etiqueta={fichaAdmin.ultimoMes.completados}>{numero(ultimo.completados)}</Fila>
            <Fila etiqueta={fichaAdmin.ultimoMes.cancelados}>{numero(ultimo.cancelados)}</Fila>
          </dl>
        </Bloque>
      )}
    </div>
  );
}

/** El plan, quién cobra, los pagos y lo que salió mal. */
function Suscripcion({ c }: { c: FichaComercio }) {
  return (
    <div className="flex flex-col gap-3">
      <Bloque titulo="Suscripción">
        <dl>
          <Fila etiqueta="Plan">{planes[c.plan] ?? c.plan}</Fila>
          <Fila etiqueta="Cobra">{canales[c.canal] ?? c.canal}</Fila>
          <Fila etiqueta="Vence">
            {fechaConAnio(c.vencimiento)}
            {c.cancela_al_vencer && <span className="block text-micro text-danger">No renueva</span>}
          </Fila>
          <Fila etiqueta={acciones.fundador.precio}>
            {c.es_fundador ? acciones.fundador.conPrecio : acciones.fundador.deLista}
          </Fila>
          <Fila etiqueta="Débito de Mercado Pago">{debito(c)}</Fila>
          {c.alta && (
            <Fila etiqueta="Alta">
              {planes[c.alta.plan] ?? c.alta.plan} · {estadosAlta[c.alta.estado] ?? c.alta.estado}
            </Fila>
          )}
          <Fila etiqueta="En Bookit desde">{fechaConAnio(c.creado_el)}</Fila>
        </dl>
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
    </div>
  );
}

function Turnos({ c }: { c: FichaComercio }) {
  return (
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
  );
}

function EquipoYServicios({ c }: { c: FichaComercio }) {
  const activos = c.profesionales.filter((p) => p.esta_activo);
  return (
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
  );
}

/** Todo lo que le pasó al local, en una sola línea de tiempo. */
function Historia({ c }: { c: FichaComercio }) {
  const hitos = historiaDe(c);
  return (
    <Bloque titulo={historia.titulo} bajada={historia.bajada}>
      {hitos.length === 0 ? (
        <Vacio>{historia.vacia}</Vacio>
      ) : (
        <ul className="flex flex-col">
          {hitos.map((h, i) => (
            <li
              key={`${h.cuando}-${i}`}
              className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 border-b border-line py-2.5 text-small last:border-0"
            >
              {"estado" in h ? (
                <span className="flex flex-wrap items-center gap-2">
                  <EstadoBadge estado={h.estado.estado_anterior} />
                  <span aria-hidden className="text-muted">
                    →
                  </span>
                  <span className="sr-only">a</span>
                  <EstadoBadge estado={h.estado.estado_nuevo} />
                  {h.estado.por_el_equipo && <span className="text-micro text-muted">{historia.desdeElPanel}</span>}
                </span>
              ) : "pausa" in h ? (
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-fg">{queCambioLaPausa(h.pausa)}</span>
                  <span className="text-micro text-muted">{historia.delDuenio}</span>
                </span>
              ) : (
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-fg">
                      <QueHizo accion={h.accion} />
                    </span>
                    <span className="text-micro text-muted">{h.accion.email ?? acciones.registro.sinCuenta}</span>
                  </span>
                  {h.accion.detalle.nota && <span className="text-muted">{h.accion.detalle.nota}</span>}
                </span>
              )}
              <span className="num whitespace-nowrap text-muted">
                {fechaConAnio(h.cuando)} · {hora(h.cuando)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Bloque>
  );
}
