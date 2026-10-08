import { NextResponse, type NextRequest } from "next/server";
import { clienteDelPanel } from "@/lib/admin/supabase";

/*
 * Arranca el ingreso con Google. Va del lado del servidor para que el
 * verificador PKCE quede en una cookie y el canje de /admin/auth/callback lo
 * encuentre. Es un POST: un GET lo dispararía cualquier prefetch.
 */
export async function POST(request: NextRequest) {
  const supabase = await clienteDelPanel();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${request.nextUrl.origin}/admin/auth/callback` },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/admin/entrar?error=google", request.url), 303);
  }
  return NextResponse.redirect(data.url, 303);
}
