import { join } from "node:path";
import { site } from "@/content/site";
import { capturaOg, og, ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Bookit — Tu próximo turno, del rubro que sea.";

const inicio = await capturaOg(join(process.cwd(), "assets/capturas/claro/01_cliente_inicio.webp"), 262);

/** OG de la home: el título del hero y la app en un tile, cortada por el borde. */
export default function OpengraphImage() {
  return ogImage({
    aside: (
      <div
        style={{
          position: "absolute",
          top: 64,
          right: 64,
          width: 360,
          height: 640,
          display: "flex",
          justifyContent: "center",
          paddingTop: 48,
          borderRadius: 24,
          background: og.arena,
          boxShadow: og.tileShadow,
        }}
      >
        {/* El marco de `Screen`: 24 afuera = 16 adentro + 8 de marco */}
        <div
          style={{
            display: "flex",
            padding: 8,
            height: 620,
            borderRadius: 24,
            background: og.surface,
            boxShadow: og.tileShadow,
          }}
        >
          {/* 1206 × 2622 a 262 de ancho */}
          <img src={inicio} width={262} height={570} style={{ borderRadius: 16 }} alt="" />
        </div>
      </div>
    ),
    titulo: "Tu próximo turno,",
    acento: "del rubro que sea.",
    bajada: `Los locales de ${site.city} en una sola app. Reservá cuando se te ocurra.`,
    anchoTexto: 600,
  });
}
