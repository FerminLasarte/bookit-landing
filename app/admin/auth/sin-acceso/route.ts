import type { NextRequest } from "next/server";
import { salir } from "@/lib/supabase";

/*
 * Adonde manda `lib/admin/datos` a una cuenta que no es del equipo: cierra su
 * sesión del panel, así no queda el link "Panel" en el sitio, y sigue a la
 * página que lo explica. Es un GET porque llega por `redirect()`; una página
 * no puede escribir cookies, una ruta sí.
 */
export function GET(request: NextRequest) {
  return salir(request, "panel", "/admin/sin-acceso");
}
