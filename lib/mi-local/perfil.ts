import "server-only";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * Lo que el cliente ve del local en la app (docs/PLAN-MI-LOCAL-FASE-4.md), con
 * las mismas columnas que lee "Información del negocio": `comercios` se lee
 * por columna desde M2-11, nunca con `*`.
 */

export type PerfilDelLocal = {
  nombre: string;
  /** La principal (`comercios.id_categoria`): la de la card y el mapa. */
  categoria: number | null;
  /** Las demás de `comercios_categorias`, hasta 2: también lo encuentran por ellas. */
  otras: number[];
  /** La calle y la altura, sin la ciudad: así la guarda la app. */
  direccion: string | null;
  localidad: string | null;
  instagram: string | null;
  /** "Sobre el local", hasta 300 caracteres (BooKit 20261029160000_descripcion_del_local). */
  descripcion: string | null;
  /** El círculo (`logo_url`). */
  logo: string | null;
  /** La portada de la ficha (`banner_url`). Vacía, la ficha muestra el logo. */
  portada: string | null;
};

type FilaDelPerfil = {
  nombre: string | null;
  id_categoria: number | null;
  direccion: string | null;
  instagram: string | null;
  descripcion: string | null;
  logo_url: string | null;
  banner_url: string | null;
  localidades: { nombre: string | null } | null;
};

export async function leerPerfilDelLocal(idComercio: string): Promise<PerfilDelLocal> {
  const supabase = await clienteDeSupabase("local");
  const [{ data, error }, categorias] = await Promise.all([
    supabase
      .from("comercios")
      .select("nombre, id_categoria, direccion, instagram, descripcion, logo_url, banner_url, localidades(nombre)")
      .eq("id_comercio", idComercio)
      .single(),
    leerCategoriasDelLocal(idComercio),
  ]);
  if (error) throw new Error(`perfil: ${error.message}`);
  const fila = data as unknown as FilaDelPerfil;
  return {
    nombre: fila.nombre ?? "",
    categoria: fila.id_categoria,
    otras: categorias.filter((id) => id !== fila.id_categoria),
    direccion: fila.direccion?.trim() || null,
    localidad: fila.localidades?.nombre?.trim() || null,
    instagram: fila.instagram,
    descripcion: fila.descripcion,
    logo: fila.logo_url,
    portada: fila.banner_url,
  };
}

/**
 * Todas las categorías del local en `comercios_categorias`, la principal
 * entre ellas (BooKit 20261029140000_varias_categorias).
 */
export async function leerCategoriasDelLocal(idComercio: string): Promise<number[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.from("comercios_categorias").select("id_categoria").eq("id_comercio", idComercio);
  if (error) throw new Error(`categorias-del-local: ${error.message}`);
  return data.map((c) => c.id_categoria as number);
}

/**
 * La dirección como la muestra la ficha (`Shop.direccionParaMostrar`): la
 * calle y la localidad, sin repetirla si la calle ya la trae.
 */
export function direccionParaMostrar({ direccion, localidad }: Pick<PerfilDelLocal, "direccion" | "localidad">) {
  if (!direccion) return null;
  if (!localidad || direccion.toLowerCase().includes(localidad.toLowerCase())) return direccion;
  return `${direccion}, ${localidad}`;
}

/** La ficha del profesional del equipo en un local: su nombre y su foto, lo que ven los clientes al reservar. */
export async function leerMiFicha(idProfesional: string): Promise<{ nombre: string; foto: string | null }> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.from("profesionales").select("nombre, foto_url").eq("id_profesional", idProfesional).single();
  if (error) throw new Error(`mi-ficha: ${error.message}`);
  const fila = data as { nombre: string | null; foto_url: string | null };
  return { nombre: fila.nombre ?? "", foto: fila.foto_url };
}
