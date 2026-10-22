import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Encabezado from "@/components/mi-local/Encabezado";
import ErrorDeLectura from "@/components/mi-local/ErrorDeLectura";
import ProgramaDePuntos from "@/components/mi-local/ProgramaDePuntos";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { pesos } from "@/lib/formato";
import { leerPremios, leerProgramaDePuntos, type Premio } from "@/lib/mi-local/cupones";
import { leerLocalDelDuenio } from "@/lib/mi-local/lugar";

export const metadata: Metadata = { title: miLocal.recompensas.titulo };

/** "Gratis", "20% off" o "$5.000 off". */
const beneficio = (p: Premio) =>
  p.tipo === "gratis"
    ? miLocal.recompensas.gratis
    : miLocal.recompensas.descuento(p.tipo === "porcentaje" ? `${p.valor}%` : pesos(p.valor));

/**
 * El programa de puntos y sus premios (fase 5), como `RewardsManagementScreen`:
 * arriba el interruptor y las reglas; abajo los premios. Los puntos están en
 * todos los planes. Sin el programa prendido no se crean premios.
 */
export default async function RecompensasPage() {
  const local = (await leerLocalDelDuenio()) ?? redirect("/mi-local");
  const copy = miLocal.recompensas;

  const lectura = await Promise.all([leerProgramaDePuntos(local.id), leerPremios(local.id)]).catch((error: unknown) => {
    console.error("mi-local/recompensas:", error);
    return null;
  });

  const volver = (
    <TextLink href="/mi-local/crecimiento" className="self-start text-small">
      {miLocal.crecimiento.volver}
    </TextLink>
  );
  if (!lectura) {
    return (
      <div className="flex max-w-3xl flex-col gap-6 md:gap-8">
        {volver}
        <Encabezado titulo={copy.titulo} />
        <ErrorDeLectura>{copy.error}</ErrorDeLectura>
      </div>
    );
  }

  const [prendido, premios] = lectura;
  return (
    <div className="flex max-w-3xl flex-col gap-6 md:gap-8">
      {volver}
      <Encabezado
        titulo={copy.titulo}
        bajada={prendido && premios.length ? copy.resumen(premios.length, premios.filter((p) => p.activo).length) : undefined}
        accion={
          prendido && (
            <Button href="/mi-local/crecimiento/recompensas/nuevo" size="compact">
              {copy.nuevo}
            </Button>
          )
        }
      />

      <ProgramaDePuntos prendido={prendido} />

      {!prendido || premios.length === 0 ? (
        <Superficie tone="surface" className="p-6 text-center">
          <p className="font-semibold text-fg">{prendido ? copy.vacio.titulo : copy.apagado.titulo}</p>
          <p className="mt-1 text-small text-muted">{prendido ? copy.vacio.bajada : copy.apagado.bajada}</p>
        </Superficie>
      ) : (
        <Superficie tone="surface">
          <ul className="divide-y divide-line">
            {premios.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/mi-local/crecimiento/recompensas/${p.id}`}
                  aria-label={copy.editar(p.titulo)}
                  className="ring-focus grid grid-cols-[1fr_auto] items-center gap-x-4 px-5 py-4 transition-colors duration-(--duration-chico) hover:bg-fg/4 md:px-6"
                >
                  <span className={p.activo ? undefined : "opacity-70"}>
                    <span className="block font-semibold text-fg">{p.titulo}</span>
                    {p.descripcion && <span className="block text-small text-muted">{p.descripcion}</span>}
                    <span className="block text-small text-muted">
                      {[copy.puntos(p.puntos), p.visitas > 0 && copy.visitas(p.visitas)].filter(Boolean).join(" · ")}
                    </span>
                    {!p.activo && (
                      <Badge tono="neutro" className="mt-2">
                        {copy.pausado}
                      </Badge>
                    )}
                  </span>
                  <span className={`font-bold text-fg ${p.activo ? "" : "opacity-70"}`}>{beneficio(p)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Superficie>
      )}
    </div>
  );
}
