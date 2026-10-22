import "server-only";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * Los cupones y los premios del local (fase 5, docs/PLAN-MI-LOCAL-FASE-5.md),
 * como Cupones y Recompensas de la app. Se leen y se escriben directo en sus
 * tablas con la sesión del dueño (`es_duenio_comercio`). Lo que no va lo
 * frenan los CHECKs de BooKit 20261022210000; el formulario dice antes lo
 * mismo, con las frases de la app.
 */

/** Cómo descuenta un cupón o un premio. `gratis` es sólo de los premios. */
export type Beneficio = "gratis" | "porcentaje" | "monto";

/** Cuándo vale: los días (ISO, 1 es lunes, como la base) y una franja optativa, `09:00`. */
export type Disponibilidad = { dias: number[]; horaInicio: string | null; horaFin: string | null };

export type Cupon = Disponibilidad & {
  id: number;
  /** Para el dueño: no sale de su lista. */
  nombre: string;
  /** Lo que escribe el cliente. */
  codigo: string;
  /** `2026-10-21`: vale desde el primero y todo el último. */
  desde: string;
  hasta: string;
  activo: boolean;
  tipo: Exclude<Beneficio, "gratis">;
  valor: number;
  /** El tope de canjes, o `null` sin tope. */
  limite: number | null;
  usos: number;
  /** Vacía es todos los servicios. */
  servicios: number[];
};

export type Premio = Disponibilidad & {
  id: string;
  titulo: string;
  /** Lo que lee el cliente debajo del premio. */
  descripcion: string | null;
  puntos: number;
  /** Las visitas al local que pide antes de canjearlo. */
  visitas: number;
  tipo: Beneficio;
  valor: number;
  servicios: number[];
  activo: boolean;
};

const TODOS_LOS_DIAS = [1, 2, 3, 4, 5, 6, 7];
/** `09:00` de `09:00:00` o `09:00`. */
const hora = (v: unknown) => (typeof v === "string" && v ? v.slice(0, 5) : null);
const numeros = (v: unknown) => (Array.isArray(v) ? v.map(Number).filter((n) => Number.isInteger(n)) : []);
const dias = (v: unknown) => {
  const lista = numeros(v);
  return lista.length ? lista : TODOS_LOS_DIAS;
};

type FilaDeCupon = {
  id_promocion: number;
  nombre: string | null;
  codigo: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  esta_activo: boolean | null;
  usos_contador: number | null;
  reglas_json: Record<string, unknown> | null;
};

const COLUMNAS_DE_CUPON = "id_promocion, nombre, codigo, fecha_inicio, fecha_fin, esta_activo, usos_contador, reglas_json";

function cuponDe(f: FilaDeCupon): Cupon {
  const r = f.reglas_json ?? {};
  return {
    id: f.id_promocion,
    nombre: f.nombre ?? "",
    codigo: f.codigo ?? "",
    desde: f.fecha_inicio,
    hasta: f.fecha_fin,
    activo: f.esta_activo ?? false,
    tipo: r.tipo_descuento === "monto" ? "monto" : "porcentaje",
    valor: Number(r.valor_descuento ?? 0),
    limite: r.limite_usos_total == null ? null : Number(r.limite_usos_total),
    usos: f.usos_contador ?? 0,
    servicios: numeros(r.servicios_aplica),
    dias: dias(r.dias_validos),
    horaInicio: hora(r.hora_inicio),
    horaFin: hora(r.hora_fin),
  };
}

/** Los cupones del local, los que empiezan más tarde primero, como la app. */
export async function leerCupones(idComercio: string): Promise<Cupon[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("promociones")
    .select(COLUMNAS_DE_CUPON)
    .eq("id_comercio", idComercio)
    .order("fecha_inicio", { ascending: false });
  if (error) throw new Error(`cupones: ${error.message}`);
  return (data as FilaDeCupon[]).map(cuponDe);
}

/** Un cupón del local, o `null` si no es suyo o no existe. */
export async function leerCupon(idComercio: string, id: number): Promise<Cupon | null> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("promociones")
    .select(COLUMNAS_DE_CUPON)
    .eq("id_comercio", idComercio)
    .eq("id_promocion", id)
    .maybeSingle();
  if (error) throw new Error(`cupon: ${error.message}`);
  return data ? cuponDe(data as FilaDeCupon) : null;
}

/** Si un cupón vale: activo y sin vencer. Vale todo su último día, como en la app. */
export const sirve = (cupon: Cupon, hoy: string) => cupon.activo && hoy <= cupon.hasta;

type FilaDePremio = {
  id_recompensa: string;
  titulo: string;
  descripcion: string | null;
  costo_puntos: number;
  turnos_minimos_requeridos: number | null;
  tipo_beneficio: string | null;
  valor_beneficio: number | string | null;
  id_servicios: number[] | null;
  dias_validos: unknown;
  hora_inicio: string | null;
  hora_fin: string | null;
  esta_activa: boolean | null;
};

const COLUMNAS_DE_PREMIO =
  "id_recompensa, titulo, descripcion, costo_puntos, turnos_minimos_requeridos, tipo_beneficio, valor_beneficio, id_servicios, dias_validos, hora_inicio, hora_fin, esta_activa";

function premioDe(f: FilaDePremio): Premio {
  return {
    id: f.id_recompensa,
    titulo: f.titulo,
    descripcion: f.descripcion,
    puntos: f.costo_puntos,
    visitas: f.turnos_minimos_requeridos ?? 0,
    tipo: f.tipo_beneficio === "porcentaje" || f.tipo_beneficio === "monto" ? f.tipo_beneficio : "gratis",
    valor: Number(f.valor_beneficio ?? 0),
    servicios: numeros(f.id_servicios),
    dias: dias(f.dias_validos),
    horaInicio: hora(f.hora_inicio),
    horaFin: hora(f.hora_fin),
    activo: f.esta_activa ?? true,
  };
}

/** Los premios del local, los más nuevos primero, como la app. */
export async function leerPremios(idComercio: string): Promise<Premio[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("recompensas_comercios")
    .select(COLUMNAS_DE_PREMIO)
    .eq("id_comercio", idComercio)
    .order("creado_el", { ascending: false });
  if (error) throw new Error(`premios: ${error.message}`);
  return (data as FilaDePremio[]).map(premioDe);
}

/** Un premio del local, o `null` si no es suyo o no existe. */
export async function leerPremio(idComercio: string, id: string): Promise<Premio | null> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("recompensas_comercios")
    .select(COLUMNAS_DE_PREMIO)
    .eq("id_comercio", idComercio)
    .eq("id_recompensa", id)
    .maybeSingle();
  if (error) throw new Error(`premio: ${error.message}`);
  return data ? premioDe(data as FilaDePremio) : null;
}

/** Si el local da puntos: `comercios.habilita_puntos`. */
export async function leerProgramaDePuntos(idComercio: string): Promise<boolean> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.from("comercios").select("habilita_puntos").eq("id_comercio", idComercio).maybeSingle();
  if (error) throw new Error(`puntos: ${error.message}`);
  return Boolean((data as { habilita_puntos: boolean | null } | null)?.habilita_puntos);
}
