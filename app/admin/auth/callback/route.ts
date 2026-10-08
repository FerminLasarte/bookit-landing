import { NextResponse, type NextRequest } from "next/server";
import { clienteDelPanel } from "@/lib/admin/supabase";

/** La vuelta de Google: canjea el código por la sesión y entra al panel. */
export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get("code");
  if (codigo) {
    const supabase = await clienteDelPanel();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(new URL("/admin", request.url));
    console.error("admin/auth/callback:", error.code, error.message);
  } else {
    console.error("admin/auth/callback sin código:", request.nextUrl.searchParams.get("error_description"));
  }
  return NextResponse.redirect(new URL("/admin/entrar?error=google", request.url));
}
