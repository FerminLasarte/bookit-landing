import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import type { Aviso as CopyDeAviso } from "@/content/mi-local";
import { site } from "@/content/site";

/**
 * Un aviso de la suscripción. Arriba de la agenda, cuando el local entra pero
 * debe o no renueva; solo, cuando no entra. El botón lleva a /planes: la web
 * sí puede mandar a pagar. Sin botón, el contacto.
 */
export default function Aviso({ aviso, conBoton }: { aviso: CopyDeAviso; conBoton: boolean }) {
  return (
    <Superficie
      tone="miel"
      className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6"
    >
      <div>
        <p className="font-bold text-fg">{aviso.titulo}</p>
        <p className="mt-1 text-small text-fg">{aviso.bajada}</p>
      </div>
      {aviso.boton && conBoton ? (
        <Button href="/planes" size="compact" className="shrink-0">
          {aviso.boton}
        </Button>
      ) : (
        !aviso.boton && (
          // En `fg` y no en el link de acento: el ámbar sobre el tile miel no llega a AA.
          <a
            href={`mailto:${site.email}`}
            className="ring-focus shrink-0 text-small font-semibold text-fg underline decoration-current/30 underline-offset-4 hover:decoration-current"
          >
            {site.email}
          </a>
        )
      )}
    </Superficie>
  );
}
