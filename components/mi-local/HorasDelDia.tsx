import type { ReactNode } from "react";
import Field from "@/components/forms/Field";
import { miLocal } from "@/content/mi-local";
import { horaDe, type Tramo } from "@/lib/mi-local/horario";
import { cn } from "@/lib/utils";
import { claseDeOpcion } from "./Opciones";

/*
 * Las piezas con que se dibuja y se edita un día del horario: la barra de sus
 * franjas, el selector de una hora, la elección entre dos o tres opciones,
 * cada apartado de un formulario y sus botones de texto.
 */

/** Las franjas del día sobre una escala, como `BarraDelDia` de la app: lo lleno se atiende, lo vacío no. */
export function BarraDelDia({ franjas, escala, className }: { franjas: Tramo[]; escala: Tramo; className?: string }) {
  const largo = Math.max(escala.hasta - escala.desde, 1);
  return (
    <span aria-hidden className={cn("relative block h-1.5 overflow-hidden rounded-pill bg-fg/8", className)}>
      {franjas
        .filter((f) => f.hasta > f.desde)
        .map((f) => (
          <span
            key={f.desde}
            className="absolute inset-y-0 rounded-pill bg-fg/75"
            style={{
              left: `${((f.desde - escala.desde) / largo) * 100}%`,
              width: `${((f.hasta - f.desde) / largo) * 100}%`,
            }}
          />
        ))}
    </span>
  );
}

/**
 * Las horas que se ofrecen, cada 30 minutos, más la que ya tenía si no cae en
 * la grilla. Ni la grilla ni el margen de los descansos son reglas: la base
 * decide lo que no va (D3 del plan de la fase 3).
 */
function horasCon(actual: number | null) {
  const grilla = Array.from({ length: 48 }, (_, i) => i * 30);
  return actual === null || grilla.includes(actual) ? grilla : [...grilla, actual].sort((a, b) => a - b);
}

/** Una hora del día. `null` es todavía sin elegir: un descanso recién agregado. */
export function SelectorDeHora({
  id,
  label,
  valor,
  onChange,
  name,
}: {
  id: string;
  label: string;
  valor: number | null;
  onChange: (minutos: number | null) => void;
  name?: string;
}) {
  return (
    <Field id={id} label={label}>
      {(props) => (
        <>
          {/* Lo que viaja es `09:00`, como lo guarda la base; la lista se ordena en minutos. */}
          {name && <input type="hidden" name={name} value={valor === null ? "" : horaDe(valor)} />}
          <select
            {...props}
            value={valor ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            className={cn(props.className, "tabular-nums")}
          >
            {valor === null && <option value="">{miLocal.horarios.dia.elegir}</option>}
            {horasCon(valor).map((m) => (
              <option key={m} value={m}>
                {horaDe(m)}
              </option>
            ))}
          </select>
        </>
      )}
    </Field>
  );
}

/** Elegir una entre pocas opciones, con la píldora de la agenda: radios que se ven como botones. */
export function ElegirUno<T extends string>({
  etiqueta,
  opciones,
  valor,
  onChange,
}: {
  etiqueta: string;
  opciones: { valor: T; label: string }[];
  valor: T;
  onChange: (valor: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="flex flex-wrap gap-2">
      {opciones.map((o) => (
        <label key={o.valor} className={cn(claseDeOpcion(valor === o.valor), "cursor-pointer")}>
          <input
            type="radio"
            name={etiqueta}
            value={o.valor}
            checked={valor === o.valor}
            onChange={() => onChange(o.valor)}
            className="sr-only"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

/**
 * Un apartado de un formulario con su título. El `legend` va oculto y el
 * título se ve aparte: un `legend` a la vista corta el borde de arriba.
 */
export function Apartado({ titulo, className, children }: { titulo: string; className?: string; children: ReactNode }) {
  return (
    <fieldset className={cn("flex flex-col gap-3", className)}>
      <legend className="sr-only">{titulo}</legend>
      <p aria-hidden className="font-semibold text-fg">
        {titulo}
      </p>
      {children}
    </fieldset>
  );
}

/** Un botón que se lee como texto: quitar, agregar, editar o eliminar algo de una lista. */
export const claseDeBotonDeTexto = (tono: "fg" | "danger" | "accent" = "fg") =>
  cn(
    "ring-focus rounded-[4px] px-1 text-small font-semibold underline-offset-2 hover:underline",
    { fg: "text-fg", danger: "text-danger", accent: "text-accent-fg" }[tono],
  );
