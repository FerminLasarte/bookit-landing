import { ImageResponse } from "next/og";

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

const size = { width: 1200, height: 630 };

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

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#151311",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -240,
            left: 220,
            width: 760,
            height: 760,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(215,138,29,0.3) 0%, rgba(215,138,29,0) 70%)",
          }}
        />

        <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em" }}>
          <span style={{ color: "#E8E2D9" }}>Book</span>
          <span style={{ color: "rgba(215,138,29,0.7)" }}>·</span>
          <span style={{ color: "#D78A1D" }}>it</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              color: "#E8E2D9",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              maxWidth: 940,
            }}
          >
            ¡Sumate a Bookit!
          </div>
          <div style={{ display: "flex", color: "#D9C6B4", fontSize: 28, maxWidth: 820 }}>
            Descargá la app, usá mi código de invitación y ganemos beneficios juntos.
          </div>
        </div>

        {code ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              border: "2px dashed rgba(215,138,29,0.45)",
              borderRadius: 28,
              padding: "24px 36px",
              alignSelf: "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#D9C6B4",
                fontSize: 18,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Código
            </div>
            <div
              style={{
                display: "flex",
                color: "#E8E2D9",
                fontSize: 52,
                fontWeight: 800,
                letterSpacing: "0.12em",
              }}
            >
              {code}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", color: "#D9C6B4", fontSize: 24 }}>
            Turnos para barberías, peluquerías y estética.
          </div>
        )}
      </div>
    ),
    size,
  );
}
