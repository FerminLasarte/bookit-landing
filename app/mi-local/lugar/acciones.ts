"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_DEL_LUGAR, leerMiLugar } from "@/lib/mi-local/lugar";

/** Un año: la elección dura lo que dura en el teléfono, hasta que se cambia. */
const UN_ANIO = 60 * 60 * 24 * 365;

/**
 * Cambia de lugar, como "Cambiar de lado" en la app (D1 del plan del equipo):
 * guarda la elección en esta compu y vuelve a la agenda. Sólo se guarda un
 * lugar de la cuenta; el resto no se cree.
 */
export async function cambiarDeLugar(datos: FormData) {
  const clave = String(datos.get("clave") ?? "");
  const { lugares } = await leerMiLugar();
  if (lugares.some((l) => l.clave === clave)) {
    (await cookies()).set(COOKIE_DEL_LUGAR, clave, {
      path: "/mi-local",
      maxAge: UN_ANIO,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  redirect("/mi-local");
}
