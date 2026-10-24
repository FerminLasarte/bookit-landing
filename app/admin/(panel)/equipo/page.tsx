import type { Metadata } from "next";
import CambiarAvisos from "@/components/admin/CambiarAvisos";
import { Bloque, Encabezado, Mail, Tabla, Vacio } from "@/components/admin/piezas";
import QueHizo from "@/components/admin/QueHizo";
import SacarAdmin from "@/components/admin/SacarAdmin";
import SumarAdmin from "@/components/admin/SumarAdmin";
import TextLink from "@/components/ui/TextLink";
import { acciones } from "@/content/admin";
import { leerEquipo } from "@/lib/admin/datos";
import { fecha, fechaConAnio } from "@/lib/formato";

export const metadata: Metadata = { title: "Equipo" };

/** Quién entra al panel y todo lo que hizo el equipo, también lo que no es de un local (paso I, D5). */
export default async function Equipo() {
  const { administradores, acciones: registro, yo } = await leerEquipo();
  const copy = acciones.equipo;

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo="Equipo" bajada="Quién entra al panel y lo que hizo cada uno." />

      <Bloque titulo={copy.titulo} bajada={copy.bajada}>
        <div className="mb-3">
          <SumarAdmin />
        </div>
        <Tabla columnas={["Mail", "Nombre", "Desde", "Lo sumó", copy.avisos.columna, ""]}>
          {administradores.map((a) => (
            <tr key={a.id_usuario}>
              <td>
                <Mail email={a.email} />
              </td>
              <td>
                <TextLink href={`/admin/personas/${a.id_usuario}`}>{a.nombre ?? "Ver su ficha"}</TextLink>
              </td>
              <td className="whitespace-nowrap">{fechaConAnio(a.desde)}</td>
              <td className="text-muted">{a.sumado_por ?? copy.aMano}</td>
              <td>
                <CambiarAvisos idUsuario={a.id_usuario} email={a.email} recibe={a.recibe_avisos} />
              </td>
              <td>
                {a.id_usuario === yo ? (
                  <span className="text-muted">{copy.vos}</span>
                ) : (
                  <SacarAdmin idUsuario={a.id_usuario} email={a.email} />
                )}
              </td>
            </tr>
          ))}
        </Tabla>
      </Bloque>

      <Bloque titulo={copy.registro.titulo} bajada={copy.registro.bajada}>
        {registro.length === 0 ? (
          <Vacio>{copy.registro.vacio}</Vacio>
        ) : (
          <Tabla columnas={["Fecha", "Quién", "Qué", "Local", "Nota"]}>
            {registro.map((a, i) => (
              <tr key={`${a.creado_el}-${a.accion}-${i}`}>
                <td className="whitespace-nowrap">{fecha(a.creado_el)}</td>
                <td>{a.email ?? acciones.registro.sinCuenta}</td>
                <td>
                  <QueHizo accion={a} />
                </td>
                <td>
                  {a.id_comercio ? (
                    <TextLink href={`/admin/comercios/${a.id_comercio}`}>{a.comercio ?? "Sin nombre"}</TextLink>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="text-muted">{a.detalle.nota}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Bloque>
    </div>
  );
}
