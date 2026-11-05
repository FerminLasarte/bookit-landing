import Link from "next/link";
import type { ReactNode } from "react";
import TextLink from "@/components/ui/TextLink";
import { CANALES_DE_LA_TIENDA, inicioAdmin } from "@/content/admin";
import type { ParaAtender as Datos } from "@/lib/admin/datos";
import { fecha, haceCuanto, numero } from "@/lib/formato";
import { Bloque, Fila } from "./piezas";

/*
 * "Para atender", arriba del Inicio (docs/PLAN-ADMIN-V5.md, paso V): lo que
 * pide una mano, con `admin_para_atender` (BooKit `docs/admin-panel.md`,
 * sección 23). Sólo van los bloques que tienen algo.
 */

type Local = { id_comercio: string; nombre: string };

/** Unos locales con su link a la ficha y, si hay más de los que vinieron, cuántos faltan. */
function Locales<T extends Local>({
  lista,
  detalle,
}: {
  lista: { total: number; filas: T[] };
  detalle?: (local: T) => ReactNode;
}) {
  const faltan = lista.total - lista.filas.length;
  return (
    <ul className="flex flex-col">
      {lista.filas.map((l) => (
        <li
          key={l.id_comercio}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-line py-2.5 text-small last:border-0"
        >
          <Link href={`/admin/comercios/${l.id_comercio}`} className="ring-focus rounded-[4px] font-semibold text-fg hover:underline">
            {l.nombre}
          </Link>
          {detalle && <span className="text-muted">{detalle(l)}</span>}
        </li>
      ))}
      {faltan > 0 && <li className="pt-2.5 text-small text-muted">{inicioAdmin.yMas(faltan)}</li>}
    </ul>
  );
}

/** Lo que el Inicio cuenta como pendiente: también da el número de la barra lateral. */
export const cuantosParaAtender = (d: Datos) =>
  d.incidencias_abiertas + d.debitos_con_problemas + d.altas_a_medias + d.pruebas_por_vencer.total + d.sin_turnos.total;

export default function ParaAtender({ datos: d }: { datos: Datos }) {
  const copy = inicioAdmin;
  const cobros = d.incidencias_abiertas + d.debitos_con_problemas + d.altas_a_medias;
  const { ocultos, suspendidos, en_pausa } = d.no_aparecen;
  const noAparecen = ocultos.total + suspendidos.total + en_pausa.total;

  return (
    <section aria-labelledby="para-atender" className="flex flex-col gap-3">
      <h2 id="para-atender" className="text-body font-bold text-fg">
        {copy.paraAtender}
      </h2>

      {cuantosParaAtender(d) + noAparecen === 0 ? (
        <p className="text-small text-muted">{copy.nadaParaAtender}</p>
      ) : (
        <div className="grid items-start gap-3 md:grid-cols-2">
          {cobros > 0 && (
            <Bloque titulo={copy.cobros.titulo}>
              <dl>
                <Fila etiqueta={copy.cobros.incidencias}>{numero(d.incidencias_abiertas)}</Fila>
                <Fila etiqueta={copy.cobros.debitos}>{numero(d.debitos_con_problemas)}</Fila>
                <Fila etiqueta={copy.cobros.altas}>{numero(d.altas_a_medias)}</Fila>
              </dl>
              <TextLink href="/admin/cobros" className="mt-3 text-small">
                {copy.cobros.ver}
              </TextLink>
            </Bloque>
          )}

          {d.pruebas_por_vencer.total > 0 && (
            <Bloque titulo={copy.pruebas.titulo}>
              <Locales
                lista={d.pruebas_por_vencer}
                detalle={(p) =>
                  `${fecha(p.vencimiento)} · ${
                    CANALES_DE_LA_TIENDA.includes(p.canal)
                      ? copy.pruebas.deLaTienda
                      : p.tiene_debito_mp
                        ? copy.pruebas.conDebito
                        : copy.pruebas.sinDebito
                  }`
                }
              />
              <TextLink href="/admin/comercios?estado=prueba&orden=vencimiento" className="mt-3 text-small">
                {copy.pruebas.ver}
              </TextLink>
            </Bloque>
          )}

          {d.sin_turnos.total > 0 && (
            <Bloque titulo={copy.sinTurnos.titulo} bajada={copy.sinTurnos.bajada}>
              <Locales
                lista={d.sin_turnos}
                detalle={(l) => (l.ultimo_turno ? copy.sinTurnos.ultimo(haceCuanto(l.ultimo_turno)) : copy.sinTurnos.nunca)}
              />
            </Bloque>
          )}

          {noAparecen > 0 && (
            <Bloque titulo={copy.noAparecen.titulo}>
              <div className="flex flex-col gap-4">
                {[
                  { titulo: copy.noAparecen.ocultos, lista: ocultos, ver: { href: "/admin/comercios?oculto=si", label: copy.noAparecen.verOcultos } },
                  { titulo: copy.noAparecen.suspendidos, lista: suspendidos, ver: null },
                  { titulo: copy.noAparecen.enPausa, lista: en_pausa, ver: { href: "/admin/comercios?pausa=si", label: copy.noAparecen.verEnPausa } },
                ]
                  .filter((g) => g.lista.total > 0)
                  .map((g) => (
                    <div key={g.titulo}>
                      <p className="flex items-baseline justify-between gap-4 text-micro font-semibold text-muted">
                        <span>{g.titulo}</span>
                        {g.ver && (
                          <TextLink href={g.ver.href} tone="quiet">
                            {g.ver.label}
                          </TextLink>
                        )}
                      </p>
                      <Locales lista={g.lista} />
                    </div>
                  ))}
              </div>
            </Bloque>
          )}
        </div>
      )}
    </section>
  );
}
