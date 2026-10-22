import "server-only";
import { refresh } from "next/cache";
import { miLocal } from "@/content/mi-local";
import type { Forma } from "@/lib/encuadre";
import { clienteDeSupabase } from "@/lib/supabase";
import type { Respuesta } from "./respuesta";

/*
 * Las fotos del local y del equipo, en el bucket `logos`, con los nombres que
 * usa la app (`photo_upload.dart`, `staff_profile_repository.dart`): la
 * política de Storage deja subir a cada uno sólo su ruta (`_es_mi_ruta_de_logos`).
 * Se sube con la sesión de quien entra, nunca con la service role.
 */

const BUCKET = "logos";

/** Un recorte pesa unos cientos de KB; el bucket acepta hasta 5 MB. */
const PESO_MAXIMO = 2 * 1024 * 1024;

/**
 * Los recortes que mandó el navegador, si son JPEG de verdad (la firma del
 * archivo, no lo que dice el navegador), o `null`.
 */
async function leerRecortes<F extends Forma>(datos: FormData, formas: F[]): Promise<Record<F, File> | null> {
  const recortes = {} as Record<F, File>;
  for (const forma of formas) {
    const archivo = datos.get(forma);
    if (!(archivo instanceof File) || archivo.size === 0 || archivo.size > PESO_MAXIMO) return null;
    const firma = new Uint8Array(await archivo.slice(0, 3).arrayBuffer());
    if (firma[0] !== 0xff || firma[1] !== 0xd8 || firma[2] !== 0xff) return null;
    recortes[forma] = archivo;
  }
  return recortes;
}

/** Sube un recorte y devuelve su URL pública, la que guarda la tabla. */
async function subir(ruta: string, archivo: File): Promise<string> {
  const storage = (await clienteDeSupabase("local")).storage.from(BUCKET);
  const { error } = await storage.upload(ruta, archivo, { contentType: "image/jpeg" });
  if (error) throw new Error(`fotos: ${error.message}`);
  return storage.getPublicUrl(ruta).data.publicUrl;
}

/**
 * Borra las fotos reemplazadas, como `borrarFotosReemplazadas` de la app: sólo
 * las del bucket (una foto de Google, de Apple o de stock no es de la persona).
 * Si falla no pasa nada: la nueva ya quedó.
 */
async function borrarReemplazadas(urls: (string | null)[]) {
  const rutas = urls.flatMap((url) => {
    const ruta = url?.split(`/object/public/${BUCKET}/`)[1];
    return ruta ? [decodeURIComponent(ruta)] : [];
  });
  if (rutas.length === 0) return;
  const { error } = await (await clienteDeSupabase("local")).storage.from(BUCKET).remove(rutas);
  if (error) console.error("mi-local/fotos: no se pudo borrar la anterior:", error.message);
}

/**
 * La foto del local: el círculo a `logo_url` y la portada a `banner_url`. Sube
 * las dos en serie, como la app; si la tabla no se escribe, quedan sueltas.
 */
export async function cambiarFotoDelLocal(idComercio: string, recortes: Record<Forma, File>) {
  const supabase = await clienteDeSupabase("local");
  const { data: antes } = await supabase.from("comercios").select("logo_url, banner_url").eq("id_comercio", idComercio).single();

  const sello = Date.now();
  const logo = await subir(`comercios/${idComercio}_${sello}_perfil.jpg`, recortes.perfil);
  const portada = await subir(`comercios/${idComercio}_${sello}_portada.jpg`, recortes.portada);

  const { data, error } = await supabase
    .from("comercios")
    .update({ logo_url: logo, banner_url: portada })
    .eq("id_comercio", idComercio)
    .select("id_comercio");
  if (error) throw new Error(`fotos: ${error.message}`);
  if (!data?.length) throw new Error("fotos: el local no se actualizó");

  const anteriores = antes as { logo_url: string | null; banner_url: string | null } | null;
  await borrarReemplazadas([anteriores?.logo_url ?? null, anteriores?.banner_url ?? null]);
}

/** La foto de un profesional, cuadrada, a `foto_url`. Quién puede lo mira la acción. */
export async function cambiarFotoDelProfesional(idProfesional: string, recorte: File) {
  const supabase = await clienteDeSupabase("local");
  const { data: antes } = await supabase.from("profesionales").select("foto_url").eq("id_profesional", idProfesional).single();

  const foto = await subir(`profesionales/${idProfesional}_${Date.now()}.jpg`, recorte);

  const { data, error } = await supabase
    .from("profesionales")
    .update({ foto_url: foto })
    .eq("id_profesional", idProfesional)
    .select("id_profesional");
  if (error) throw new Error(`fotos: ${error.message}`);
  if (!data?.length) throw new Error("fotos: el profesional no se actualizó");

  await borrarReemplazadas([(antes as { foto_url: string | null } | null)?.foto_url ?? null]);
}

/**
 * Lo que hace cada acción de foto después de mirar quién puede: lee los
 * recortes, llama a `cambiar` y contesta. Un recorte que no es un JPEG o una
 * subida que falla dan el mismo error, y se anota.
 */
export async function guardarFoto<F extends Forma>(
  datos: FormData,
  formas: F[],
  cambiar: (recortes: Record<F, File>) => Promise<void>,
  donde: string,
): Promise<Respuesta> {
  const { errores } = miLocal.encuadre;
  const recortes = await leerRecortes(datos, formas);
  if (!recortes) return { error: errores.subir };
  try {
    await cambiar(recortes);
  } catch (error) {
    console.error(`mi-local/${donde}:`, error);
    return { error: errores.subir };
  }
  refresh();
  return { error: null, listo: true };
}
