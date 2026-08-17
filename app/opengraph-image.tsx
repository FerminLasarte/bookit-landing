import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Bookit — Tu próximo turno, a un clic de distancia.";

/** OG de la home. Reemplaza al `banner_compartir.jpg` de Supabase. */
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
        {/* El glow ámbar, igual que en el hero */}
        <div
          style={{
            position: "absolute",
            top: -220,
            left: 120,
            width: 720,
            height: 720,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(215,138,29,0.28) 0%, rgba(215,138,29,0) 70%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em" }}>
            <span style={{ color: "#E8E2D9" }}>Book</span>
            <span style={{ color: "rgba(215,138,29,0.7)" }}>·</span>
            <span style={{ color: "#D78A1D" }}>it</span>
          </div>
          <div style={{ width: 40, height: 2, background: "#D78A1D" }} />
          {/* Un solo nodo de texto: Satori exige display:flex si hay más de uno. */}
          <div
            style={{
              display: "flex",
              color: "#D9C6B4",
              fontSize: 20,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            {`${site.city} · Próximo lanzamiento`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            color: "#E8E2D9",
            fontSize: 82,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.035em",
            maxWidth: 900,
          }}
        >
          Tu próximo turno, a un clic de distancia.
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {["09:00", "10:30", "18:15"].map((slot) => (
            <div
              key={slot}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 48,
                padding: "10px 22px",
                color: "#E8E2D9",
                fontSize: 22,
              }}
            >
              <span style={{ color: "#D78A1D" }}>[</span>
              {slot}
              <span style={{ color: "#D78A1D" }}>]</span>
            </div>
          ))}
          <div style={{ color: "#D9C6B4", fontSize: 22, marginLeft: 12 }}>
            Barberías, peluquerías, uñas, estética y más.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
