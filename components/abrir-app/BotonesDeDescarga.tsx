import Button from "@/components/ui/Button";
import { descargar } from "@/content/paginas";
import { flags, site } from "@/content/site";

type Props = {
  /** Todos en `secondary`, para cuando el botón principal de la página es otro. */
  secundarios?: boolean;
};

/**
 * Las tiendas, o la lista de espera mientras no haya links. Es lo que muestra
 * `/descargar`, y lo que ofrece toda página a quien todavía no tiene la app.
 */
export default function BotonesDeDescarga({ secundarios = false }: Props) {
  const { conTiendas, preLanzamiento } = descargar;
  const principal = secundarios ? "secondary" : "primary";

  if (!flags.storeLinksLive) {
    return (
      <Button href={preLanzamiento.cta.href} variant={principal}>
        {preLanzamiento.cta.label}
      </Button>
    );
  }

  return (
    <>
      {site.app.appStore && (
        <Button href={site.app.appStore} variant={principal}>
          {conTiendas.iphone}
        </Button>
      )}
      {site.app.playStore && (
        <Button href={site.app.playStore} variant="secondary">
          {conTiendas.android}
        </Button>
      )}
    </>
  );
}
