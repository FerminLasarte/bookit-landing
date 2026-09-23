import { site } from "@/content/site";
import type { UserType } from "./waitlist-schema";

/** Remitente transaccional. No es el mail de soporte público. */
export const WAITLIST_FROM = `Bookit VIP <${site.transactionalEmail}>`;

export const WAITLIST_SUBJECTS: Record<UserType, string> = {
  cliente: `¡Tus ${site.puntosDeRegalo} puntos Bookit están asegurados! 🎁`,
  local: "¡Tu lugar como local fundador está reservado! 🎁",
};

/** Escapa el nombre antes de interpolarlo en el HTML del correo. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function waitlistEmailHtml(name: string, userType: UserType): string {
  const safeName = escapeHtml(name);
  const isLocal = userType === "local";

  const body = isLocal
    ? `
        <p>Tu local ya está oficialmente en la lista VIP de fundadores de <strong>Bookit</strong>.</p>
        <p>Vamos a contactarte por WhatsApp o email antes del lanzamiento en Tandil para contarte los detalles del <strong>precio fundador</strong>, con cupos limitados para los primeros locales que se sumen.</p>
        <p>Mientras tanto, seguinos en Instagram para enterarte de qué otros locales ya se están sumando.</p>`
    : `
        <p>Ya estás oficialmente en la lista VIP de <strong>Bookit</strong>.</p>
        <p>Acabamos de guardar tus <strong>${site.puntosDeRegalo} puntos bajo llave</strong>. Te vamos a avisar antes que a nadie cuando la app esté lista para descargar en Tandil, para que puedas canjearlos en tu primer turno.</p>
        <p>Mientras tanto, seguinos en Instagram para enterarte de qué locales ya se están sumando.</p>`;

  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #D78A1D;">¡Adentro, ${safeName}! 🎉</h2>
      ${body}
      <br/>
      <!-- Texto en tinta y no en blanco, por la misma razón que el botón de la web: blanco sobre #D78A1D da 2,78:1 -->
      <a href="${site.instagram.url}" style="background-color: #D78A1D; color: #151311; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver novedades en Instagram</a>
      <br/><br/>
      <p>Nos vemos pronto,<br/>El equipo de Bookit.</p>
    </div>
  `;
}
