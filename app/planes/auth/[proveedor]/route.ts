import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { iniciarIngreso, type Proveedor } from "@/lib/supabase";

const PROVEEDORES: readonly Proveedor[] = ["google", "apple"];

/** Arranca el ingreso del dueño con Google o Apple: la misma cuenta que en la app. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ proveedor: string }> }) {
  const { proveedor } = await params;
  if (!PROVEEDORES.includes(proveedor as Proveedor)) notFound();
  return iniciarIngreso(request, "planes", proveedor as Proveedor, {
    vuelta: "/planes/auth/callback",
    siFalla: "/planes?error=ingreso",
  });
}
