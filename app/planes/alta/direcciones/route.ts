import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resolverDireccion, sugerirDirecciones } from "@/lib/alta";

/*
 * Las direcciones del alta, contra `autocompletar_direccion` con la sesión de
 * la persona: la función pide una cuenta y lleva su límite por día. Por qué
 * route handler y no server action: ver ../localidades/route.ts.
 */

const sesion = z.string().min(8).max(64);

const pedido = z.discriminatedUnion("accion", [
  z.object({
    accion: z.literal("sugerir"),
    sesion,
    texto: z.string().trim().min(3).max(120),
    localidad: z.object({ nombre: z.string().min(1).max(120), lat: z.number(), lng: z.number() }),
  }),
  z.object({ accion: z.literal("detalle"), sesion, placeId: z.string().min(1).max(300) }),
]);

export async function POST(request: NextRequest) {
  const leido = pedido.safeParse(await request.json().catch(() => null));
  if (!leido.success) return NextResponse.json({ error: "pedido" }, { status: 400 });
  const p = leido.data;

  try {
    if (p.accion === "sugerir") {
      return NextResponse.json({ sugerencias: await sugerirDirecciones(p.sesion, p.texto, p.localidad) });
    }
    return NextResponse.json({ direccion: await resolverDireccion(p.sesion, p.placeId) });
  } catch (error) {
    console.error("planes/alta/direcciones:", error);
    return NextResponse.json({ error: "buscar" }, { status: 502 });
  }
}
