import "server-only";
import { miLocal } from "@/content/mi-local";
import { mensajeDeLaBase, pideOtroPlan, type ErrorDeLaBase } from "./errores";
import { leerMiCuenta, leerMiembro, loEditaElDuenio } from "./gestion";
import { entra, leerMiLugar, type Lugar, type LugarDelDuenio } from "./lugar";
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

/** El lugar, si entra al panel, o por qué no: el local propio sin la suscripción al día, o el ajeno con un bloqueo. */
export async function lugarParaActuar(): Promise<{ lugar: Lugar; error: null } | { lugar: null; error: string }> {
  const lugar = await leerMiLugar();
  if (entra(lugar)) return { lugar, error: null };
  return { lugar: null, error: lugar.rol === "duenio" ? miLocal.acceso.sinAcceso : miLocal.acceso.sinAccesoDelEquipo };
}

/**
 * El local, si entra y la cuenta es su dueña, o por qué no. Para lo que es
 * del local: sus servicios, su equipo. Al profesional del equipo la base
 * también se lo rechazaría, pero con cero filas o un permiso genérico.
 */
export async function localParaActuar(): Promise<{ local: LugarDelDuenio; error: null } | { local: null; error: string }> {
  const { lugar, error } = await lugarParaActuar();
  if (error !== null) return { local: null, error };
  return lugar.rol === "duenio" ? { local: lugar, error: null } : { local: null, error: miLocal.acceso.soloDuenio };
}

/**
 * Qué puede tocar quien entra de un profesional, o el error. El dueño, lo
 * suyo y lo de los que no tienen cuenta (D2 del plan de la fase 3); el
 * profesional del equipo, sólo lo suyo. Se vuelve a mirar acá, no se cree lo
 * que dice el formulario. `delDuenio`: quien edita es el dueño.
 */
export async function profesionalQueEdita(
  id: string,
): Promise<{ error: string; editable?: undefined } | { error: null; editable: boolean; delDuenio: boolean }> {
  const { errores } = miLocal.profesional;
  const { lugar, error } = await lugarParaActuar();
  if (error !== null) return { error };
  if (lugar.rol === "profesional") {
    return id === lugar.idProfesional ? { error: null, editable: true, delDuenio: false } : { error: miLocal.acceso.soloDuenio };
  }
  try {
    const cuenta = await leerMiCuenta();
    const miembro = await leerMiembro(lugar.id, id, cuenta.id);
    return miembro ? { error: null, editable: loEditaElDuenio(miembro), delDuenio: true } : { error: errores.generico };
  } catch (error) {
    console.error("mi-local/profesional:", error);
    return { error: errores.generico };
  }
}
