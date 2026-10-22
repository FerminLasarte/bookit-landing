"use client";

import { useActionState, useState } from "react";
import { guardarServiciosDelProfesional, type EstadoDeEquipo } from "@/app/mi-local/(panel)/equipo/acciones";
import { fieldClasses } from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import { miLocal } from "@/content/mi-local";
import { pesos } from "@/lib/formato";
import { enviarSinBorrar } from "@/lib/formularios";
import type { Asignado, Servicio } from "@/lib/mi-local/gestion";
import { cn } from "@/lib/utils";
import RespuestaDeAccion from "./RespuestaDeAccion";

/**
 * Qué servicios hace un profesional, como `AssignServicesBottomSheet`. Si lo
 * maneja el dueño (D2), también su duración propia y, con "Precios libres",
 * su precio propio; vacío es el del servicio.
 */
export default function ServiciosDelProfesional({
  idProfesional,
  servicios,
  asignados,
  editable,
  conPrecio,
}: {
  idProfesional: string;
  servicios: Servicio[];
  asignados: Asignado[];
  editable: boolean;
  /** "Precios libres" vale para el local: el switch y el plan. */
  conPrecio: boolean;
}) {
  const copy = miLocal.profesional.servicios;
  const [estado, enviar, enviando] = useActionState<EstadoDeEquipo, FormData>(guardarServiciosDelProfesional, { error: null });
  const [elegidos, setElegidos] = useState(() => new Set(asignados.map((a) => a.servicio)));
  const propio = (id: number) => asignados.find((a) => a.servicio === id);

  const alternar = (id: number, marcado: boolean) =>
    setElegidos((antes) => {
      const despues = new Set(antes);
      if (marcado) despues.add(id);
      else despues.delete(id);
      return despues;
    });

  return (
    <form onSubmit={enviarSinBorrar(enviar)} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={idProfesional} />
      {conPrecio && <input type="hidden" name="con_precio" value="1" />}
      <ul className="flex flex-col divide-y divide-line">
        {servicios.map((s) => {
          const marcado = elegidos.has(s.id);
          return (
            <li key={s.id} className="flex flex-col gap-3 py-3 first:pt-0">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="servicios"
                  value={s.id}
                  checked={marcado}
                  onChange={(e) => alternar(s.id, e.target.checked)}
                  className="ring-focus mt-1 size-4 accent-fg"
                />
                <span>
                  <span className="block font-semibold text-fg">{s.nombre}</span>
                  <span className="block text-small text-muted">
                    {miLocal.servicios.minutos(s.duracion)} · {pesos(s.precio)}
                  </span>
                </span>
              </label>
              {editable && marcado && (
                <div className="grid gap-3 pl-7 sm:grid-cols-2">
                  <Propio
                    id={`duracion-${s.id}`}
                    nombre={`duracion_${s.id}`}
                    rotulo={copy.duracion}
                    valor={propio(s.id)?.duracion}
                    ayuda={copy.delServicio(miLocal.servicios.minutos(s.duracion))}
                    paso={1}
                  />
                  {conPrecio && (
                    <Propio
                      id={`precio-${s.id}`}
                      nombre={`precio_${s.id}`}
                      rotulo={copy.precio}
                      valor={propio(s.id)?.precio}
                      ayuda={copy.delServicio(pesos(s.precio))}
                      paso="any"
                    />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {!editable && <p className="text-small text-muted">{copy.soloLectura}</p>}
      <RespuestaDeAccion estado={estado} />
      <Button type="submit" size="compact" disabled={enviando} className="self-start">
        {enviando ? miLocal.profesional.guardando : copy.guardar}
      </Button>
    </form>
  );
}

/** Un valor propio: chico, con lo que vale si queda vacío debajo. */
function Propio({
  id,
  nombre,
  rotulo,
  valor,
  ayuda,
  paso,
}: {
  id: string;
  nombre: string;
  rotulo: string;
  valor: number | null | undefined;
  ayuda: string;
  paso: number | "any";
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-small font-semibold text-fg">
        {rotulo}
      </label>
      <input
        id={id}
        name={nombre}
        type="number"
        inputMode="numeric"
        min={1}
        step={paso}
        defaultValue={valor ?? undefined}
        aria-describedby={`${id}-ayuda`}
        className={cn(fieldClasses, "mt-1.5")}
      />
      <p id={`${id}-ayuda`} className="mt-1 text-micro text-muted">
        {ayuda}
      </p>
    </div>
  );
}
