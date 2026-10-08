import { NextResponse, type NextRequest } from "next/server";
import { clienteDelPanel } from "@/lib/admin/supabase";

export async function POST(request: NextRequest) {
  const supabase = await clienteDelPanel();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/entrar", request.url), 303);
}
