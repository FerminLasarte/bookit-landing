import "server-only";
import type { Nivel } from "@/lib/planes";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * Lo que la gestión del local lee de Supabase, con la sesión del dueño: los
 * servicios (fase 3, docs/PLAN-MI-LOCAL-FASE-3.md). Las mismas consultas que
 * la app (BooKit, `BusinessServicesRepository`).
 */

export type TipoDeSena = "porcentaje" | "fijo";

export type Servicio = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion: number;
  /** Lo que se cobra de adelanto con Mercado Pago, o `null` si no pide seña. */
  sena: { tipo: TipoDeSena; valor: number } | null;
};

type FilaDeServicio = {
  id_servicio: number;
  nombre: string;
  descripcion: string | null;
  precio: number | null;
  duracion_minutos: number;
  requiere_sena: boolean;
  tipo_sena: string | null;
  valor_sena: number | null;
};

const columnas = "id_servicio, nombre, descripcion, precio, duracion_minutos, requiere_sena, tipo_sena, valor_sena";

const servicioDe = (fila: FilaDeServicio): Servicio => ({
  id: fila.id_servicio,
  nombre: fila.nombre,
  descripcion: fila.descripcion?.trim() || null,
  precio: fila.precio ?? 0,
  duracion: fila.duracion_minutos,
  // `Servicio.senaLegible` de la app: sin valor, no hay seña que mostrar.
  sena:
    fila.requiere_sena && (fila.valor_sena ?? 0) > 0
      ? { tipo: fila.tipo_sena === "porcentaje" ? "porcentaje" : "fijo", valor: fila.valor_sena ?? 0 }
      : null,
});

/** Los servicios activos del local, por nombre. Un dado de baja no se ve. */
export async function leerServicios(idComercio: string): Promise<Servicio[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("servicios")
    .select(columnas)
    .eq("id_comercio", idComercio)
    .eq("esta_activo", true)
    .order("nombre");
  if (error) throw new Error(`servicios: ${error.message}`);
  return (data as FilaDeServicio[]).map(servicioDe);
}

/** Un servicio activo del local, o `null` si no es suyo o se dio de baja. */
export async function leerServicio(idComercio: string, id: number): Promise<Servicio | null> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("servicios")
    .select(columnas)
    .eq("id_comercio", idComercio)
    .eq("id_servicio", id)
    .eq("esta_activo", true)
    .maybeSingle();
  if (error) throw new Error(`servicio: ${error.message}`);
  return data ? servicioDe(data as FilaDeServicio) : null;
}

/**
 * Cuántos turnos por venir tiene un servicio, para avisar antes de darlo de
 * baja (`contarTurnosReservados` de la app): pendientes o confirmados, desde
 * ahora. `null` si no se pudo contar: la baja se avisa igual, sin el número.
 */
export async function contarTurnosPorVenir(idServicio: number): Promise<number | null> {
  const supabase = await clienteDeSupabase("local");
  const { count, error } = await supabase
    .from("turnos")
    .select("id_turno", { count: "exact", head: true })
    .eq("id_servicio", idServicio)
    .in("estado", ["pendiente", "confirmado"])
    .gte("fecha_hora_inicio", new Date().toISOString());
  if (error) {
    console.error("mi-local/turnos-por-venir:", error.code, error.message);
    return null;
  }
  return count ?? 0;
}

/**
 * Si el plan del local incluye cobrar seña con Mercado Pago (`niveles.cobro_mp`)
 * y, si no, el primer nivel que la incluye, para decir "Disponible en Pro" como
 * la app. La base no frena la seña en el servicio: la frena al cobrar.
 */
export async function leerSenaDelPlan(nivel: Nivel | null): Promise<{ incluida: boolean; desde: string | null }> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.from("niveles").select("id, rotulo, cobro_mp").order("orden");
  // Sin saber el plan, la seña no se ofrece: es lo que hace la app con un plan que no la incluye.
  if (error) {
    console.error("mi-local/niveles:", error.code, error.message);
    return { incluida: false, desde: null };
  }
  const niveles = data as { id: Nivel; rotulo: string; cobro_mp: boolean }[];
  return {
    incluida: niveles.some((n) => n.id === nivel && n.cobro_mp),
    desde: niveles.find((n) => n.cobro_mp)?.rotulo ?? null,
  };
}
