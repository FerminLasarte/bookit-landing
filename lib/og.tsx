import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import sharp from "sharp";

/*
 * El marco de las imágenes para compartir (home, lista VIP, invitación).
 *
 * `ImageResponse` no lee CSS: los colores se escriben acá, espejando los
 * tokens claros de `globals.css`. Si cambia la paleta, cambia esto.
 */
export const og = {
  page: "#fbfcfd", // cream-50
  surface: "#ffffff", // paper
  fg: "#1f2937", // ink-900
  muted: "#6b7280", // ink-500
  line: "rgba(31, 41, 55, 0.1)",
  accentFg: "#9d6515", // amber-700
  arena: "#f6e7ce", // tile-arena y marca-agua
  tileShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.6), 0 10px 40px -10px rgba(10, 10, 10, 0.15)",
} as const;

export const ogSize = { width: 1200, height: 630 };

// Cada ruta va literal en su `join`: si una parte es variable, el trazado de
// archivos de Vercel mete el proyecto entero en la función de `/og/invite`.
const [regular, extrabold, logoSvg] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/PlusJakartaSans-500.ttf")),
  readFile(join(process.cwd(), "assets/fonts/PlusJakartaSans-800.ttf")),
  readFile(join(process.cwd(), "public/brand/logo_bookit_completo.svg"), "utf8"),
]);

const fonts = [
  { name: "Plus Jakarta Sans", weight: 500 as const, style: "normal" as const, data: regular },
  { name: "Plus Jakarta Sans", weight: 800 as const, style: "normal" as const, data: extrabold },
];

/** El lockup oficial, con la tinta y el naranja resueltos: el SVG como imagen no hereda color. */
const logo = logoSvg
  .replaceAll("currentColor", og.fg)
  .replace(/var\(--logo-naranja, (#[0-9A-Fa-f]{6})\)/g, "$1");
const logoSrc = `data:image/svg+xml;base64,${Buffer.from(logo).toString("base64")}`;

/**
 * Una captura de la app como data URI, para un `<img>`. `ImageResponse` no lee
 * WebP: se pasa a PNG, al doble del ancho en que se dibuja. La ruta la arma
 * quien llama, literal (ver arriba).
 */
export async function capturaOg(ruta: string, ancho: number) {
  const png = await sharp(ruta)
    .resize({ width: ancho * 2 })
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

/**
 * Crema, el logo arriba y el texto abajo a la izquierda: título (con un
 * segundo renglón en ámbar, si hay `acento`), bajada y un `pie` opcional.
 * `aside` va posicionado sobre el lienzo: lo que acompaña al texto.
 */
export function ogImage({
  titulo,
  acento,
  bajada,
  anchoTexto = 820,
  pie,
  aside,
}: {
  titulo: string;
  acento?: string;
  bajada: string;
  /** Hasta dónde llega el texto, para no pisar el `aside`. */
  anchoTexto?: number;
  pie?: ReactNode;
  aside?: ReactNode;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: og.page,
          padding: "72px 80px",
          fontFamily: "Plus Jakarta Sans",
          color: og.fg,
        }}
      >
        {aside}
        {/* 819 × 238 es el viewBox del lockup */}
        <img src={logoSrc} width={172} height={50} alt="" />
        <div style={{ display: "flex", flexDirection: "column", maxWidth: anchoTexto }}>
          {/* El `display` del sitio, a escala de 1200 px */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.04em",
            }}
          >
            <span>{titulo}</span>
            {acento && <span style={{ color: og.accentFg }}>{acento}</span>}
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 28, lineHeight: 1.35, color: og.muted }}>
            {bajada}
          </div>
          {pie}
        </div>
      </div>
    ),
    { ...ogSize, fonts },
  );
}
