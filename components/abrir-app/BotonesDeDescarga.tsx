import Image, { type StaticImageData } from "next/image";
import appStore from "@/assets/tiendas/app-store.svg";
import googlePlay from "@/assets/tiendas/google-play.svg";
import Anchor from "@/components/ui/Anchor";
import Button from "@/components/ui/Button";
import { descargar } from "@/content/paginas";
import { flags, site } from "@/content/site";
import { cn } from "@/lib/utils";

/*
 * Los badges oficiales, tal cual los dan Apple y Google: negros en los dos
 * temas, App Store primero y los dos del mismo alto (Google pide igual o más
 * grande). 48 px pasan el mínimo de los dos (40 y 28), y el `gap-3` es el
 * cuarto del alto que piden de aire.
 */
const tiendas: readonly { href: string | null; badge: StaticImageData; alt: string }[] = [
  { href: site.app.appStore, badge: appStore, alt: descargar.conTiendas.iphone },
  { href: site.app.playStore, badge: googlePlay, alt: descargar.conTiendas.android },
];

/**
 * Las tiendas, o la lista de espera mientras no haya links. Es lo que muestra
 * `/descargar`, y lo que ofrece toda página a quien todavía no tiene la app.
 * Una tienda sin link no se muestra.
 */
export default function BotonesDeDescarga({ className }: { className?: string }) {
  const { preLanzamiento } = descargar;

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-3", className)}>
      {flags.storeLinksLive ? (
        tiendas.map(
          ({ href, badge, alt }) =>
            href && (
              <Anchor key={href} href={href} className="ring-focus block rounded-field">
                <Image src={badge} alt={alt} className="h-12 w-auto" />
              </Anchor>
            ),
        )
      ) : (
        <Button href={preLanzamiento.cta.href}>{preLanzamiento.cta.label}</Button>
      )}
    </div>
  );
}
