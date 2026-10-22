import "server-only";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import { planes } from "@/content/planes";
import { campo } from "@/lib/formularios";
import { clienteDeSupabase } from "@/lib/supabase";

/*
 * Lo que necesita el alta del local por la web. Es lo mismo que usa la app,
 * con la sesión de la persona: `categorias`, `buscar_localidades`,
 * `autocompletar_direccion` y `crear_mi_comercio` (BooKit, docs/web-en-pesos.md §9).
 */

export type Categoria = { id: number; nombre: string };

export type Localidad = {
  id: string;
  nombre: string;
  provincia: string | null;
  departamento: string | null;
  lat: number;
  lng: number;
};

export type SugerenciaDeDireccion = { placeId: string; principal: string; secundario: string };

export type DireccionResuelta = { direccion: string; lat: number; lng: number };

/** El radio alrededor del centro de la localidad, como `direcciones_source.dart` de la app. */
const RADIO_KM = 25;

export async function leerCategorias(): Promise<Categoria[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.from("categorias").select("id_categoria, nombre").order("orden");
  if (error) throw new Error(`categorias: ${error.message}`);
  return data.map((c) => ({ id: c.id_categoria as number, nombre: c.nombre as string }));
}

type FilaDeLocalidad = {
  id: string;
  nombre: string;
  provincia: string | null;
  departamento: string | null;
  latitud: number;
  longitud: number;
};

export async function buscarLocalidades(termino: string): Promise<Localidad[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.rpc("buscar_localidades", { termino, limite: 10 });
  if (error) throw new Error(`buscar_localidades: ${error.message}`);
  return (data as FilaDeLocalidad[]).map((l) => ({
    id: l.id,
    nombre: l.nombre,
    provincia: l.provincia,
    departamento: l.departamento,
    lat: l.latitud,
    lng: l.longitud,
  }));
}

/** Las calles de la localidad mientras se escribe. Dentro de una `sesion`, Google no las cobra. */
export async function sugerirDirecciones(
  sesion: string,
  texto: string,
  localidad: Pick<Localidad, "nombre" | "lat" | "lng">,
): Promise<SugerenciaDeDireccion[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.functions.invoke<{ sugerencias?: SugerenciaDeDireccion[] }>(
    "autocompletar_direccion",
    {
      body: {
        accion: "sugerir",
        sesion,
        texto,
        centro: { lat: localidad.lat, lng: localidad.lng },
        radioKm: RADIO_KM,
        // Con el nombre, la función descarta las localidades vecinas que caen en el círculo.
        localidad: localidad.nombre,
      },
    },
  );
  if (error) throw error;
  return (data?.sugerencias ?? []).map(({ placeId, principal, secundario }) => ({ placeId, principal, secundario }));
}

/** La calle elegida, con su punto. Es la única llamada que Google cobra, y cierra la sesión. */
export async function resolverDireccion(sesion: string, placeId: string): Promise<DireccionResuelta | null> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.functions.invoke<{ direccion?: string; latitud?: number; longitud?: number }>(
    "autocompletar_direccion",
    { body: { accion: "detalle", sesion, placeId } },
  );
  if (error) throw error;
  if (!data?.direccion || data.latitud == null || data.longitud == null) return null;
  return { direccion: data.direccion, lat: data.latitud, lng: data.longitud };
}

/**
 * El usuario de Instagram pelado y en minúscula, como `instagram_handle.dart`
 * de la app: `@local`, `local` y el link del perfil quedan iguales. `null` si
 * vino vacío. Lo que no es un usuario vuelve como está, y `esInstagramValido`
 * lo rechaza.
 */
export function normalizarInstagram(texto: string): string | null {
  let valor = texto.trim();
  if (!valor) return null;
  valor = valor.split(/[?#]/)[0] ?? "";

  const host = /^(https?:)?\/*((www|m)\.)?instagram\.com\//i;
  const eraUnLink = host.test(valor);
  valor = valor.replace(host, "");
  if (eraUnLink) valor = valor.split("/")[0] ?? "";

  valor = valor.replace(/^@+/, "").trim().toLowerCase();
  return valor || null;
}

/** El alfabeto de Instagram, igual que el CHECK de `comercios.instagram`. */
export const esInstagramValido = (usuario: string) => /^[a-z0-9._]{1,30}$/.test(usuario);

export type CampoDelLocal = "nombre" | "categoria" | "localidad" | "direccion" | "instagram";

/** Dónde está el local: la localidad, la calle y el punto, como los eligió de las listas. */
export type UbicacionDelLocal = { localidad: string; direccion: string; lat: number; lng: number };

type Cuando = "obligatoria" | "si-viene";

export type DatosDelLocal<C extends Cuando = Cuando> = {
  nombre: string;
  categoria: number;
  instagram: string | null;
  /** `null` si el formulario no la trae: en el perfil, la dirección no se cambió. */
  ubicacion: C extends "obligatoria" ? UbicacionDelLocal : UbicacionDelLocal | null;
};

const basicos = z.object({
  nombre: z.string().trim().min(1).max(80),
  categoria: z.coerce.number().int().positive(),
});

const ubicacion = z.object({
  localidad: z.string().min(1),
  direccion: z.string().trim().min(1).max(200),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

/**
 * Los datos del local de un formulario, validados igual en el alta y en el
 * perfil, o un error por campo. Con `ubicacion: "si-viene"`, una ubicación sin
 * tocar no es un error: el perfil no la manda si no se cambió.
 */
export function leerDatosDelLocal<C extends Cuando>(
  datos: FormData,
  { ubicacion: cuando }: { ubicacion: C },
): { datos: DatosDelLocal<C>; errores: null } | { datos: null; errores: Partial<Record<CampoDelLocal, string>> } {
  const copy = planes.alta.errores;
  const errores: Partial<Record<CampoDelLocal, string>> = {};

  const leidos = basicos.safeParse({ nombre: campo(datos, "nombre"), categoria: campo(datos, "categoria") });
  if (!leidos.success) for (const issue of leidos.error.issues) errores[issue.path[0] as "nombre" | "categoria"] = copy.falta;

  const enElFormulario = {
    localidad: campo(datos, "localidad"),
    direccion: campo(datos, "direccion"),
    lat: campo(datos, "lat"),
    lng: campo(datos, "lng"),
  };
  const viene = cuando === "obligatoria" || Object.values(enElFormulario).some(Boolean);
  const lugar = viene ? ubicacion.safeParse(enElFormulario) : null;
  if (lugar && !lugar.success) {
    for (const issue of lugar.error.issues) {
      if (issue.path[0] === "localidad") errores.localidad = copy.localidad;
      else errores.direccion = copy.direccion;
    }
  }

  const instagram = normalizarInstagram(campo(datos, "instagram"));
  if (instagram && !esInstagramValido(instagram)) errores.instagram = copy.instagram;

  if (!leidos.success || lugar?.success === false || Object.keys(errores).length > 0) return { datos: null, errores };
  const leidosDelLocal = { ...leidos.data, instagram, ubicacion: lugar?.data ?? null };
  return { datos: leidosDelLocal as DatosDelLocal<C>, errores: null };
}

/** El nombre del dueño para su ficha de profesional, como lo arma la app. */
export function nombreDelDuenio(user: User): string {
  const meta = user.user_metadata ?? {};
  const nombre = String(meta.full_name ?? meta.nombre ?? "").trim();
  if (nombre) return nombre;
  const delMail = user.email?.split("@")[0] ?? "";
  return delMail ? delMail.charAt(0).toUpperCase() + delMail.slice(1) : "Dueño";
}
