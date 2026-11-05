import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  aLista,
  Barras,
  Bloque,
  Cifra,
  Cifras,
  Encabezado,
  filasDeReparto,
  Ranking,
  Selector,
  Tabla,
  Vacio,
} from "@/components/admin/piezas";
import { canales, estadisticasAdmin, niveles } from "@/content/admin";
import { leerEstadisticas, type Estadisticas, type MedidaDeEstadisticas } from "@/lib/admin/datos";
import { diaYMesDe, hoy, mesYAnio, numero, pesos } from "@/lib/formato";
import { sumarDias } from "@/lib/mi-local/vista";

export const metadata: Metadata = { title: estadisticasAdmin.titulo };

const BASE = "/admin/estadisticas";
const { periodos } = estadisticasAdmin;

/**
 * Del período pedido, los días que van: hasta hoy inclusive. Los 12 meses van
 * desde el mismo día del año anterior más uno, como dice el contrato
 * (BooKit `docs/admin-panel.md`, sección 24).
 */
function periodoPedido(pedido: string | undefined) {
  const elegido = periodos.find((p) => p.valor === pedido) ?? periodos[1];
  const hasta = hoy();
  if (elegido.dias) return { elegido, desde: sumarDias(hasta, -(elegido.dias - 1)), hasta };
  const haceUnAnio = new Date(`${hasta}T12:00:00Z`);
  haceUnAnio.setUTCFullYear(haceUnAnio.getUTCFullYear() - 1);
  return { elegido, desde: sumarDias(haceUnAnio.toISOString().slice(0, 10), 1), hasta };
}

const conMayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

/** Las puntas del período: con el año sólo si cruza de un año al otro. */
function fechasDelPeriodo(desde: string, hasta: string): [string, string] {
  if (desde.slice(0, 4) === hasta.slice(0, 4)) return [diaYMesDe(desde), diaYMesDe(hasta)];
  const conAnio = (dia: string) => `${diaYMesDe(dia)} de ${dia.slice(0, 4)}`;
  return [conAnio(desde), conAnio(hasta)];
}

/**
 * Lo que dice una cifra debajo del número: el período anterior, o desde
 * cuándo hay datos si la medida empezó a guardarse adentro del período.
 */
function detalleDe(e: Estadisticas, medida: MedidaDeEstadisticas, escribir: (n: number) => string = numero): string {
  const desde = e.datos_desde[medida];
  if (desde && desde > e.anterior.desde) return estadisticasAdmin.hayDatosDesde(diaYMesDe(desde));
  return estadisticasAdmin.anterior(escribir(e.totales[medida].anterior));
}

/** Una medida de la serie en barras, con el primer y el último punto abajo. */
function Serie({ e, medida, titulo }: { e: Estadisticas; medida: MedidaDeEstadisticas; titulo: string }) {
  const copy = estadisticasAdmin;
  const etiqueta = (desde: string) => (e.serie_por === "dia" ? diaYMesDe(desde) : mesYAnio(desde));
  const valores = e.serie.map((p) => p[medida]);
  const sinNada = valores.every((v) => v === 0);
  const desde = e.datos_desde[medida];

  return (
    <Bloque titulo={`${titulo} ${e.serie_por === "dia" ? copy.porDia : copy.porMes}`}>
      {sinNada ? (
        <Vacio>{desde && desde > e.periodo.desde ? copy.hayDatosDesde(diaYMesDe(desde)) : copy.sinDatos}</Vacio>
      ) : (
        <>
          <Barras valores={valores} etiquetas={e.serie.map((p) => etiqueta(p.desde))} />
          <div className="mt-2 flex justify-between text-micro text-muted">
            <span>{etiqueta(e.periodo.desde)}</span>
            <span>{etiqueta(e.periodo.hasta)}</span>
          </div>
        </>
      )}
    </Bloque>
  );
}

function Seccion({ id, titulo, bajada, children }: { id: string; titulo: string; bajada?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <div>
        <h2 id={id} className="text-body font-bold text-fg">
          {titulo}
        </h2>
        {bajada && <p className="mt-0.5 text-small text-muted">{bajada}</p>}
      </div>
      {children}
    </section>
  );
}

