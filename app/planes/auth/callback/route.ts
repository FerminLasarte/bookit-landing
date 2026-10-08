import type { NextRequest } from "next/server";
import { canjearCodigo } from "@/lib/supabase";

export function GET(request: NextRequest) {
  return canjearCodigo(request, "planes", { destino: "/planes", siFalla: "/planes?error=ingreso" });
}
