import { og, ogImage } from "@/lib/og";

/**
 * OG de invitación generada con `next/og`.
 *
 * Vive en una route y no en un `opengraph-image.tsx` porque Next no permite
 * archivos de metadata dentro de un catch-all opcional (`/invite/[[...slug]]`).
 * La consume `generateMetadata` de esa página: `/og/invite?code=ABC123`.
 *
 * Fuera de `/api/` a propósito: `robots.txt` bloquea `/api/`, y algunos
 * scrapers de redes lo respetan al ir a buscar la imagen.
 */

export const runtime = "nodejs";

/** El código viene de la URL: se acota y se limpia antes de dibujarlo. */
function sanitizeCode(raw: string | null): string | null {
  if (!raw) return null;
  const clean = raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9._-]/g, "")
    .slice(0, 24);
  return clean.length > 0 ? clean : null;
}

export function GET(request: Request) {
  const code = sanitizeCode(new URL(request.url).searchParams.get("code"));

  return ogImage({
    titulo: "¡Sumate a Bookit!",
    bajada: code
      ? "Descargá la app, usá mi código de invitación y ganemos puntos los dos."
      : "Turnos para barberías, peluquerías y estética.",
    anchoTexto: 760,
    pie: code && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginTop: 40,
          alignSelf: "flex-start",
          padding: "20px 32px",
          borderRadius: 24,
          border: `2px solid ${og.line}`,
          background: og.surface,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 18,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: og.muted,
          }}
        >
          Código
        </div>
        <div style={{ display: "flex", fontSize: 48, fontWeight: 800, letterSpacing: "0.08em" }}>{code}</div>
      </div>
    ),
  });
}
