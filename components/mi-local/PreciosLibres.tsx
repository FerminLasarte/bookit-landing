"use client";

import { useActionState } from "react";
import { cambiarPreciosLibres, type EstadoDeEquipo } from "@/app/mi-local/(panel)/equipo/acciones";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { miLocal } from "@/content/mi-local";
import type { Incluye } from "@/lib/mi-local/gestion";
import RespuestaDeAccion from "./RespuestaDeAccion";

/**
 * "Precios libres", el ajuste del equipo de la app: si cada profesional puede
 * tener su precio. Si el plan no lo incluye, dice desde cuál.
 */
export default function PreciosLibres({ prendido, plan }: { prendido: boolean; plan: Incluye }) {
  const copy = miLocal.equipo.preciosLibres;
  const [estado, cambiar, cambiando] = useActionState<EstadoDeEquipo, FormData>(cambiarPreciosLibres, { error: null });

  return (
    <Superficie tone="surface" className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
      <div>
        <p className="flex items-center gap-2 font-semibold text-fg">
          {copy.titulo}
          {plan.incluida && <Badge tono={prendido ? "bien" : "neutro"}>{prendido ? copy.prendido : copy.apagado}</Badge>}
        </p>
        <p className="mt-1 text-small text-muted">
          {copy.bajada}{" "}
          {!plan.incluida && plan.desde && (
            <>
              {copy.bloqueado(plan.desde)} <TextLink href="/planes">{miLocal.equipo.verPlanes}</TextLink>
            </>
          )}
        </p>
        <RespuestaDeAccion estado={estado} className="mt-2" />
      </div>
      {plan.incluida && (
        <form action={cambiar} className="shrink-0">
          <input type="hidden" name="valor" value={prendido ? "0" : "1"} />
          <Button type="submit" size="compact" variant="secondary" disabled={cambiando}>
            {cambiando ? copy.guardando : prendido ? copy.apagar : copy.prender}
          </Button>
        </form>
      )}
    </Superficie>
  );
}
