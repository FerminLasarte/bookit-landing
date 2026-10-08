import type { Metadata } from "next";
import Compra from "@/components/planes/Compra";
import Encabezado from "@/components/planes/Encabezado";
import Entrar from "@/components/planes/Entrar";
import PieDelPaywall, { legalesDelPie } from "@/components/planes/PieDelPaywall";
import Vitrina from "@/components/planes/Vitrina";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import { nombresDeNivel, planes } from "@/content/planes";
import { diaYMes } from "@/lib/formato";
import {
  armarTarjetas,
  leerMiPlan,
  leerNiveles,
  leerPrecios,
  leerSesion,
  type CopyDeNivel,
  type Frecuencia,
  type MiPlan,
  type Nivel,
} from "@/lib/planes";

/*
 * Los planes de Bookit en pesos, con Mercado Pago. Es también adonde vuelve
 * Mercado Pago después de autorizar (lo fija el servidor). La app no nombra ni
 * enlaza esta página.
 *
 * Sin sesión muestra los precios de lista y cómo entrar; con sesión, lo que
 * dice `mi_plan_web()` (BooKit, docs/web-en-pesos.md).
 */

export const metadata: Metadata = {
  title: planes.meta.title,
  description: planes.meta.description,
  alternates: { canonical: "/planes" },
};

type PageProps = { searchParams: Promise<{ error?: string }> };

const salir = (
  <form action="/planes/auth/salir" method="post">
    <Button type="submit" variant="secondary">
      {planes.pie.salir}
    </Button>
  </form>
);

/** El nivel que la pantalla trae al frente: el que la base marca como recomendado. */
const recomendado = (niveles: CopyDeNivel[]): Nivel => niveles.find((n) => n.recomendado)?.id ?? "pro";

export default async function PlanesPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const sesion = await leerSesion();

  if (!sesion) {
    const [precios, niveles] = await Promise.all([leerPrecios(), leerNiveles()]);
    const mensaje =
      error === "sesion" ? planes.errores.sin_sesion : error === "ingreso" ? planes.sinSesion.errores.oauth : null;

    return (
      <div className="flex flex-col items-center gap-[1.56rem] pt-6 pb-20 md:pt-10">
        <Encabezado titulo={planes.sinSesion.titulo} bajada={planes.sinSesion.bajada} />
        <div className="w-full">
          <Vitrina tarjetas={armarTarjetas(precios, niveles, nombresDeNivel)} inicial={recomendado(niveles)} />
        </div>
        <div className="w-full px-5">
          <Entrar error={mensaje} />
        </div>
        <PieDelPaywall>{legalesDelPie}</PieDelPaywall>
      </div>
    );
  }

  const [mi, niveles] = await Promise.all([leerMiPlan(), leerNiveles()]);

  if (mi.motivo) return <Motivo mi={mi} />;

  const s = mi.suscripcion;
  const opciones = mi.opciones ?? [];
  const actual = opciones.find((o) => o.es_el_actual);
  const planActual = s?.plan === "mensual" || s?.plan === "anual" ? (s.plan as Frecuencia) : null;

  return (
    <div className="pt-6 pb-20 md:pt-10">
      <Compra
        encabezado={encabezado(mi)}
        tarjetas={armarTarjetas(opciones, niveles, nombresDeNivel)}
        inicial={{
          nivel: actual?.nivel ?? s?.nivel ?? recomendado(niveles),
          plan: actual?.plan ?? planActual ?? "mensual",
        }}
        pruebaDias={mi.prueba_dias ?? 0}
        email={sesion.email}
        suscripcion={{ estado: s?.estado ?? "pendiente", plan: s?.plan ?? null, debito: s?.debito ?? null }}
        baja={s?.origen === "mercado_pago" && s.debito ? { vence: diaYMes(s.vence) } : null}
      />
    </div>
  );
}

/** El título, la bajada y los avisos según en qué está el local, como en el paywall de la app. */
function encabezado(mi: MiPlan) {
  const { encabezado: copy, estado: avisos } = planes;
  const s = mi.suscripcion;
  const local = mi.comercio?.nombre ?? "Tu local";
  const dias = mi.prueba_dias ?? 0;
  const vence = diaYMes(s?.vence);
  const nombre = (nivel: Nivel | null, plan: string | null) =>
    [nivel ? nombresDeNivel[nivel] : null, plan].filter(Boolean).join(" ");

  const lista: string[] = [];
  const vigente = s && (s.estado === "al_dia" || s.estado === "en_gracia");
  if (vigente) {
    if (s.plan === "prueba") lista.push(avisos.prueba(nombre(s.nivel, null), vence));
    else if (s.plan === "mensual" || s.plan === "anual") lista.push(avisos.plan(nombre(s.nivel, s.plan), vence));
    else lista.push(avisos.anterior(vence));

    if (s.cancela_al_vencer) lista.push(avisos.termina(vence));
    const cambiaAlVencer =
      s.debito && s.plan !== "prueba" && (s.debito.nivel !== s.nivel || s.debito.plan !== s.plan);
    if (cambiaAlVencer && s.debito) lista.push(avisos.pasas(nombre(s.debito.nivel, s.debito.plan), vence));
    if (s.estado === "en_gracia") lista.push(avisos.enGracia);
  }

  if (vigente || s?.debito) return { ...copy.tienePlan, avisos: lista };
  if (s?.estado === "cortada") return { ...copy.cortada, avisos: lista };
  if (s?.estado === "pendiente") {
    return {
      titulo: copy.pendiente.titulo,
      bajada: dias > 0 ? copy.pendiente.conPrueba(local, dias) : copy.pendiente.sinPrueba(local),
      avisos: lista,
    };
  }
  return {
    titulo: copy.otro.titulo,
    bajada: dias > 0 ? copy.otro.conPrueba(dias) : copy.otro.sinPrueba,
    avisos: lista,
  };
}

/** Lo que ve un dueño que no puede comprar acá: el porqué y la salida. */
function Motivo({ mi }: { mi: MiPlan }) {
  const { motivos } = planes;

  if (mi.motivo === "tienda_vigente") {
    return (
      <Section
        id="planes"
        as="h1"
        title={motivos.tienda_vigente.titulo}
        lede={motivos.tienda_vigente.bajada(diaYMes(mi.suscripcion?.vence))}
        actions={salir}
      />
    );
  }

  const motivo = mi.motivo === "suspendida" ? motivos.suspendida : motivos.sin_comercio;
  return (
    <Section
      id="planes"
      as="h1"
      title={motivo.titulo}
      lede={motivo.bajada}
      actions={
        <>
          <Button href={motivo.boton.href}>{motivo.boton.label}</Button>
          {salir}
        </>
      }
    />
  );
}
