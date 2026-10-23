/*
 * Si en este navegador hay una sesión del panel. La cookie del panel es la de
 * Supabase por defecto (`cookiesDeArea.panel` en `lib/supabase.ts`):
 * `sb-<proyecto>-auth-token`, a veces partida en `.0`, `.1`, en `/` y legible
 * desde el navegador. La del local se llama `sb-local` y no entra acá.
 *
 * Es sólo una pista para mostrar el link "Panel" (D1 de docs/PLAN-ADMIN.md):
 * no dice si la cuenta es del equipo. Eso lo decide la base en cada lectura.
 */
const COOKIE_DEL_PANEL = /(?:^|;\s*)sb-[^=;]+-auth-token(?:\.\d+)?=/;

export function haySesionDelPanel(cookies: string): boolean {
  return COOKIE_DEL_PANEL.test(cookies);
}
