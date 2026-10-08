import type { NextRequest } from "next/server";
import { canjearCodigo } from "@/lib/supabase";

/** La vuelta de Google: canjea el código por la sesión y entra al panel. */
export function GET(request: NextRequest) {
  return canjearCodigo(request, "panel", { destino: "/admin", siFalla: "/admin/entrar?error=google" });
}
