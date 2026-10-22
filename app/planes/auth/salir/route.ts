import type { NextRequest } from "next/server";
import { destinoDelPedido, entradaDe } from "@/lib/destinos";
import { salir } from "@/lib/supabase";

/** Sale de la sesión del dueño, que es la misma en /planes y en /mi-local. */
export async function POST(request: NextRequest) {
  const destino = await destinoDelPedido(request);
  return salir(request, "local", entradaDe(destino));
}
