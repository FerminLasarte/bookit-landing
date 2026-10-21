import type { NextRequest } from "next/server";
import { COOKIE_DESTINO, entradaDe, leerDestino } from "@/lib/destinos";
import { canjearCodigo } from "@/lib/supabase";

/** La vuelta de Google o Apple, a /planes o a /mi-local según de dónde salió. */
export async function GET(request: NextRequest) {
  const destino = leerDestino(request.cookies.get(COOKIE_DESTINO)?.value);
  const respuesta = await canjearCodigo(request, "local", { destino, siFalla: entradaDe(destino, "ingreso") });
  respuesta.cookies.delete({ name: COOKIE_DESTINO, path: "/planes/auth" });
  return respuesta;
}
