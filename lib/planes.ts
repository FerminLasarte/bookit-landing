import "server-only";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * Lo que la página de planes lee de Supabase. El contrato está en BooKit,
 * docs/web-en-pesos.md: la web no decide precios, prueba ni cuándo se cobra;
 * muestra lo que devuelve `mi_plan_web()`.
 */

export type Nivel = "esencial" | "pro" | "equipo";
export type Frecuencia = "mensual" | "anual";
export type Destaque = "sobrio" | "marcado" | "premium";

export const NIVELES: readonly Nivel[] = ["esencial", "pro", "equipo"];
export const FRECUENCIAS: readonly Frecuencia[] = ["mensual", "anual"];

/** Cómo se ve un nivel en su card: la fila de `niveles`, como en la app. */
export type CopyDeNivel = {
  id: Nivel;
  rotulo: string;
  bajada: string;
  beneficios: string[];
  distintivo: string | null;
  destaque: Destaque;
  recomendado: boolean;
  orden: number;
};

export type Opcion = {
  nivel: Nivel;
  plan: Frecuencia;
  /** Lo que se cobra, con el fundador aplicado. */
  precio: number;
  precio_lista: number;
  /** `null`: cobra al autorizar. Una fecha: el primer cobro cae ese día. */
  primer_cobro: string | null;
  es_el_actual: boolean;
};

export type Motivo = "sin_comercio" | "suspendida" | "tienda_vigente";

export type MiPlan = {
  motivo: Motivo | null;
  comercio: { id: string; nombre: string } | null;
  suscripcion?: {
    estado: "pendiente" | "al_dia" | "en_gracia" | "cortada" | "suspendida";
    origen: "mercado_pago" | "tienda" | null;
    nivel: Nivel | null;
    /** `prueba`, `mensual` o `anual`; `semanal` y `vitalicia` en locales viejos. */
    plan: string | null;
    vence: string | null;
    cancela_al_vencer: boolean;
    /** Lo que va a cobrar Mercado Pago, o `null` si no hay un débito vivo. */
    debito: { nivel: Nivel; plan: Frecuencia } | null;
  };
  es_fundador?: boolean;
  prueba_dias?: number;
  opciones?: Opcion[];
};

/** Un precio de lista, de `precios_web`. Se lee sin sesión. */
export type PrecioDeLista = { nivel: Nivel; plan: Frecuencia; precio: number };

export type Sesion = { email: string | null };

/** Quién entró a /planes, validado contra Supabase, o `null`. */
export async function leerSesion(): Promise<Sesion | null> {
  const supabase = await clienteDeSupabase("planes");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { email: user.email ?? null } : null;
}

export async function leerPrecios(): Promise<PrecioDeLista[]> {
  const supabase = await clienteDeSupabase("planes");
  const { data, error } = await supabase.from("precios_web").select("nivel, plan, precio");
  if (error) throw new Error(`precios_web: ${error.message}`);
  return data as PrecioDeLista[];
}

/**
 * El copy de las cards. Sin sesión puede no estar a mano —`niveles` se abre a
 * anon con una migración aparte—: entonces la card va sin bajada ni
 * beneficios, en vez de inventarlos.
 */
export async function leerNiveles(): Promise<CopyDeNivel[]> {
  const supabase = await clienteDeSupabase("planes");
  const { data, error } = await supabase
    .from("niveles")
    .select("id, rotulo, bajada, beneficios, distintivo, destaque, recomendado, orden")
    .order("orden");
  if (error) {
    console.error("planes/niveles:", error.code, error.message);
    return [];
  }
  return data as CopyDeNivel[];
}

export async function leerMiPlan(): Promise<MiPlan> {
  const supabase = await clienteDeSupabase("planes");
  const { data, error } = await supabase.rpc("mi_plan_web");
  if (error) throw new Error(`mi_plan_web: ${error.message}`);
  return data as MiPlan;
}

/**
 * Una card ya armada: el copy del nivel y el precio de una frecuencia. Sin
 * sesión, `precio` es el de lista y no hay `primerCobro`.
 */
export type TarjetaDePlan = {
  nivel: Nivel;
  plan: Frecuencia;
  rotulo: string;
  bajada: string | null;
  beneficios: string[];
  distintivo: string | null;
  destaque: Destaque;
  precio: number;
  precioLista: number;
  primerCobro: string | null;
  esElActual: boolean;
};

/** Un precio, de `precios_web` o de las opciones de `mi_plan_web()`. */
type FilaDePrecio = {
  nivel: Nivel;
  plan: Frecuencia;
  precio: number;
  precio_lista?: number;
  primer_cobro?: string | null;
  es_el_actual?: boolean;
};

/** La vestimenta de cada nivel si la fila de `niveles` no está: la que tiene en la base. */
const destaquePorNivel: Record<Nivel, Destaque> = { esencial: "sobrio", pro: "marcado", equipo: "premium" };

/** Las cards de cada frecuencia, en el orden de los niveles. */
export function armarTarjetas(
  filas: FilaDePrecio[],
  niveles: CopyDeNivel[],
  nombres: Record<Nivel, string>,
): Record<Frecuencia, TarjetaDePlan[]> {
  const deFrecuencia = (plan: Frecuencia) =>
    NIVELES.flatMap((nivel) => {
      const fila = filas.find((f) => f.nivel === nivel && f.plan === plan);
      if (!fila) return [];
      const copy = niveles.find((n) => n.id === nivel);
      return [
        {
          nivel,
          plan,
          rotulo: copy?.rotulo ?? nombres[nivel],
          bajada: copy?.bajada ?? null,
          beneficios: copy?.beneficios ?? [],
          distintivo: copy?.distintivo ?? null,
          destaque: copy?.destaque ?? destaquePorNivel[nivel],
          precio: fila.precio,
          precioLista: fila.precio_lista ?? fila.precio,
          primerCobro: fila.primer_cobro ?? null,
          esElActual: fila.es_el_actual ?? false,
        },
      ];
    });
  return { mensual: deFrecuencia("mensual"), anual: deFrecuencia("anual") };
}
