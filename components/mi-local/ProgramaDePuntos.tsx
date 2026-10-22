"use client";

import { useActionState } from "react";
import { cambiarPrograma, type EstadoDeCrecimiento } from "@/app/mi-local/(panel)/crecimiento/acciones";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import RespuestaDeAccion from "./RespuestaDeAccion";

/**
 * Las dos filas de arriba de Recompensas en la app: prender el sistema de
 * puntos y "¿Cómo funcionan los puntos?", que acá se abre debajo (D7). El
 * interruptor va sin confirmación, como en la app.
 */
export default function ProgramaDePuntos({ prendido }: { prendido: boolean }) {
  const { programa, reglas } = miLocal.recompensas;
  const [estado, cambiar, cambiando] = useActionState<EstadoDeCrecimiento, FormData>(cambiarPrograma, { error: null });

  return (
    <Superficie tone="surface" className="flex flex-col gap-4 p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="flex items-center gap-2 font-semibold text-fg">
            {programa.titulo}
            <Badge tono={prendido ? "bien" : "neutro"}>{prendido ? programa.prendido : programa.apagado}</Badge>
          </p>
          <p className="mt-1 text-small text-muted">{prendido ? programa.bajadaPrendido : programa.bajadaApagado}</p>
          <RespuestaDeAccion estado={estado} className="mt-2" />
        </div>
        <form action={cambiar} className="shrink-0">
          <input type="hidden" name="valor" value={prendido ? "0" : "1"} />
          <Button type="submit" size="compact" variant={prendido ? "secondary" : "primary"} disabled={cambiando}>
            {cambiando ? programa.guardando : prendido ? programa.apagar : programa.prender}
          </Button>
        </form>
      </div>

      <details className="group border-t border-line pt-4">
        <summary className="ring-focus cursor-pointer list-none rounded-[4px] font-semibold text-fg [&::-webkit-details-marker]:hidden">
          {reglas.titulo}
        </summary>
        <dl className="mt-3 flex flex-col gap-3">
          {reglas.items.map((r) => (
            <div key={r.titulo}>
              <dt className="text-small font-semibold text-fg">{r.titulo}</dt>
              <dd className="text-small text-muted">{r.texto}</dd>
            </div>
          ))}
        </dl>
      </details>
    </Superficie>
  );
}
