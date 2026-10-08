"use server";

import { FunctionsHttpError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { z } from "zod";
import { planes, type CodigoDeError } from "@/content/planes";
import { FRECUENCIAS, NIVELES } from "@/lib/planes";
import { clienteDeSupabase } from "@/lib/supabase";

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
