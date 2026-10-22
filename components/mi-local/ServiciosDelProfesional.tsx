"use client";

import { useActionState, useState } from "react";
import { guardarServiciosDelProfesional, type EstadoDeEquipo } from "@/app/mi-local/(panel)/equipo/acciones";
import { fieldClasses } from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import { miLocal } from "@/content/mi-local";
import { pesos } from "@/lib/formato";
import { formularioSinBorrar } from "@/lib/formularios";
import type { Asignado, Servicio } from "@/lib/mi-local/gestion";
import { cn } from "@/lib/utils";
import RespuestaDeAccion from "./RespuestaDeAccion";

/**
 * Qué servicios hace un profesional, como `AssignServicesBottomSheet`. Si lo
 * maneja el dueño (D2), también su duración propia y, con "Precios libres",
 * su precio propio; vacío es el del servicio. `propios`: es el profesional
 * del equipo con los suyos, como "Mis Servicios" de la app; edita su duración
 * y su precio, y no se asigna ni se quita servicios (D3 del plan del equipo).
 */
export default function ServiciosDelProfesional({
  idProfesional,
  servicios,
  asignados,
  editable,
  conPrecio,
  propios = false,
}: {
  idProfesional: string;
  servicios: Servicio[];
  asignados: Asignado[];
  editable: boolean;
  /** "Precios libres" vale para el local: el switch y el plan. */
  conPrecio: boolean;
  propios?: boolean;
}) {
  const copy = miLocal.profesional.servicios;
  const rotulos = propios ? miLocal.misServicios : copy;
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
    <form {...formularioSinBorrar(enviar)} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={idProfesional} />
      {conPrecio && <input type="hidden" name="con_precio" value="1" />}
      <ul className="flex flex-col divide-y divide-line">
        {servicios.map((s) => {
          const marcado = elegidos.has(s.id);
          return (
            <li key={s.id} className="flex flex-col gap-3 py-3 first:pt-0">
              {propios ? (
                <div>
                  <input type="hidden" name="servicios" value={s.id} />
                  <Detalle servicio={s} />
                </div>
              ) : (
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    name="servicios"
                    value={s.id}
                    checked={marcado}
                    onChange={(e) => alternar(s.id, e.target.checked)}
                    className="ring-focus mt-1 size-4 accent-fg"
                  />
                  <Detalle servicio={s} />
                </label>
              )}
              {editable && marcado && (
                <div className={cn("grid gap-3 sm:grid-cols-2", !propios && "pl-7")}>
                  <Propio
                    id={`duracion-${s.id}`}
                    nombre={`duracion_${s.id}`}
                    rotulo={rotulos.duracion}
                    valor={propio(s.id)?.duracion}
                    ayuda={copy.delServicio(miLocal.servicios.minutos(s.duracion))}
                    paso={1}
                  />
                  {conPrecio && (
                    <Propio
                      id={`precio-${s.id}`}
                      nombre={`precio_${s.id}`}
                      rotulo={rotulos.precio}
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
        {enviando ? miLocal.profesional.guardando : rotulos.guardar}
      </Button>
    </form>
  );
}

/** El nombre del servicio, con su duración y su precio de base. */
function Detalle({ servicio }: { servicio: Servicio }) {
  return (
    <span>
      <span className="block font-semibold text-fg">{servicio.nombre}</span>
      <span className="block text-small text-muted">
        {miLocal.servicios.minutos(servicio.duracion)} · {pesos(servicio.precio)}
      </span>
    </span>
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
