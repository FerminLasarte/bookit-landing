"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { fieldClasses } from "@/components/forms/Field";
import Anchor from "@/components/ui/Anchor";
import Button from "@/components/ui/Button";
import { miLocal } from "@/content/mi-local";
import { cn } from "@/lib/utils";
import { enlaceConDia, esClaveDeDia, sumarDias, type Parametros } from "@/lib/mi-local/vista";

const flecha =
  "ring-focus inline-flex size-10 items-center justify-center rounded-pill border border-line bg-surface text-fg transition-colors duration-(--duration-chico) hover:border-fg/25";

/**
 * Pasar de día: el anterior, el siguiente, hoy, o uno elegido en el calendario
 * del navegador. Lo demás que se eligió en la `ruta` (los filtros de la
 * agenda, el profesional de la carga) se queda.
 */
export default function NavegarDias({
  dia,
  hoy,
  ruta,
  parametros,
}: {
  dia: string;
  hoy: string;
  ruta: string;
  parametros: Parametros;
}) {
  const router = useRouter();
  const copy = miLocal.agenda;
  const ir = (otro: string) => enlaceConDia(ruta, otro, parametros);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Anchor href={ir(sumarDias(dia, -1))} aria-label={copy.anterior} className={flecha}>
        <ChevronLeft aria-hidden className="size-5" />
      </Anchor>
      <Anchor href={ir(sumarDias(dia, 1))} aria-label={copy.siguiente} className={flecha}>
        <ChevronRight aria-hidden className="size-5" />
      </Anchor>
      <label htmlFor="elegir-dia" className="sr-only">
        {copy.elegir}
      </label>
      <input
        key={dia}
        id="elegir-dia"
        type="date"
        defaultValue={dia}
        onChange={(evento) => {
          const elegido = evento.currentTarget.value;
          if (esClaveDeDia(elegido)) router.push(ir(elegido));
        }}
        className={cn(fieldClasses, "min-h-10 w-auto py-1.5")}
      />
      {dia !== hoy && (
        <Button href={ir(hoy)} variant="secondary" size="compact">
          {copy.hoy}
        </Button>
      )}
    </div>
  );
}
