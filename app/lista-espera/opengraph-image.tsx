import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Bookit | Tandil, tu forma de sacar turnos está por cambiar";

/** OG de la lista VIP. Reemplaza al `og-image.png` de Supabase. */
export default function OpengraphImage() {
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
            right: 60,
            width: 760,
            height: 760,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(215,138,29,0.3) 0%, rgba(215,138,29,0) 70%)",
          }}
        />

        <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em" }}>
          <span style={{ color: "#E8E2D9" }}>Book</span>
          <span style={{ color: "rgba(215,138,29,0.7)" }}>·</span>
          <span style={{ color: "#D78A1D" }}>it</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              color: "#D9C6B4",
              fontSize: 20,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Lista VIP · Tandil
          </div>
          <div
            style={{
              display: "flex",
              color: "#E8E2D9",
              fontSize: 74,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              maxWidth: 940,
            }}
          >
            Tandil, tu forma de sacar turnos está por cambiar.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
          <div
            style={{
              display: "flex",
              color: "#D78A1D",
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            {site.puntosDeRegalo}
          </div>
          <div style={{ display: "flex", color: "#D9C6B4", fontSize: 26, maxWidth: 720 }}>
            Puntos Bookit de regalo por anotarte, para tu primer turno.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
