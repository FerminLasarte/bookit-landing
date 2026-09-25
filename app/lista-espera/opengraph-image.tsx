import { site } from "@/content/site";
import { og, ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Bookit | Tandil, tu forma de sacar turnos está por cambiar";

/** OG de la lista VIP: el 500 pálido a escala de fondo, como en la sección Puntos. */
export default function OpengraphImage() {
  return ogImage({
    titulo: "Tandil, tu forma de sacar turnos está por cambiar.",
    bajada: `Anotate y llevate ${site.puntosDeRegalo} Puntos Bookit para tu primer turno.`,
    anchoTexto: 800,
    aside: (
      <div
        style={{
          position: "absolute",
          right: 40,
          bottom: -70,
          display: "flex",
          fontSize: 420,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.06em",
          color: og.arena,
        }}
      >
        {site.puntosDeRegalo}
      </div>
    ),
  });
}
