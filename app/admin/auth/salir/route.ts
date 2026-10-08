import type { NextRequest } from "next/server";
import { salir } from "@/lib/supabase";

export function POST(request: NextRequest) {
  return salir(request, "panel", "/admin/entrar");
}
