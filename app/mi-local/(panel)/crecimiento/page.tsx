import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccionesDeCrecimiento from "@/components/mi-local/AccionesDeCrecimiento";
import Encabezado from "@/components/mi-local/Encabezado";
import ErrorDeLectura from "@/components/mi-local/ErrorDeLectura";
import { Opcion } from "@/components/mi-local/Opciones";
import {
  Clientes,
  CuandoSeLlena,
  Facturado,
  NoHechos,
  participacion,
  Ranking,
} from "@/components/mi-local/TarjetasDeCrecimiento";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { pesos } from "@/lib/formato";
import { leerEstadisticas, PERIODO_POR_DEFECTO, PERIODOS, totales } from "@/lib/mi-local/crecimiento";
import { leerPlanDelLocal } from "@/lib/mi-local/gestion";
import { leerLocalDelDuenio } from "@/lib/mi-local/lugar";

export const metadata: Metadata = { title: miLocal.crecimiento.titulo };

/*
 * Los números del local (fase 5, docs/PLAN-MI-LOCAL-FASE-5.md), como la
 * pestaña Crecimiento de la app. Es del dueño: `estadisticas_comercio` no
 * contesta a nadie más. El período y lo que muestra el gráfico van en la URL,
 * como el día de la agenda. Sin el historial en el plan, sólo el mes en curso,
 * con lo demás borroso (D4): la base no lo frena, lo dice `niveles`.
 */

type PageProps = { searchParams: Promise<{ meses?: string; ver?: string }> };

export default async function CrecimientoPage({ searchParams }: PageProps) {
  const pedido = await searchParams;
  const local = (await leerLocalDelDuenio()) ?? redirect("/mi-local");
  const copy = miLocal.crecimiento;

  const plan = await leerPlanDelLocal(local.suscripcion.nivel);
  const bloqueadoHasta = plan.estadisticasHistorial.incluida ? null : (plan.estadisticasHistorial.desde ?? copy.bloqueado.otroPlan);
  const elegido = PERIODOS.find((p) => String(p) === pedido.meses) ?? PERIODO_POR_DEFECTO;
  const meses = bloqueadoHasta ? 1 : elegido;
  const deIngresos = pedido.ver !== "turnos";

  // Lo que no se pudo leer no se muestra en cero: se dice.
  const estadisticas = await leerEstadisticas(local.id, meses).catch((error: unknown) => {
    console.error("mi-local/crecimiento:", error);
    return null;
  });

  const enlace = (cambios: { meses?: number; ver?: string }) => {
    const params = new URLSearchParams();
    const m = cambios.meses ?? elegido;
    const v = cambios.ver ?? (deIngresos ? "ingresos" : "turnos");
    if (m !== PERIODO_POR_DEFECTO) params.set("meses", String(m));
    if (v === "turnos") params.set("ver", "turnos");
    const query = params.toString();
    return `/mi-local/crecimiento${query ? `?${query}` : ""}`;
  };

  const encabezado = <Encabezado titulo={copy.titulo} bajada={copy.bajada} />;
  const cuponesDesde = plan.promociones.incluida ? null : (plan.promociones.desde ?? copy.bloqueado.otroPlan);

  if (!estadisticas) {
    return (
      <div className="flex flex-col gap-6 md:gap-8">
        {encabezado}
        <ErrorDeLectura>{copy.error}</ErrorDeLectura>
        <AccionesDeCrecimiento cuponesDesde={cuponesDesde} />
      </div>
    );
  }

  const t = totales(estadisticas);
  // Con sólo el mes en curso, sin turnos quiere decir "este mes todavía no", no "nunca": se muestra el cero.
  if (t.turnos === 0 && !bloqueadoHasta) {
    return (
      <div className="flex flex-col gap-6 md:gap-8">
        {encabezado}
        <Superficie tone="surface" className="p-6 text-center">
          <p className="font-semibold text-fg">{copy.vacio.titulo}</p>
          <p className="mt-1 text-small text-muted">{copy.vacio.bajada}</p>
        </Superficie>
        {/* La app las esconde con el vacío; acá siguen: un local sin turnos también puede armar un cupón. */}
        <AccionesDeCrecimiento cuponesDesde={cuponesDesde} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {encabezado}

      {/*
       * Cada tarjeta aparece sólo si tiene algo que decir, como en la app. Las
       * palancas van al final en el teléfono, como la app, y en la compu justo
       * debajo de lo facturado, para que no queden bajo seis tarjetas (D3).
       */}
      <div className="grid items-start gap-4 md:gap-6 lg:grid-cols-2">
        <Facturado
          estadisticas={estadisticas}
          deIngresos={deIngresos}
          bloqueadoHasta={bloqueadoHasta}
          selectorDePeriodo={
            <nav aria-label={copy.periodo} className="flex flex-wrap gap-2">
              {PERIODOS.map((p) => (
                <Opcion key={p} href={enlace({ meses: p })} activa={p === elegido}>
                  {copy.meses(p)}
                </Opcion>
              ))}
            </nav>
          }
          selectorDeVista={
            <nav aria-label={copy.ver} className="flex flex-wrap gap-2">
              <Opcion href={enlace({ ver: "ingresos" })} activa={deIngresos}>
                {copy.ingresos}
              </Opcion>
              <Opcion href={enlace({ ver: "turnos" })} activa={!deIngresos}>
                {copy.turnos}
              </Opcion>
            </nav>
          }
        />
        <AccionesDeCrecimiento cuponesDesde={cuponesDesde} className="order-last lg:order-none lg:col-span-2" />
        <Clientes estadisticas={estadisticas} />
        <NoHechos estadisticas={estadisticas} />
        <CuandoSeLlena estadisticas={estadisticas} bloqueadoHasta={bloqueadoHasta} />
        {estadisticas.profesionales.length > 1 && (
          <Ranking
            titulo={copy.profesionales.titulo}
            info={copy.profesionales.info}
            filas={estadisticas.profesionales}
            detalle={(p) => `${miLocal.agenda.turnos(p.turnos)} · ${pesos(p.ingresos)}`}
          />
        )}
        {estadisticas.servicios.length > 0 && (
          <Ranking
            titulo={copy.servicios.titulo}
            info={copy.servicios.info}
            filas={estadisticas.servicios}
            detalle={(s) => `${participacion(s.turnos, t.turnos)} · ${pesos(s.ingresos)}`}
          />
        )}
      </div>
    </div>
  );
}