/** Cómo le va a Bookit en un período, contra el anterior del mismo largo (docs/PLAN-ADMIN-V5.md, paso W). */
export default async function EstadisticasPage({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  const { periodo } = await searchParams;
  const { elegido, desde, hasta } = periodoPedido(periodo);
  const e = await leerEstadisticas(desde, hasta);
  const t = e.totales;
  const copy = estadisticasAdmin;
  const sinDato = { sin_dato: copy.locales.sinDato };
  const meses = e.prueba_al_pago.filter((m) => m.empezaron > 0 || m.pagan > 0).reverse();

  return (
    <div className="flex flex-col gap-8">
      <Encabezado
        titulo={copy.titulo}
        bajada={`${copy.delAl(...fechasDelPeriodo(e.periodo.desde, e.periodo.hasta))} ${copy.bajada}`}
      />

      <Selector
        etiqueta={copy.periodo}
        opciones={periodos.map((p) => ({
          clave: p.valor,
          label: p.label,
          href: aLista(BASE, {}, { periodo: p === periodos[1] ? undefined : p.valor }),
          elegida: p === elegido,
        }))}
      />

      <Seccion id="crecimiento" titulo={copy.crecimiento.titulo}>
        <Cifras>
          <Cifra tono="arena" etiqueta={copy.crecimiento.altas} valor={numero(t.altas.periodo)} detalle={detalleDe(e, "altas")} />
          <Cifra etiqueta={copy.crecimiento.bajas} valor={numero(t.bajas.periodo)} detalle={detalleDe(e, "bajas")} />
          <Cifra
            etiqueta={copy.crecimiento.cuentasNuevas}
            valor={numero(t.cuentas_nuevas.periodo)}
            detalle={detalleDe(e, "cuentas_nuevas")}
          />
          <Cifra
            etiqueta={copy.uso.clientesActivos}
            valor={numero(t.clientes_activos.periodo)}
            detalle={detalleDe(e, "clientes_activos")}
          />
        </Cifras>
        <div className="grid items-start gap-3 md:grid-cols-2">
          <Serie e={e} medida="altas" titulo={copy.crecimiento.serie} />
          <Bloque titulo={copy.pruebaAlPago.titulo} bajada={copy.pruebaAlPago.bajada}>
            {meses.length === 0 ? (
              <Vacio>{copy.pruebaAlPago.vacio}</Vacio>
            ) : (
              <Tabla columnas={[...copy.pruebaAlPago.columnas]} angosta>
                {meses.map((m) => (
                  <tr key={m.mes}>
                    <td>{conMayuscula(mesYAnio(m.mes))}</td>
                    <td className="num">{numero(m.empezaron)}</td>
                    <td className="num">{numero(m.pagan)}</td>
                  </tr>
                ))}
              </Tabla>
            )}
          </Bloque>
        </div>
      </Seccion>

      <Seccion id="uso" titulo={copy.uso.titulo}>
        <Cifras>
          <Cifra
            tono="arena"
            etiqueta={copy.uso.reservas}
            valor={numero(t.reservas.periodo)}
            detalle={`${copy.uso.reservasDetalle(numero(t.por_la_app.periodo), numero(t.de_mostrador.periodo))} · ${detalleDe(e, "reservas")}`}
          />
          <Cifra etiqueta={copy.uso.completadas} valor={numero(t.completadas.periodo)} detalle={detalleDe(e, "completadas")} />
          <Cifra
            etiqueta={copy.uso.canceladas}
            valor={numero(t.canceladas.periodo + t.canceladas_tarde.periodo)}
            // Antes del 5-nov las tarde figuran en `canceladas`: la suma de las dos siempre está completa.
            detalle={`${copy.uso.canceladasDetalle(numero(t.canceladas_tarde.periodo))} · ${copy.anterior(numero(t.canceladas.anterior + t.canceladas_tarde.anterior))}`}
          />
          <Cifra etiqueta={copy.uso.ausentes} valor={numero(t.ausentes.periodo)} detalle={detalleDe(e, "ausentes")} />
        </Cifras>
        <p className="-mt-1 text-micro text-muted">{copy.uso.turnosQueTocaban}</p>
        <Serie e={e} medida="reservas" titulo={copy.uso.serie} />
      </Seccion>

      <Seccion id="plata" titulo={copy.plata.titulo}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Cifra
            tono="arena"
            etiqueta={copy.plata.cobrado}
            valor={pesos(t.cobrado_suscripciones.periodo)}
            detalle={detalleDe(e, "cobrado_suscripciones", pesos)}
          />
          <Cifra etiqueta={copy.plata.ingreso} valor={pesos(e.hoy.ingreso_mensual_estimado)} detalle={copy.plata.ingresoDetalle} />
        </div>
        <Serie e={e} medida="cobrado_suscripciones" titulo={copy.plata.serie} />
      </Seccion>

      <Seccion id="locales" titulo={copy.locales.titulo} bajada={copy.locales.bajada}>
        <div className="grid items-start gap-3 md:grid-cols-2">
          <Bloque titulo={copy.locales.porNivel}>
            <Ranking filas={filasDeReparto(e.hoy.activos_por_nivel, { ...niveles, ...sinDato })} vacio={copy.locales.ninguno} />
          </Bloque>
          <Bloque titulo={copy.locales.porCanal}>
            <Ranking filas={filasDeReparto(e.hoy.activos_por_canal, { ...canales, ...sinDato })} vacio={copy.locales.ninguno} />
          </Bloque>
          <Bloque titulo={copy.locales.porLocalidad}>
            <Ranking filas={filasDeReparto(e.hoy.activos_por_localidad, sinDato)} vacio={copy.locales.ninguno} />
          </Bloque>
          <Bloque titulo={copy.locales.porCategoria}>
            <Ranking filas={filasDeReparto(e.hoy.activos_por_categoria, sinDato)} vacio={copy.locales.ninguno} />
          </Bloque>
        </div>
        <Bloque titulo={copy.locales.masTurnos}>
          <Ranking
            vacio={copy.locales.ninguno}
            filas={e.mas_turnos.map((l) => ({
              clave: l.id_comercio,
              label: (
                <Link href={`/admin/comercios/${l.id_comercio}`} className="ring-focus rounded-[4px] hover:underline">
                  {l.nombre}
                </Link>
              ),
              valor: l.turnos,
            }))}
          />
        </Bloque>
      </Seccion>
    </div>
  );
}
