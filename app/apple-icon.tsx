import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Icono de iOS: fondo tinta, wordmark con la marca en ámbar. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#151311",
          color: "#E8E2D9",
          fontSize: 62,
          fontWeight: 800,
          letterSpacing: "-0.05em",
        }}
      >
        B<span style={{ color: "#D78A1D" }}>it</span>
      </div>
    ),
    size,
  );
}
