import "server-only";
import type { ErrorDeLaBase } from "@/lib/mi-local/errores";

/*
 * El error de una acción del panel. La base escribe sus rechazos para
 * mostrarse, con una pista en `hint` (BooKit `docs/admin-panel.md`, sección
 * 1), y el 42501 de quien no es del equipo también es una frase. Lo demás es
 * un error nuestro: va el genérico y se anota.
 */
export function errorDeAccion(error: ErrorDeLaBase, generico: string, donde: string): string {
  if (error.hint || error.code === "42501") return error.message;
  console.error(`admin/${donde}:`, error.code, error.message);
  return generico;
}
