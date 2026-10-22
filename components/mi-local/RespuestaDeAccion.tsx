import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import type { Respuesta } from "@/lib/mi-local/respuesta";
import { cn } from "@/lib/utils";

/**
 * Lo que contestó una acción del panel, debajo de su botón: el error (con
 * "Ver planes" si se destraba con otro plan) o que quedó guardado.
 */
export default function RespuestaDeAccion({ estado, className }: { estado: Respuesta; className?: string }) {
  if (estado.error) {
    return (
      <p role="alert" className={cn("text-small font-medium text-danger", className)}>
        {estado.error}{" "}
        {estado.verPlanes && <TextLink href="/planes">{miLocal.equipo.verPlanes}</TextLink>}
      </p>
    );
  }
  if (estado.listo) {
    return (
      <p role="status" className={cn("text-small text-muted", className)}>
        {miLocal.profesional.guardado}
      </p>
    );
  }
  return null;
}
