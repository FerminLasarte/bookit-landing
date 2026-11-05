"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { COOKIE_DE_LA_VISTA, leerVista, valorDeVista, vistaDe } from "@/lib/admin/vista";

/** Un año: la preferencia dura hasta que se cambia. */
const UN_ANIO = 60 * 60 * 24 * 365;

/**
 * Guarda cómo quiere ver las listas quien mira. Cada botón manda una sola
 * cosa (la densidad o las filas) y el resto queda como estaba; lo que no se
 * reconoce vuelve a lo de siempre (`vistaDe`). No toca la base.
 */
export async function guardarVista(datos: FormData) {
  const actual = await leerVista();
  const densidad = String(datos.get("densidad") ?? actual.densidad);
  const filas = String(datos.get("por_pagina") ?? actual.porPagina);
  const nueva = vistaDe(`${densidad}-${filas}`);

  (await cookies()).set(COOKIE_DE_LA_VISTA, valorDeVista(nueva), {
    path: "/admin",
    maxAge: UN_ANIO,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  refresh();
}
