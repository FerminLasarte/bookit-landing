import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { miLocal } from "@/content/mi-local";
import { leerMiPlan, type MiPlan } from "@/lib/planes";
import { clienteDeSupabase } from "@/lib/supabase";
import { leerMiCuenta } from "./gestion";

/*
 * Dónde está parada la cuenta en el panel: su local, o un local donde trabaja
 * con su cuenta (docs/PLAN-MI-LOCAL-EQUIPO.md). Las mismas lecturas que la app
 * (BooKit, `AuthProvider` y `staff_bottom_nav_bar.dart`): las filas de
 * `profesionales` de la cuenta, `mi_plan_web()` para el local propio y
 * `acceso_de_mi_local()` para el ajeno (D6).
 */

/** La cookie con el lugar elegido: una preferencia de esta compu, como el lado elegido en el teléfono (D1). */
export const COOKIE_DEL_LUGAR = "mi-local-lugar";

/** Un lugar donde la cuenta puede entrar. `clave`: lo que se guarda en la cookie, con el formato de la app (`comercio`, `staff:<id>`). */
export type OpcionDeLugar = {
  clave: string;
  /** El id del local. */
  id: string;
  nombre: string;
  logo: string | null;
  rol: "duenio" | "profesional";
};

/** Por qué un profesional no entra al local, en el orden en que lo mira la app. */
export type Bloqueo = "cerrado" | "fueraDelEquipo" | "enPausa" | "sinCuentas" | "sinLugar";

type Elegido = { lugares: OpcionDeLugar[] };

export type LugarDelDuenio = OpcionDeLugar & Elegido & { rol: "duenio"; suscripcion: NonNullable<MiPlan["suscripcion"]> };

export type LugarDelProfesional = OpcionDeLugar &
  Elegido & { rol: "profesional"; idProfesional: string; bloqueo: Bloqueo | null };

export type Lugar = LugarDelDuenio | LugarDelProfesional;

/**
 * El círculo de un local en la app (`comercios.logo_url`), o `null` si no
 * subió uno. Un error no tapa el panel: el marco muestra la inicial.
 */
async function leerLogoDelLocal(idComercio: string): Promise<string | null> {
  const supabase = await clienteDeSupabase("local");
  const { data } = await supabase.from("comercios").select("logo_url").eq("id_comercio", idComercio).maybeSingle();
  return (data as { logo_url: string | null } | null)?.logo_url ?? null;
}

type FilaDeLugar = {
  id_profesional: string;
  id_comercio: string;
  comercios: { nombre: string | null; logo_url: string | null } | null;
};

/** Las filas de `profesionales` de la cuenta, con el nombre y el logo de cada local. */
async function leerMisFilas(miId: string): Promise<FilaDeLugar[]> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase
    .from("profesionales")
    .select("id_profesional, id_comercio, comercios(nombre, logo_url)")
    .eq("auth_user_id", miId);
  if (error) throw new Error(`lugares: ${error.message}`);
  return data as unknown as FilaDeLugar[];
}

/** Lo que dice la base del local ajeno, con la regla de la app y `staff_incluido` al final (D4). */
async function leerBloqueo(idProfesional: string): Promise<Bloqueo | null> {
  const supabase = await clienteDeSupabase("local");
  const { data, error } = await supabase.rpc("acceso_de_mi_local", { p_profesional: idProfesional });
  // Si la llamada falla, entra igual, como la app: la base sigue cuidando lo suyo.
  if (error) {
    console.error("mi-local/acceso:", error.code, error.message);
    return null;
  }
  const [acceso] = data as {
    estado_suscripcion: string | null;
    esta_activo: boolean | null;
    dado_de_baja: boolean;
    staff_incluido: boolean;
  }[];
  if (!acceso) return "sinLugar";
  if (acceso.dado_de_baja) return "cerrado";
  if (acceso.esta_activo === false) return "fueraDelEquipo";
  // Un estado que no se conoce deja entrar, como `EstadoSuscripcion.desdeBase`.
  if (["pendiente", "cortada", "suspendida"].includes(acceso.estado_suscripcion ?? "")) return "enPausa";
  if (!acceso.staff_incluido) return "sinCuentas";
  return null;
}

