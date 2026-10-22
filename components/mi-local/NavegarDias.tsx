"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { fieldClasses } from "@/components/forms/Field";
import Anchor from "@/components/ui/Anchor";
import Button from "@/components/ui/Button";
import { miLocal } from "@/content/mi-local";
import { cn } from "@/lib/utils";
import { enlaceDeVista, esClaveDeDia, sumarDias, type Vista } from "@/lib/mi-local/vista";

const flecha =
  "ring-focus inline-flex size-10 items-center justify-center rounded-pill border border-line bg-surface text-fg transition-colors duration-(--duration-chico) hover:border-fg/25";

/** Pasar de día: el anterior, el siguiente, hoy, o uno elegido en el calendario del navegador. Los filtros se quedan. */
export default function NavegarDias({ vista, hoy }: { vista: Vista; hoy: string }) {
  const router = useRouter();
  const copy = miLocal.agenda;
  const ir = (dia: string) => enlaceDeVista({ ...vista, dia });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Anchor href={ir(sumarDias(vista.dia, -1))} aria-label={copy.anterior} className={flecha}>
        <ChevronLeft aria-hidden className="size-5" />
      </Anchor>
      <Anchor href={ir(sumarDias(vista.dia, 1))} aria-label={copy.siguiente} className={flecha}>
        <ChevronRight aria-hidden className="size-5" />
      </Anchor>
      <label htmlFor="elegir-dia" className="sr-only">
        {copy.elegir}
      </label>
      <input
        key={vista.dia}
        id="elegir-dia"
        type="date"
        defaultValue={vista.dia}
        onChange={(evento) => {
          const dia = evento.currentTarget.value;
          if (esClaveDeDia(dia)) router.push(ir(dia));
        }}
        className={cn(fieldClasses, "min-h-10 w-auto py-1.5")}
      />
      {vista.dia !== hoy && (
        <Button href={ir(hoy)} variant="secondary" size="compact">
          {copy.hoy}
        </Button>
      )}
    </div>
  );
}
