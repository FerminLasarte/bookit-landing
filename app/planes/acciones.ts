"use server";

import { FunctionsHttpError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { z } from "zod";
import { planes, type CodigoDeError } from "@/content/planes";
import { esInstagramValido, nombreDelDuenio, normalizarInstagram } from "@/lib/alta";
import { FRECUENCIAS, NIVELES } from "@/lib/planes";
import { clienteDeSupabase, clientePublico } from "@/lib/supabase";

/*
 * Lo que /planes le pide al servidor. Quién es sale siempre de la sesión: las
 * funciones de Supabase leen el JWT, y acá nunca se manda quién compra.
 */

export type EstadoDeEntrar = { error: string | null };

export async function entrarConMail(_: EstadoDeEntrar, datos: FormData): Promise<EstadoDeEntrar> {
  const { errores } = planes.sinSesion;
  const email = String(datos.get("email") ?? "").trim();
  const password = String(datos.get("password") ?? "");
  if (!email || !password) return { error: errores.faltan };

  const supabase = await clienteDeSupabase("planes");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "invalid_credentials") return { error: errores.credenciales };
    if (error.code === "email_not_confirmed") return { error: errores.sinConfirmar };
    console.error("planes/entrar:", error.code, error.message);
    return { error: errores.generico };
  }
  redirect("/planes");
}

// ── La cuenta nueva (contrato §9) ──

export type EstadoDeCrearCuenta = { error: string | null; enviadoA: string | null };

/** Pide el mail de la cuenta, con la misma función que la app. `desde: 'web'` hace que el enlace vuelva acá. */
async function pedirMailDeCuenta(cuerpo: Record<string, unknown>) {
  return clientePublico().functions.invoke("enviar_email_auth", { body: { ...cuerpo, desde: "web" } });
}

const statusDe = (error: unknown) => (error instanceof FunctionsHttpError ? error.context.status : null);

export async function crearCuenta(_: EstadoDeCrearCuenta, datos: FormData): Promise<EstadoDeCrearCuenta> {
  const { errores } = planes.sinSesion;
  const nombre = String(datos.get("nombre") ?? "").trim();
  const email = String(datos.get("email") ?? "").trim().toLowerCase();
  const password = String(datos.get("password") ?? "");
  if (!nombre || !email || !password) return { error: errores.faltanAlta, enviadoA: null };
  if (password.length < 6) return { error: errores.corta, enviadoA: null };

  const { error } = await pedirMailDeCuenta({
    action: "signup",
    email,
    password,
    data: { full_name: nombre, rol_deseado: "comercio" },
  });
  if (!error) return { error: null, enviadoA: email };

  const status = statusDe(error);
  // La cuenta existe y la contraseña es la suya: entra, como hace la app.
  if (status === 409) {
    const supabase = await clienteDeSupabase("planes");
    const { error: alEntrar } = await supabase.auth.signInWithPassword({ email, password });
    if (!alEntrar) redirect("/planes");
    console.error("planes/crear-cuenta: 409 sin poder entrar:", alEntrar.code);
    return { error: errores.generico, enviadoA: null };
  }
  if (status === 429) return { error: errores.esperar, enviadoA: null };
  console.error("planes/crear-cuenta:", status, error);
  return { error: errores.generico, enviadoA: null };
}

/** Vuelve a mandar la confirmación. La función contesta 200 haya cuenta o no. */
export async function reenviarMail(email: string): Promise<{ error: string | null }> {
  const { error } = await pedirMailDeCuenta({ action: "resend_signup", email });
  if (!error) return { error: null };
  const { errores } = planes.sinSesion;
  return { error: statusDe(error) === 429 ? errores.esperar : errores.generico };
}

// ── El local ──

export type CampoDelAlta = "nombre" | "categoria" | "localidad" | "direccion" | "instagram";
export type EstadoDelAlta = { errores: Partial<Record<CampoDelAlta, string>>; general: string | null };

