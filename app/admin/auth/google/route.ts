import type { NextRequest } from "next/server";
import { iniciarIngreso } from "@/lib/supabase";

export function POST(request: NextRequest) {
  return iniciarIngreso(request, "panel", "google", {
    vuelta: "/admin/auth/callback",
    siFalla: "/admin/entrar?error=google",
  });
}
