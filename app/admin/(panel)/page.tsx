import type { Metadata } from "next";
import Link from "next/link";
import ParaAtender from "@/components/admin/ParaAtender";
import { Cifra, Cifras, Encabezado } from "@/components/admin/piezas";
import { inicioAdmin } from "@/content/admin";
import { leerParaAtender, leerPulso } from "@/lib/admin/datos";
import { esteMesYElAnterior, numero, pesos } from "@/lib/formato";

export const metadata: Metadata = { title: inicioAdmin.titulo };

/**
 * El Inicio: arriba lo que pide una mano y abajo las cifras de hoy (locales,
 * gente, turnos y plata). Los gráficos y los repartos están en Estadísticas.
 */
export default async function Inicio() {
  const [p, paraAtender] = await Promise.all([leerPulso(), leerParaAtender()]);
  const { comercios: c, usuarios: u, turnos: t, plata, mes_en_curso: ahora, mes_anterior: antes } = p;
  // Los dos meses lado a lado, sin porcentaje: el en curso va hasta hoy (docs/PLAN-ADMIN.md).
  const meses = esteMesYElAnterior();

  return (
    <div className="flex flex-col gap-8">
      <Encabezado titulo={inicioAdmin.titulo} bajada={inicioAdmin.bajada} />

      <ParaAtender datos={paraAtender} />

      <section aria-labelledby="locales" className="flex flex-col gap-3">
        <h2 id="locales" className="text-body font-bold text-fg">
          Locales
        </h2>
        <Cifras>
          <Cifra
            tono="arena"
            etiqueta="Pagando"
            valor={numero(c.pagando)}
            detalle={`de ${numero(c.total)} locales · ${numero(c.cancelan_al_vencer)} no ${c.cancelan_al_vencer === 1 ? "renueva" : "renuevan"}`}
          />
          <Cifra etiqueta="En prueba" valor={numero(c.en_prueba)} detalle="todavía no cobraron" />
          <Cifra etiqueta="Cortados" valor={numero(c.cortados)} detalle="no aparecen en la app" />
          <Cifra
            etiqueta={`Altas en ${meses.este}`}
            valor={numero(ahora.altas)}
            detalle={`${numero(antes.altas)} en ${meses.anterior} · ${numero(ahora.bajas)} ${ahora.bajas === 1 ? "baja" : "bajas"} (${numero(antes.bajas)} en ${meses.anterior})`}
          />
        </Cifras>
      </section>

      <section aria-labelledby="uso" className="flex flex-col gap-3">
        <h2 id="uso" className="text-body font-bold text-fg">
          Uso
        </h2>
        <Cifras>
          <Cifra tono="arena" etiqueta="Turnos hoy" valor={numero(t.hoy)} detalle={`${numero(t.proximos_7d)} en los próximos 7 días`} />
          <Cifra
            etiqueta="Completados en el mes"
            valor={numero(t.completados_mes)}
            detalle={`de ${numero(ahora.reservas)} reservas en ${meses.este} (${numero(antes.reservas)} en ${meses.anterior})`}
          />
          <Cifra
            etiqueta="Clientes activos"
            valor={numero(u.activos_30d)}
            detalle="reservaron en 30 días"
          />
          <Cifra etiqueta="Cuentas" valor={numero(u.total)} detalle={`${numero(u.nuevos_30d)} nuevas en 30 días`} />
        </Cifras>
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
          <Cifra
            etiqueta="Cobrado en suscripciones"
            valor={pesos(plata.cobrado_suscripciones_mes)}
            detalle={`${numero(plata.pagos_suscripcion_mes)} ${plata.pagos_suscripcion_mes === 1 ? "pago" : "pagos"} de Mercado Pago · ${pesos(antes.cobrado_suscripciones)} en ${meses.anterior}`}
          />
          <Cifra
            etiqueta="Ingreso mensual estimado"
            valor={pesos(plata.ingreso_mensual_estimado)}
            detalle={`Lo que cobran los débitos de Mercado Pago, llevado a 30 días · ${numero(plata.locales_tienda)} por Apple o Google`}
          />
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
