import type { Metadata } from "next";
import CambiarAvisos from "@/components/admin/CambiarAvisos";
import { Bloque, Encabezado, Mail, Tabla } from "@/components/admin/piezas";
import SacarAdmin from "@/components/admin/SacarAdmin";
import SumarAdmin from "@/components/admin/SumarAdmin";
import TextLink from "@/components/ui/TextLink";
import { acciones } from "@/content/admin";
import { leerEquipo } from "@/lib/admin/datos";
import { fechaConAnio } from "@/lib/formato";

export const metadata: Metadata = { title: "Equipo" };

/** Quién entra al panel y sus avisos (paso I). Lo que hizo cada uno está en Registro (paso T de la v5). */
export default async function Equipo() {
  const { administradores, yo } = await leerEquipo();
  const copy = acciones.equipo;

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo="Equipo" bajada="Quién entra al panel y a quién le llegan los avisos." />

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

    </div>
  );
}
