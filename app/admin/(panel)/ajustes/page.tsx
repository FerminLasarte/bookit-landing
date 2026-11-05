import type { Metadata } from "next";
import CambiarAvisos from "@/components/admin/CambiarAvisos";
import { Bloque, Encabezado, Fila, Tabla } from "@/components/admin/piezas";
import { claseDeOpcion } from "@/components/mi-local/Opciones";
import { ajustesAdmin, niveles } from "@/content/admin";
import { leerEquipo, leerPlanes } from "@/lib/admin/datos";
import { DENSIDADES, FILAS_POR_PAGINA, leerVista } from "@/lib/admin/vista";
import { fechaConAnio, numero, pesos } from "@/lib/formato";
import { guardarVista } from "./acciones";

export const metadata: Metadata = { title: ajustesAdmin.titulo };

/**
 * Elegir una entre pocas: la vigente va llena y las otras guardan al tocarlas,
 * como los avisos. Anda sin JavaScript.
 */
function Opciones({
  etiqueta,
  nombre,
  actual,
  opciones,
}: {
  etiqueta: string;
  nombre: string;
  actual: string;
  opciones: { valor: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="min-w-32 text-small font-semibold text-fg">{etiqueta}</span>
      <div role="group" aria-label={etiqueta} className="flex flex-wrap gap-2">
        {opciones.map((o) =>
          o.valor === actual ? (
            <span key={o.valor} aria-current="true" className={claseDeOpcion(true)}>
              {o.label}
            </span>
          ) : (
            <button key={o.valor} type="submit" name={nombre} value={o.valor} className={claseDeOpcion(false)}>
              {o.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

/** Lo de cada uno (sus avisos y cómo ve las listas) y los planes, que sólo se leen (docs/PLAN-ADMIN-V5.md, paso X). */
export default async function Ajustes() {
  const [{ administradores, yo }, planes, vista] = await Promise.all([leerEquipo(), leerPlanes(), leerVista()]);
  const copy = ajustesAdmin;
  const mio = administradores.find((a) => a.id_usuario === yo);
  const { fundadores } = planes;

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo={copy.titulo} bajada={copy.bajada} />

      <div className="grid items-start gap-3 md:grid-cols-2">
        <Bloque titulo={copy.avisos.titulo} bajada={copy.avisos.bajada}>
          {mio ? (
            <CambiarAvisos idUsuario={mio.id_usuario} email={mio.email} recibe={mio.recibe_avisos} />
          ) : (
            <p className="text-small text-muted">{copy.avisos.sinCuenta}</p>
          )}
        </Bloque>

        <Bloque titulo={copy.vista.titulo} bajada={copy.vista.bajada}>
          <form action={guardarVista} className="flex flex-col gap-3">
            <Opciones
              etiqueta={copy.vista.densidad}
              nombre="densidad"
              actual={vista.densidad}
              opciones={DENSIDADES.map((d) => ({ valor: d, label: copy.vista.densidades[d] }))}
            />
            <Opciones
              etiqueta={copy.vista.filas}
              nombre="por_pagina"
              actual={String(vista.porPagina)}
              opciones={FILAS_POR_PAGINA.map((f) => ({ valor: String(f), label: String(f) }))}
            />
          </form>
        </Bloque>
      </div>

      <Bloque titulo={copy.planes.titulo} bajada={copy.planes.bajada}>
        <Tabla columnas={[...copy.planes.columnas]}>
          {planes.planes.flatMap((p) =>
            p.precios.map((precio, i) => (
              <tr key={`${p.id}-${precio.nivel ?? "todos"}`}>
                <td className="font-semibold text-fg">{i === 0 ? p.nombre : ""}</td>
                <td>{precio.nivel ? (niveles[precio.nivel] ?? precio.nivel) : copy.planes.todos}</td>
                <td className="num">{pesos(precio.precio)}</td>
                <td className="num text-muted">{precio.precio_fundador === null ? "—" : pesos(precio.precio_fundador)}</td>
                <td className="whitespace-nowrap">{copy.planes.ciclo(p.ciclo_dias)}</td>
                <td className="whitespace-nowrap">{copy.planes.gracia(p.dias_gracia)}</td>
                <td>{p.ofrecible ? copy.planes.si : copy.planes.no}</td>
              </tr>
            )),
          )}
        </Tabla>
        <p className="mt-3 text-micro text-muted">{copy.planes.prueba(planes.dias_de_prueba)}</p>
      </Bloque>

      <Bloque titulo={copy.fundadores.titulo} bajada={copy.fundadores.nota}>
        <dl className="max-w-md">
          <Fila etiqueta={copy.fundadores.usados}>
            {numero(fundadores.usados)} de {numero(fundadores.cupo)}
          </Fila>
          <Fila etiqueta={copy.fundadores.quedan}>{numero(fundadores.quedan)}</Fila>
          <Fila etiqueta={copy.fundadores.hasta}>{fechaConAnio(fundadores.hasta)}</Fila>
        </dl>
      </Bloque>
    </div>
  );
}
