import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon: la `B` del wordmark sobre el ámbar de marca. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#D78A1D",
          color: "#FFFFFF",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-0.06em",
        }}
      >
        B
      </div>
    ),
    size,
  );
}
