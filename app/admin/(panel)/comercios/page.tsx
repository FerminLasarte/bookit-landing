import type { Metadata } from "next";
import Link from "next/link";
import {
  aLista,
  Bloque,
  Busqueda,
  Dato,
  Encabezado,
  EstadoBadge,
  paginaPedida,
  Paginas,
  Selector,
  Tabla,
  Vacio,
} from "@/components/admin/piezas";
import Filtros, { type Filtro } from "@/components/admin/Filtros";
import { MarcaDePausa } from "@/components/admin/Pausa";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import { acciones, canales, filtrosAdmin, filtrosComercios, listaSegunOrden, niveles, ordenesComercios, planes } from "@/content/admin";
import { leerComercios, POR_PAGINA } from "@/lib/admin/datos";
import { FILTROS_DE_COMERCIOS, paramsDeComercios, pedidoDeComercios, type ParamsDeComercios } from "@/lib/admin/listas";
import { fecha, haceCuanto, numero } from "@/lib/formato";

export const metadata: Metadata = { title: "Comercios" };

const BASE = "/admin/comercios";

const opcionesSiNo = (todos: string, si: string, no: string) => [
  { valor: "", label: todos },
  { valor: "si", label: si },
  { valor: "no", label: no },
];

const deUnMapa = (mapa: Record<string, string>, todos: string) => [
  { valor: "", label: todos },
  ...Object.entries(mapa).map(([valor, label]) => ({ valor, label })),
];

export default async function Comercios({ searchParams }: { searchParams: Promise<ParamsDeComercios> }) {
  const params = await searchParams;
  const pedido = pedidoDeComercios(params);
  const pagina = paginaPedida(params.p);
  const { total, filas, localidades } = await leerComercios({
    ...pedido,
    limite: POR_PAGINA,
    desde: (pagina - 1) * POR_PAGINA,
  });
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const f = filtrosAdmin;
  // Lo que sigue puesto, ya validado: lo que no se conoce se cae de los links.
  const puestos = paramsDeComercios(pedido);
  const conFiltros = FILTROS_DE_COMERCIOS.some((k) => puestos[k]);

  const filtros: Filtro[] = [
    {
      nombre: "localidad",
      etiqueta: f.localidad,
      valor: pedido.localidad,
      opciones: [{ valor: "", label: f.todas }, ...localidades.map((l) => ({ valor: l, label: l }))],
    },
    { nombre: "nivel", etiqueta: f.nivel, valor: pedido.nivel, opciones: deUnMapa(niveles, f.todos) },
    { nombre: "canal", etiqueta: f.canal, valor: pedido.canal, opciones: deUnMapa(canales, f.todos) },
    { nombre: "fundador", etiqueta: f.fundador, valor: puestos.fundador, opciones: opcionesSiNo(f.todos, f.si, f.no) },
    { nombre: "oculto", etiqueta: f.visibilidad, valor: puestos.oculto, opciones: opcionesSiNo(f.todos, f.ocultos, f.visibles) },
    { nombre: "pausa", etiqueta: f.pausa, valor: puestos.pausa, opciones: opcionesSiNo(f.todos, f.enPausa, f.sinPausa) },
    {
      nombre: "orden",
      etiqueta: f.orden,
      valor: pedido.orden,
      opciones: Object.entries(ordenesComercios).map(([valor, label]) => ({ valor: valor === "alta" ? "" : valor, label })),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo="Comercios" bajada={`${numero(total)} ${total === 1 ? "local" : "locales"}`}>
        <Button href={aLista("/admin/exportar/comercios", puestos, {})} variant="secondary" size="compact" download>
          {f.exportar}
        </Button>
      </Encabezado>

      <Busqueda etiqueta="Nombre del local o mail del dueño" valor={params.q} conservar={{ ...puestos, q: undefined }} />

      <Selector
        etiqueta="Filtrar por estado"
        opciones={filtrosComercios.map((e) => ({
          clave: e.label,
          label: e.label,
          href: aLista(BASE, puestos, { estado: e.valor ?? undefined }),
          elegida: (e.valor ?? undefined) === pedido.estado,
        }))}
      />

      <div className="flex flex-wrap items-end gap-3">
        {/* La key vuelve a armar los selectores cuando los filtros cambian por un link, como "Sacar los filtros". */}
        <Filtros key={JSON.stringify(puestos)} filtros={filtros} conservar={{ q: pedido.busqueda, estado: pedido.estado }} />
        {conFiltros && (
          <TextLink href={aLista(BASE, { q: pedido.busqueda, estado: pedido.estado }, {})} className="min-h-10 items-center text-small">
            {f.sacar}
          </TextLink>
        )}
      </div>

      <Bloque titulo="Locales" bajada={listaSegunOrden[pedido.orden ?? "alta"]}>
        {filas.length === 0 ? (
          <Vacio>No hay locales con ese filtro.</Vacio>
        ) : (
          <Tabla columnas={["Local", "Estado", "Plan", "Vence", "Turnos 30 d", "Último turno", "Alta"]}>
            {filas.map((c) => (
              <tr key={c.id_comercio}>
                <td>
                  <Link
                    href={`/admin/comercios/${c.id_comercio}`}
                    className="ring-focus block rounded-[4px] font-semibold text-fg hover:underline"
                  >
                    {c.nombre}
                  </Link>
                  <span className="text-micro text-muted">
                    {[c.localidad, c.email_duenio].filter(Boolean).join(" · ") || "Sin dueño"}
                  </span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {c.dado_de_baja_el ? <Dato>De baja</Dato> : <EstadoBadge estado={c.estado} />}
                    {!c.visible && <Dato>{acciones.visibilidad.oculto}</Dato>}
                    <MarcaDePausa pausa={c.pausa} />
                  </div>
                </td>
                <td className="whitespace-nowrap">
                  <span className="text-fg">
                    {niveles[c.nivel] ?? c.nivel} · {planes[c.plan] ?? c.plan}
                  </span>
                  <span className="block text-micro text-muted">{canales[c.canal] ?? c.canal}</span>
                </td>
                <td className="whitespace-nowrap">
                  {fecha(c.vencimiento)}
                  {c.cancela_al_vencer && <span className="block text-micro text-danger">No renueva</span>}
                </td>
                <td className="num">{numero(c.turnos_30d)}</td>
                <td className="whitespace-nowrap text-muted">{haceCuanto(c.ultimo_turno)}</td>
                <td className="whitespace-nowrap text-muted">{fecha(c.creado_el)}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Bloque>

      <Paginas pagina={pagina} paginas={paginas} href={(p) => aLista(BASE, puestos, { p: String(p) })} />
    </div>
  );
}