/**
 * El lugar de la cuenta: el de la cookie si todavía es suyo y, si no, el
 * orden de la app (`resolverLado`): el local propio, después el primero por
 * nombre. Sin ninguno, va a /mi-local/sin-local. El chequeo vive acá y no en
 * el layout: Next dibuja la página en paralelo al layout, así que un layout
 * que corta no evita que la página lea. Con `cache`, el marco del panel y la
 * página comparten la lectura.
 */
export const leerMiLugar = cache(async (): Promise<Lugar> => {
  const cuenta = await leerMiCuenta();
  const [plan, filas, logoPropio, almacen] = await Promise.all([
    leerMiPlan(),
    leerMisFilas(cuenta.id),
    // El local propio tiene el id de la cuenta: así lo crea el alta, y así lo busca la app.
    leerLogoDelLocal(cuenta.id),
    cookies(),
  ]);

  const propio = plan.comercio && plan.suscripcion ? { ...plan.comercio, suscripcion: plan.suscripcion } : null;
  const ajenos = filas
    .filter((f) => String(f.id_comercio) !== propio?.id)
    .map(
      (f): OpcionDeLugar & { rol: "profesional"; idProfesional: string } => ({
        clave: `staff:${f.id_profesional}`,
        id: String(f.id_comercio),
        nombre: f.comercios?.nombre?.trim() || miLocal.panel.cambiarDeLugar.sinNombre,
        logo: f.comercios?.logo_url ?? null,
        rol: "profesional",
        idProfesional: String(f.id_profesional),
      }),
    )
    // Por nombre, como la app: sin un orden fijo, quien no eligió podría entrar a otro local cada vez.
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const lugares: OpcionDeLugar[] = [
    ...(propio ? [{ clave: "comercio", id: propio.id, nombre: propio.nombre, logo: logoPropio, rol: "duenio" as const }] : []),
    ...ajenos,
  ];
  const guardado = almacen.get(COOKIE_DEL_LUGAR)?.value;
  const elegido = lugares.find((l) => l.clave === guardado) ?? lugares[0];
  if (!elegido) redirect("/mi-local/sin-local");

  if (elegido.rol === "duenio" && propio) return { ...elegido, rol: "duenio", suscripcion: propio.suscripcion, lugares };
  const ajeno = ajenos.find((a) => a.clave === elegido.clave);
  if (!ajeno) redirect("/mi-local/sin-local");
  return { ...ajeno, bloqueo: await leerBloqueo(ajeno.idProfesional), lugares };
});

/**
 * Si el local del dueño entra a su agenda. Es la regla del gate de la app
 * (`EstadoSuscripcion.daAcceso`): al día o en gracia.
 */
export const daAcceso = (estado: LugarDelDuenio["suscripcion"]["estado"]) => estado === "al_dia" || estado === "en_gracia";

/** Si el lugar entra al panel: el local propio con la suscripción al día, el ajeno sin bloqueo (D5). */
export const entra = (lugar: Lugar) => (lugar.rol === "duenio" ? daAcceso(lugar.suscripcion.estado) : lugar.bloqueo === null);

/**
 * El lugar, si entra al panel, o `null`. Las pantallas de adentro mandan a la
 * agenda, que dice por qué no entra; las acciones contestan que no tiene
 * acceso.
 */
export async function leerLugarQueEntra(): Promise<Lugar | null> {
  const lugar = await leerMiLugar();
  return entra(lugar) ? lugar : null;
}

/** El local, si entra y la cuenta es su dueña, o `null`: las pantallas del local mandan a la agenda al profesional. */
export async function leerLocalDelDuenio(): Promise<LugarDelDuenio | null> {
  const lugar = await leerLugarQueEntra();
  return lugar?.rol === "duenio" ? lugar : null;
}