const alta = z.object({
  nombre: z.string().trim().min(1).max(80),
  categoria: z.coerce.number().int().positive(),
  localidad: z.string().min(1),
  direccion: z.string().trim().min(1).max(200),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

/** Da de alta el local con `crear_mi_comercio`: nace pendiente, y /planes pasa a ofrecer los planes. */
export async function crearLocal(_: EstadoDelAlta, datos: FormData): Promise<EstadoDelAlta> {
  const copy = planes.alta.errores;
  const campo = (nombre: string) => String(datos.get(nombre) ?? "");

  const errores: EstadoDelAlta["errores"] = {};
  const leido = alta.safeParse({
    nombre: campo("nombre"),
    categoria: campo("categoria"),
    localidad: campo("localidad"),
    direccion: campo("direccion"),
    lat: campo("lat"),
    lng: campo("lng"),
  });
  if (!leido.success) {
    for (const issue of leido.error.issues) {
      const clave = issue.path[0];
      if (clave === "nombre" || clave === "categoria") errores[clave] = copy.falta;
      if (clave === "localidad") errores.localidad = copy.localidad;
      if (clave === "direccion" || clave === "lat" || clave === "lng") errores.direccion = copy.direccion;
    }
  }
  const instagram = normalizarInstagram(campo("instagram"));
  if (instagram && !esInstagramValido(instagram)) errores.instagram = copy.instagram;
  if (!leido.success || Object.keys(errores).length > 0) return { errores, general: null };

  const supabase = await clienteDeSupabase("planes");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/planes?error=sesion");

  const d = leido.data;
  const { error } = await supabase.rpc("crear_mi_comercio", {
    p_nombre: d.nombre,
    p_direccion: d.direccion,
    p_localidad_id: d.localidad,
    p_id_categoria: d.categoria,
    p_lat: d.lat,
    p_lng: d.lng,
    p_instagram: instagram,
    p_nombre_duenio: nombreDelDuenio(user),
  });
  // `ya_tiene_comercio`: lo creó en otra pestaña o en la app. Releer muestra los planes.
  if (error && error.hint !== "ya_tiene_comercio") {
    console.error("planes/crear-local:", error.code, error.message);
    return { errores: {}, general: copy.generico };
  }
  redirect("/planes");
}

export type ResultadoDeCompra =
  | { ok: true; initPoint: string }
  | { ok: false; codigo: CodigoDeError; vence: string | null };

export type ResultadoDeBaja = { ok: true } | { ok: false; codigo: CodigoDeError };

const pedido = z.object({
  nivel: z.enum(NIVELES),
  plan: z.enum(FRECUENCIAS),
  email: z.email().optional(),
});

/** El cuerpo de un error de las funciones: `{ codigo, vence? }`, status 400 o 401. */
async function codigoDelError(error: unknown): Promise<{ codigo: CodigoDeError; vence: string | null }> {
  if (error instanceof FunctionsHttpError) {
    try {
      const cuerpo = (await error.context.json()) as { codigo?: string; vence?: string; error?: string };
      if (cuerpo.codigo && cuerpo.codigo in planes.errores) {
        if (cuerpo.error) console.error("planes:", cuerpo.codigo, cuerpo.error);
        return { codigo: cuerpo.codigo as CodigoDeError, vence: cuerpo.vence ?? null };
      }
    } catch {
      // Un cuerpo que no es JSON es un error nuestro.
    }
  }
  console.error("planes:", error);
  return { codigo: "interno", vence: null };
}

/** Pide el link de pago del débito. La página redirige a `initPoint`. */
export async function comprar(entrada: z.input<typeof pedido>): Promise<ResultadoDeCompra> {
  const leido = pedido.safeParse(entrada);
  if (!leido.success) {
    return { ok: false, codigo: leido.error.issues.some((i) => i.path[0] === "email") ? "email_invalido" : "plan_invalido", vence: null };
  }
  const { nivel, plan, email } = leido.data;

  const supabase = await clienteDeSupabase("planes");
  const { data, error } = await supabase.functions.invoke<{ init_point?: string }>("crear-suscripcion-mp", {
    body: { nivel, plan, ...(email && { email_mercado_pago: email }) },
  });
  if (error) return { ok: false, ...(await codigoDelError(error)) };

  // Lo que se le abre a la persona tiene que ser de Mercado Pago.
  const destino = URL.canParse(data?.init_point ?? "") ? new URL(data!.init_point!) : null;
  if (!destino || destino.protocol !== "https:" || !/(^|\.)mercadopago\.com(\.ar)?$/.test(destino.hostname)) {
    console.error("planes: init_point inesperado", data?.init_point);
    return { ok: false, codigo: "interno", vence: null };
  }
  return { ok: true, initPoint: destino.toString() };
}

/** Da de baja el débito. El local sigue entrando hasta `vence`. */
export async function cancelar(): Promise<ResultadoDeBaja> {
  const supabase = await clienteDeSupabase("planes");
  const { error } = await supabase.functions.invoke("cancelar-suscripcion-mp", { body: {} });
  if (error) return { ok: false, codigo: (await codigoDelError(error)).codigo };
  return { ok: true };
}
