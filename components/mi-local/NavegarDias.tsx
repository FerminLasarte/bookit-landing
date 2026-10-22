"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { fieldClasses } from "@/components/forms/Field";
import Anchor from "@/components/ui/Anchor";
import Button from "@/components/ui/Button";
import { miLocal } from "@/content/mi-local";
import { cn } from "@/lib/utils";
import { enlaceConDia, esClaveDeDia, sumarDias, type Parametros } from "@/lib/mi-local/vista";

const flecha =
  "ring-focus inline-flex size-10 items-center justify-center rounded-pill border border-line bg-surface text-fg transition-colors duration-(--duration-chico) hover:border-fg/25";

/** Un enlace que, con `alIr`, navega por ahí: la agenda lo usa para atenuar la lista mientras llega el día nuevo. */
export function enlaceConAviso(href: string, alIr?: (href: string) => void) {
  return {
    href,
    onClick: alIr
      ? (evento: MouseEvent<HTMLAnchorElement>) => {
          evento.preventDefault();
          alIr(href);
        }
      : undefined,
  };
}

/**
 * Pasar de día: el anterior, el siguiente, hoy, o uno elegido en el calendario
 * del navegador. Lo demás que se eligió en la `ruta` (los filtros de la
 * agenda, el profesional de la carga) se queda. Con `semana`, las flechas
 * saltan siete días.
 */
export default function NavegarDias({
  dia,
  hoy,
  ruta,
  parametros,
  semana = false,
  alIr,
}: {
  dia: string;
  hoy: string;
  ruta: string;
  parametros: Parametros;
  semana?: boolean;
  alIr?: (href: string) => void;
}) {
  const router = useRouter();
  const copy = miLocal.agenda;
  const ir = (otro: string) => enlaceConDia(ruta, otro, parametros);
  const paso = semana ? 7 : 1;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Anchor
        {...enlaceConAviso(ir(sumarDias(dia, -paso)), alIr)}
        aria-label={semana ? copy.semanaAnterior : copy.anterior}
        className={flecha}
      >
        <ChevronLeft aria-hidden className="size-5" />
      </Anchor>
      <Anchor
        {...enlaceConAviso(ir(sumarDias(dia, paso)), alIr)}
        aria-label={semana ? copy.semanaSiguiente : copy.siguiente}
        className={flecha}
      >
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
          if (!esClaveDeDia(elegido)) return;
          if (alIr) alIr(ir(elegido));
          else router.push(ir(elegido));
        }}
        className={cn(fieldClasses, "min-h-10 w-auto py-1.5")}
      />
      {dia !== hoy && (
        <Button {...enlaceConAviso(ir(hoy), alIr)} variant="secondary" size="compact">
          {copy.hoy}
        </Button>
      )}
    </div>
  );
}
