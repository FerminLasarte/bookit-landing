import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { WAITLIST_ERRORS, parseWaitlistBody } from "@/lib/waitlist-schema";
import { WAITLIST_FROM, WAITLIST_SUBJECTS, waitlistEmailHtml } from "@/lib/emails";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
/** Nunca cacheado: es un endpoint de escritura. */
export const dynamic = "force-dynamic";

/**
 * Claves server-only. `SUPABASE_SERVICE_ROLE` es la preferida; `SUPABASE_ANON_KEY`
 * queda como fallback mientras el service role no esté configurado en Vercel.
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE ?? process.env.SUPABASE_ANON_KEY;

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

/** Contrato #4: sólo POST. Cualquier otro método responde 405. */
function methodNotAllowed() {
  return jsonError(WAITLIST_ERRORS.method, 405);
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;

export async function POST(request: Request) {
  if (!rateLimit(clientIp(request.headers)).allowed) {
    return jsonError(WAITLIST_ERRORS.rateLimit, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(WAITLIST_ERRORS.missing, 400);
  }

  const parsed = parseWaitlistBody(body);
  if (!parsed.ok) {
    return jsonError(parsed.error, 400);
  }

  const { data, spam } = parsed;

  // Honeypot lleno o formulario completado demasiado rápido: se responde igual
  // que un éxito para no darle señal al bot, pero no se guarda nada.
  if (spam) {
    console.warn("[waitlist] descartado por antispam");
    return NextResponse.json({ success: true, message: "¡Registro exitoso!" });
  }

  if (!supabaseUrl || !supabaseKey) {
    console.error("[waitlist] faltan las variables de entorno de Supabase");
    return jsonError(WAITLIST_ERRORS.unexpected, 500);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase.from("waitlist_leads").insert([
      {
        name: data.name,
        email: data.email,
        user_type: data.user_type,
        whatsapp: data.whatsapp ?? null,
        // `category` se guarda null cuando no es local.
        category: data.user_type === "local" ? (data.category ?? null) : null,
        consent: data.consent,
      },
    ]);

    if (dbError) {
      // 23505 = violación de unicidad (el email ya está en la lista).
      if (dbError.code === "23505") {
        return jsonError(WAITLIST_ERRORS.duplicate, 400);
      }
      throw dbError;
    }

    // El lead ya está guardado: si el correo falla, no se tira 500.
    let emailSent = true;
    const resendKey = process.env.RESEND_API_KEY;

    if (!resendKey) {
      console.error("[waitlist] falta RESEND_API_KEY: el lead se guardó sin correo");
      emailSent = false;
    } else {
      try {
        const resend = new Resend(resendKey);
        const { error: emailError } = await resend.emails.send({
          from: WAITLIST_FROM,
          to: data.email,
          subject: WAITLIST_SUBJECTS[data.user_type],
          html: waitlistEmailHtml(data.name, data.user_type),
        });
        if (emailError) {
          console.error("[waitlist] Resend falló:", emailError);
          emailSent = false;
        }
      } catch (emailException) {
        console.error("[waitlist] Resend lanzó una excepción:", emailException);
        emailSent = false;
      }
    }

    return NextResponse.json({ success: true, message: "¡Registro exitoso!", emailSent });
  } catch (error) {
    console.error("Error en waitlist:", error);
    return jsonError(WAITLIST_ERRORS.unexpected, 500);
  }
}
