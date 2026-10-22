import "server-only";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * Lo que el cliente ve del local en la app (docs/PLAN-MI-LOCAL-FASE-4.md), con
 * las mismas columnas que lee "Información del negocio": `comercios` se lee
 * por columna desde M2-11, nunca con `*`.
 */

export type PerfilDelLocal = {
  nombre: string;
  categoria: number | null;
  /** La calle y la altura, sin la ciudad: así la guarda la app. */
  direccion: string | null;
  localidad: string | null;
  instagram: string | null;
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
  logo_url: string | null;
  banner_url: string | null;
  localidades: { nombre: string | null } | null;
};

export async function leerPerfilDelLocal(idComercio: string): Promise<PerfilDelLocal> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("comercios")
    .select("nombre, id_categoria, direccion, instagram, logo_url, banner_url, localidades(nombre)")
    .eq("id_comercio", idComercio)
    .single();
  if (error) throw new Error(`perfil: ${error.message}`);
  const fila = data as unknown as FilaDelPerfil;
  return {
    nombre: fila.nombre ?? "",
    categoria: fila.id_categoria,
    direccion: fila.direccion?.trim() || null,
    localidad: fila.localidades?.nombre?.trim() || null,
    instagram: fila.instagram,
    logo: fila.logo_url,
    portada: fila.banner_url,
  };
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
