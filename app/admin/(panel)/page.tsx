import type { Metadata } from "next";
import Link from "next/link";
import { Barras, Bloque, Cifra, Cifras, Encabezado } from "@/components/admin/piezas";
import { canales, niveles } from "@/content/admin";
import { leerPulso } from "@/lib/admin/datos";
import { fecha, numero, pesos } from "@/lib/admin/formato";

export const metadata: Metadata = { title: "Pulso" };

/** Cómo está la plataforma hoy: locales, gente, turnos y plata. */
export default async function Pulso() {
  const p = await leerPulso();
  const { comercios: c, usuarios: u, turnos: t, plata } = p;
  const dias = t.reservas_por_dia;
  const reservas30 = dias.reduce((s, d) => s + d.reservas, 0);

  return (
    <div className="flex flex-col gap-8">
      <Encabezado titulo="Pulso" bajada="Cómo está Bookit hoy. Los números se calculan al abrir la página." />

      <section aria-labelledby="locales" className="flex flex-col gap-3">
        <h2 id="locales" className="text-body font-bold text-fg">
          Locales
        </h2>
        <Cifras>
          <Cifra tono="arena" etiqueta="Pagando" valor={numero(c.pagando)} detalle={`de ${numero(c.total)} locales`} />
          <Cifra etiqueta="En prueba" valor={numero(c.en_prueba)} detalle="todavía no cobraron" />
          <Cifra etiqueta="Cortados" valor={numero(c.cortados)} detalle="no aparecen en la app" />
          <Cifra
            etiqueta="Altas en 30 días"
            valor={numero(c.altas_30d)}
            detalle={`${numero(c.bajas_30d)} bajas · ${numero(c.cancelan_al_vencer)} no renuevan`}
          />
        </Cifras>
        <div className="grid gap-3 md:grid-cols-2">
          <Bloque titulo="Activos por nivel" bajada="Al día o en gracia.">
            <Reparto valores={c.por_nivel} rotulos={niveles} />
          </Bloque>
          <Bloque titulo="Activos por canal de cobro">
            <Reparto valores={c.por_canal} rotulos={canales} />
          </Bloque>
        </div>
      </section>

      <section aria-labelledby="uso" className="flex flex-col gap-3">
        <h2 id="uso" className="text-body font-bold text-fg">
          Uso
        </h2>
        <Cifras>
          <Cifra tono="arena" etiqueta="Turnos hoy" valor={numero(t.hoy)} detalle={`${numero(t.proximos_7d)} en los próximos 7 días`} />
          <Cifra etiqueta="Completados en el mes" valor={numero(t.completados_mes)} />
          <Cifra
            etiqueta="Clientes activos"
            valor={numero(u.activos_30d)}
            detalle="reservaron en 30 días"
          />
          <Cifra etiqueta="Cuentas" valor={numero(u.total)} detalle={`${numero(u.nuevos_30d)} nuevas en 30 días`} />
        </Cifras>
        <Bloque
          titulo="Reservas por día"
          bajada={`${numero(reservas30)} en 30 días · ${numero(t.por_la_app_30d)} por la app y ${numero(t.de_mostrador_30d)} de mostrador`}
        >
          <Barras valores={dias.map((d) => d.reservas)} etiquetas={dias.map((d) => fecha(d.dia))} />
          <div className="mt-2 flex justify-between text-micro text-muted">
            <span>{fecha(dias[0]?.dia)}</span>
            <span>Hoy</span>
          </div>
        </Bloque>
      </section>

      <section aria-labelledby="plata" className="flex flex-col gap-3">
        <h2 id="plata" className="text-body font-bold text-fg">
          Plata
        </h2>
        <Cifras>
          <Cifra
            etiqueta="Cobraron los locales"
            valor={pesos(plata.cobrado_por_locales_mes)}
            detalle="por Mercado Pago, en el mes"
          />
          <Cifra etiqueta="Pagos de suscripción" valor={numero(plata.pagos_suscripcion_mes)} detalle="de Mercado Pago, en el mes" />
          <Cifra
            tono={plata.incidencias_abiertas > 0 ? "miel" : "niebla"}
            etiqueta="Incidencias abiertas"
            valor={numero(plata.incidencias_abiertas)}
            detalle={
              <Link href="/admin/cobros" className="ring-focus rounded-[4px] underline underline-offset-2">
                Ver en Cobros
              </Link>
            }
          />
        </Cifras>
      </section>
    </div>
  );
}

/** Un reparto en filas con su barra: cuántos de cada uno. */
function Reparto({ valores, rotulos }: { valores: Record<string, number>; rotulos: Record<string, string> }) {
  const filas = Object.entries(valores).sort((a, b) => b[1] - a[1]);
  const total = filas.reduce((s, [, n]) => s + n, 0);
  if (filas.length === 0) return <p className="text-small text-muted">Ninguno.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {filas.map(([clave, n]) => (
        <li key={clave} className="flex flex-col gap-1.5">
          <div className="flex justify-between text-small">
            <span className="font-semibold text-fg">{rotulos[clave] ?? clave}</span>
            <span className="num text-muted">{numero(n)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-pill bg-fg/6">
            <div className="h-full rounded-pill bg-accent" style={{ width: `${(n / total) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
