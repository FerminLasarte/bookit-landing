import { NextResponse, type NextRequest } from "next/server";
import { clienteDeSupabase } from "@/lib/supabase";

/** Los enlaces que manda `enviar_email_auth` para confirmar: el del alta y el del reenvío. */
const TIPOS = ["signup", "magiclink"] as const;
type Tipo = (typeof TIPOS)[number];

/**
 * Confirma la cuenta creada en /planes con el token del mail y deja la sesión
 * en la cookie del área. Llega por POST desde /auth/v1/verify.
 */
export async function POST(request: NextRequest) {
  const datos = await request.formData();
  const tokenHash = String(datos.get("token_hash") ?? "");
  const tipo = String(datos.get("type") ?? "");

  if (tokenHash && TIPOS.includes(tipo as Tipo)) {
    const supabase = await clienteDeSupabase("planes");
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo as Tipo });
    if (!error) return NextResponse.redirect(new URL("/planes", request.url), 303);
    console.error("planes/auth/confirmar:", error.code, error.message);
  }
  return NextResponse.redirect(new URL("/planes?error=confirmar", request.url), 303);
}
