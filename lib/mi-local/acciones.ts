import "server-only";
import { miLocal } from "@/content/mi-local";
import { leerLocalQueEntra } from "./agenda";
import { mensajeDeLaBase, pideOtroPlan, type ErrorDeLaBase } from "./errores";
import { leerMiCuenta, leerMiembro, loEditaElDuenio } from "./gestion";
import type { Respuesta } from "./respuesta";

/*
 * Lo que comparten las acciones del panel. Vive afuera de los archivos
 * `"use server"`: todo lo que exporta uno de esos es una acción que el
 * navegador puede llamar.
 */

/** El error de una escritura: la frase de la base, o el genérico (y se anota). */
export function errorDe(error: ErrorDeLaBase, generico: string, donde: string): Respuesta {
  const deLaBase = mensajeDeLaBase(error);
  if (!deLaBase) console.error(`mi-local/${donde}:`, error.code, error.message);
  return { error: deLaBase ?? generico, verPlanes: pideOtroPlan(error) };
}

/**
 * Lo que el dueño puede tocar de un profesional, o el error. Lo suyo y lo de
 * los que no tienen cuenta (D2 del plan de la fase 3): se vuelve a mirar acá,
 * no se cree lo que dice el formulario.
 */
export async function profesionalQueEdita(
  id: string,
): Promise<{ error: string; editable?: undefined } | { error: null; editable: boolean }> {
  const { errores } = miLocal.profesional;
  const local = await leerLocalQueEntra();
  if (!local) return { error: errores.sinAcceso };
  try {
    const cuenta = await leerMiCuenta();
    const miembro = await leerMiembro(local.id, id, cuenta.id);
    return miembro ? { error: null, editable: loEditaElDuenio(miembro) } : { error: errores.generico };
  } catch (error) {
    console.error("mi-local/profesional:", error);
    return { error: errores.generico };
  }
}
