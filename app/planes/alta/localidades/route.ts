import { NextResponse, type NextRequest } from "next/server";
import { buscarLocalidades } from "@/lib/alta";

/*
 * La búsqueda de localidades del alta, mientras se escribe. Es un route handler
 * y no una server action porque las actions corren de a una: cada tecla
 * esperaría a la anterior. La sesión la pide la base (`buscar_localidades` no
 * está abierta a anon).
 */
export async function GET(request: NextRequest) {
  const termino = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (termino.length < 2) return NextResponse.json({ localidades: [] });

  try {
    return NextResponse.json({ localidades: await buscarLocalidades(termino.slice(0, 80)) });
  } catch (error) {
    console.error("planes/alta/localidades:", error);
    return NextResponse.json({ error: "buscar" }, { status: 502 });
  }
}
