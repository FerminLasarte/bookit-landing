import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Encabezado from "@/components/mi-local/Encabezado";
import ErrorDeLectura from "@/components/mi-local/ErrorDeLectura";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import { fecha, hoy, pesos } from "@/lib/formato";
import { leerCupones, sirve, type Cupon } from "@/lib/mi-local/cupones";
import { leerPlanDelLocal } from "@/lib/mi-local/gestion";
import { leerLocalDelDuenio } from "@/lib/mi-local/lugar";

export const metadata: Metadata = { title: miLocal.cupones.titulo };

/** "20%" o "$5.000": lo que va en el talón del cupón en la app. */
const descuento = (c: Cupon) => (c.tipo === "porcentaje" ? `${c.valor}%` : pesos(c.valor));

/** Un cupón de la lista: el código manda, el nombre interno va chico, y el descuento a la derecha, como el talón. */
function FilaDeCupon({ cupon, hoyEnTandil, apagado }: { cupon: Cupon; hoyEnTandil: string; apagado: boolean }) {
  const copy = miLocal.cupones;
  const vencido = hoyEnTandil > cupon.hasta;
  // Mediodía UTC: la fecha del cupón no tiene hora y ninguna zona la corre de día.
  const dia = fecha(`${cupon.hasta}T12:00:00Z`);

  return (
    <li>
      <Link
        href={`/mi-local/crecimiento/cupones/${cupon.id}`}
        aria-label={copy.editar(cupon.codigo)}
        className="ring-focus grid grid-cols-[1fr_auto] items-center gap-x-4 px-5 py-4 transition-colors duration-(--duration-chico) hover:bg-fg/4 md:px-6"
      >
        <span className={apagado ? "opacity-70" : undefined}>
          <span className="block font-bold tracking-wide text-fg">{cupon.codigo}</span>
          <span className="block text-small text-muted">
            {[cupon.nombre, vencido ? copy.vencio(dia) : copy.hasta(dia), copy.canjes(cupon.usos, cupon.limite)].join(" · ")}
          </span>
          {(vencido || !cupon.activo) && (
            <Badge tono={vencido ? "mal" : "neutro"} className="mt-2">
              {vencido ? copy.vencido : copy.pausado}
            </Badge>
          )}
        </span>
        <span className={`text-title font-extrabold text-fg tabular-nums ${apagado ? "opacity-70" : ""}`}>{descuento(cupon)}</span>
      </Link>
    </li>
  );
}

function Lista({ cupones, hoyEnTandil, apagados = false }: { cupones: Cupon[]; hoyEnTandil: string; apagados?: boolean }) {
  return (
    <Superficie tone="surface">
      <ul className="divide-y divide-line">
        {cupones.map((c) => (
          <FilaDeCupon key={c.id} cupon={c} hoyEnTandil={hoyEnTandil} apagado={apagados} />
        ))}
      </ul>
    </Superficie>
  );
}

/**
 * Los cupones del local (fase 5), como `PromotionsListScreen`: los que sirven
 * primero; en un plan sin promociones, los vigentes en "Pausados por tu plan"
 * (vuelven solos al subir); abajo, los pausados o vencidos.
 */
export default async function CuponesPage() {
  const local = (await leerLocalDelDuenio()) ?? redirect("/mi-local");
  const copy = miLocal.cupones;
  const hoyEnTandil = hoy();

  const [cupones, plan] = await Promise.all([
    leerCupones(local.id).catch((error: unknown) => {
      console.error("mi-local/cupones:", error);
      return null;
    }),
    leerPlanDelLocal(local.suscripcion.nivel),
  ]);
  const bloqueado = !plan.promociones.incluida;
  const nivel = plan.promociones.desde ?? miLocal.crecimiento.bloqueado.otroPlan;

  const vigentes = cupones?.filter((c) => sirve(c, hoyEnTandil)) ?? [];
  const enUso = bloqueado ? [] : vigentes;
  const pausadosPorElPlan = bloqueado ? vigentes : [];
  const sinEfecto = cupones?.filter((c) => !sirve(c, hoyEnTandil)) ?? [];

  return (
    <div className="flex max-w-3xl flex-col gap-6 md:gap-8">
      <TextLink href="/mi-local/crecimiento" className="self-start text-small">
        {miLocal.crecimiento.volver}
      </TextLink>
      <Encabezado
        titulo={copy.titulo}
        bajada={
          cupones?.length
            ? copy.resumen(cupones.length, enUso.length, cupones.reduce((s, c) => s + c.usos, 0))
            : undefined
        }
        accion={
          !bloqueado && (
            <Button href="/mi-local/crecimiento/cupones/nuevo" size="compact">
              {copy.nuevo}
            </Button>
          )
        }
      />

      {bloqueado && (
        <p className="-mt-2 text-small text-muted">
          {copy.bloqueado(nivel)} <TextLink href="/planes">{copy.verPlanes}</TextLink>
        </p>
      )}

      {cupones === null ? (
        <ErrorDeLectura>{copy.error}</ErrorDeLectura>
      ) : cupones.length === 0 ? (
        <Superficie tone="surface" className="p-6 text-center">
          <p className="font-semibold text-fg">{copy.vacio.titulo}</p>
          <p className="mt-1 text-small text-muted">{copy.vacio.bajada}</p>
        </Superficie>
      ) : (
        <>
          {enUso.length > 0 && <Lista cupones={enUso} hoyEnTandil={hoyEnTandil} />}
          {pausadosPorElPlan.length > 0 && (
            <section className="flex flex-col gap-3">
              <div>
                <h2 className="font-semibold text-fg">{copy.pausadosPorElPlan.titulo}</h2>
                <p className="text-small text-muted">{copy.pausadosPorElPlan.bajada(nivel)}</p>
              </div>
              <Lista cupones={pausadosPorElPlan} hoyEnTandil={hoyEnTandil} apagados />
            </section>
          )}
          {sinEfecto.length > 0 && (
            <section className="flex flex-col gap-3">
              <div>
                <h2 className="font-semibold text-fg">{copy.sinEfecto.titulo}</h2>
                <p className="text-small text-muted">{copy.sinEfecto.bajada(sinEfecto.length)}</p>
              </div>
              <Lista cupones={sinEfecto} hoyEnTandil={hoyEnTandil} apagados />
            </section>
          )}
        </>
      )}
    </div>
  );
}
