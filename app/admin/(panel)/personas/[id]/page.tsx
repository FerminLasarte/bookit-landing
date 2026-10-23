import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LocalesDePersona from "@/components/admin/LocalesDePersona";
import { Bloque, Cifra, Encabezado, Fila, Mail, Tabla, Telefono, Vacio } from "@/components/admin/piezas";
import EstadoDelTurno from "@/components/mi-local/EstadoDelTurno";
import TextLink from "@/components/ui/TextLink";
import { estadosDePago, metodosDePago, proveedores, tiposDePago } from "@/content/admin";
import { leerPersona, type TurnoDePersona } from "@/lib/admin/datos";
import { fechaConAnio, haceCuanto, hora, numero, pesos } from "@/lib/formato";

export const metadata: Metadata = { title: "Persona" };

const UUID = /^[0-9a-f-]{36}$/i;

/** Cómo se pagó un turno, en una línea: "Mercado Pago · seña · pagado". */
const comoSePago = (t: TurnoDePersona) =>
  [metodosDePago[t.metodo_pago] ?? t.metodo_pago, tiposDePago[t.tipo_pago] ?? t.tipo_pago, estadosDePago[t.pago_estado] ?? t.pago_estado]
    .filter(Boolean)
    .join(" · ");

/** Una cuenta: sus datos, sus locales, sus puntos y sus últimos turnos como cliente (D7). */
export default async function Persona({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const p = await leerPersona(id);
  if (!p) notFound();

  const { puntos } = p;

  return (
    <div className="flex flex-col gap-6">
      <TextLink href="/admin/personas" className="self-start text-small">
        ← Personas
      </TextLink>

      <Encabezado titulo={p.nombre ?? p.email ?? "Sin nombre"} bajada={p.nombre ? p.email : undefined} />

      <div className="grid gap-3 md:grid-cols-2">
        <Bloque titulo="Cuenta">
          <dl>
            <Fila etiqueta="Mail">
              <Mail email={p.email} />
            </Fila>
            <Fila etiqueta="Teléfono">
              <Telefono numero={p.telefono} />
            </Fila>
            <Fila etiqueta="Entra con">{p.proveedores.map((x) => proveedores[x] ?? x).join(" · ")}</Fila>
            <Fila etiqueta="Alta">{fechaConAnio(p.alta)}</Fila>
            <Fila etiqueta="Último ingreso">{haceCuanto(p.ultimo_ingreso)}</Fila>
          </dl>
        </Bloque>

        <Bloque titulo="Locales" bajada="Donde es dueño o profesional.">
          <div className="text-small">
            <LocalesDePersona locales={p.locales} vacio="Ninguno: es sólo cliente." />
          </div>
        </Bloque>
      </div>

      <Bloque titulo="Puntos" bajada="La billetera es una sola y se gasta en cualquier local.">
        <div className="grid grid-cols-3 gap-3">
          <Cifra etiqueta="Disponibles" valor={numero(puntos.disponibles)} />
          <Cifra etiqueta="Históricos" valor={numero(puntos.historicos)} />
          <Cifra etiqueta="Nivel" valor={numero(puntos.nivel)} />
        </div>
        {puntos.por_local.length > 0 && (
          <div className="mt-4">
            <Tabla columnas={["Local", "Ganados ahí", "Canjeados ahí"]}>
              {puntos.por_local.map((l) => (
                <tr key={l.id_comercio}>
                  <td>
                    <Link href={`/admin/comercios/${l.id_comercio}`} className="ring-focus rounded-[4px] font-semibold text-fg hover:underline">
                      {l.local}
                    </Link>
                  </td>
                  <td className="num">{numero(l.ganados)}</td>
                  <td className="num">{numero(l.canjeados)}</td>
                </tr>
              ))}
            </Tabla>
          </div>
        )}
      </Bloque>

      <Bloque titulo="Turnos como cliente" bajada="Los últimos 20, del más nuevo al más viejo.">
        {p.turnos.length === 0 ? (
          <Vacio>Todavía no sacó turnos.</Vacio>
        ) : (
          <Tabla columnas={["Fecha", "Local", "Servicio", "Estado", "Pago", "Precio"]}>
            {p.turnos.map((t) => (
              <tr key={t.id_turno}>
                <td className="whitespace-nowrap">
                  {fechaConAnio(t.fecha)} <span className="text-muted">{hora(t.fecha)}</span>
                </td>
                <td>
                  <Link href={`/admin/comercios/${t.id_comercio}`} className="ring-focus rounded-[4px] font-semibold text-fg hover:underline">
                    {t.local}
                  </Link>
                </td>
                <td>{t.servicio ?? <span className="text-muted">Servicio borrado</span>}</td>
                <td>
                  <EstadoDelTurno estado={t.estado} sinMarcar={false} />
                </td>
                <td className="text-muted">{comoSePago(t)}</td>
                <td className="num whitespace-nowrap">{pesos(t.precio_total)}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Bloque>
    </div>
  );
}
