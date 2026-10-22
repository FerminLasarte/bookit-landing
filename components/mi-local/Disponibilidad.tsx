import { labelClasses, fieldClasses } from "@/components/forms/Field";
import { miLocal } from "@/content/mi-local";
import type { Disponibilidad as Valores } from "@/lib/mi-local/cupones";
import { horaDe } from "@/lib/mi-local/horario";
import { cn } from "@/lib/utils";
import { Apartado } from "./HorasDelDia";
import { claseDeOpcion } from "./Opciones";

/*
 * Dónde y cuándo vale un cupón o un premio: los servicios, los días y una
 * franja optativa, la misma pieza en los dos, como `AvailabilitySection` y la
 * hoja de servicios de la app. Son casillas y listas comunes: andan sin
 * JavaScript. Lo que no va lo dice la acción.
 */

/** Las horas de la franja, cada 30 minutos, como `09:00`; más la que ya tenía si no cae en la grilla. */
function horas(actual: string | null) {
  const grilla = Array.from({ length: 48 }, (_, i) => horaDe(i * 30));
  return actual && !grilla.includes(actual) ? [...grilla, actual].sort() : grilla;
}

/** Una casilla con la píldora de las opciones. */
function Casilla({ nombre, valor, marcada, children }: { nombre: string; valor: number; marcada: boolean; children: string }) {
  return (
    <label className={cn(claseDeOpcion(false), "cursor-pointer gap-2 has-checked:bg-fg has-checked:text-page")}>
      <input type="checkbox" name={nombre} value={valor} defaultChecked={marcada} className="size-4 accent-fg" />
      {children}
    </label>
  );
}

export default function Disponibilidad({
  valores,
  servicios,
}: {
  valores?: Valores & { servicios: number[] };
  servicios: { id: number; nombre: string }[];
}) {
  const copy = miLocal.disponibilidad;
  const dias = valores?.dias ?? [1, 2, 3, 4, 5, 6, 7];

  return (
    <>
      {servicios.length > 0 && (
        <Apartado titulo={copy.servicios}>
          <p className="-mt-2 text-small text-muted">{copy.serviciosBajada}</p>
          <div className="flex flex-wrap gap-2">
            {servicios.map((s) => (
              <Casilla key={s.id} nombre="servicios" valor={s.id} marcada={Boolean(valores?.servicios.includes(s.id))}>
                {s.nombre}
              </Casilla>
            ))}
          </div>
        </Apartado>
      )}

      <Apartado titulo={copy.dias}>
        <div className="flex flex-wrap gap-2">
          {copy.letras.map((letra, i) => (
            <Casilla key={letra} nombre="dias" valor={i + 1} marcada={dias.includes(i + 1)}>
              {letra}
            </Casilla>
          ))}
        </div>
      </Apartado>

      <Apartado titulo={copy.franja}>
        <p className="-mt-2 text-small text-muted">{copy.franjaBajada}</p>
        <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
          {(
            [
              ["hora_inicio", copy.desde, valores?.horaInicio ?? null],
              ["hora_fin", copy.hasta, valores?.horaFin ?? null],
            ] as const
          ).map(([nombre, etiqueta, actual]) => (
            <div key={nombre}>
              <label htmlFor={`franja-${nombre}`} className={labelClasses}>
                {etiqueta}
              </label>
              <select
                id={`franja-${nombre}`}
                name={nombre}
                defaultValue={actual ?? ""}
                className={cn(fieldClasses, "mt-2 tabular-nums")}
              >
                <option value="">{copy.sinFranja}</option>
                {horas(actual).map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </Apartado>
    </>
  );
}
