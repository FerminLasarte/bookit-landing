"use client";

import { useState } from "react";
import type { Frecuencia, Nivel, TarjetaDePlan } from "@/lib/planes";
import CarruselDePlanes from "./CarruselDePlanes";
import SelectorDeFrecuencia from "./SelectorDeFrecuencia";

/** El selector y las cards, para mirar: sin sesión no hay botón de compra. */
export default function Vitrina({
  tarjetas,
  inicial,
}: {
  tarjetas: Record<Frecuencia, TarjetaDePlan[]>;
  inicial: Nivel;
}) {
  const [plan, setPlan] = useState<Frecuencia>("mensual");
  const [nivel, setNivel] = useState<Nivel>(inicial);

  return (
    <div className="flex flex-col gap-[0.56rem]">
      <div className="px-[1.125rem]">
        <SelectorDeFrecuencia valor={plan} onCambiar={setPlan} />
      </div>
      <CarruselDePlanes tarjetas={tarjetas[plan]} elegido={nivel} onElegir={setNivel} />
    </div>
  );
}
