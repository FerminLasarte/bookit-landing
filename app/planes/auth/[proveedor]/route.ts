import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { COOKIE_DESTINO, destinoDelPedido, entradaDe } from "@/lib/destinos";
import { iniciarIngreso, type Proveedor } from "@/lib/supabase";

const PROVEEDORES: readonly Proveedor[] = ["google", "apple"];

/**
 * Arranca el ingreso del dueño con Google o Apple: la misma cuenta que en la
 * app. Sirve a /planes y a /mi-local; el destino espera en una cookie a que
 * vuelva (`lib/destinos.ts`).
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ proveedor: string }> }) {
  const { proveedor } = await params;
  if (!PROVEEDORES.includes(proveedor as Proveedor)) notFound();
  const destino = await destinoDelPedido(request);

  const respuesta = await iniciarIngreso(request, "local", proveedor as Proveedor, {
    vuelta: "/planes/auth/callback",
    siFalla: entradaDe(destino, "ingreso"),
  });
  respuesta.cookies.set(COOKIE_DESTINO, destino, {
    path: "/planes/auth",
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    maxAge: 600,
  });
  return respuesta;
}
