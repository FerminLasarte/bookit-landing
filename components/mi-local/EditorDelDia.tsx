"use client";

import { useState } from "react";
import { guardarDias } from "@/app/mi-local/(panel)/horarios/acciones";
import Field from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import { Volver } from "@/components/ui/Dialogo";
import { miLocal } from "@/content/mi-local";
import { enviarSinBorrar } from "@/lib/formularios";
import {
  DIAS_DE_LA_SEMANA,
  INTERVALOS,
  duracionCorta,
  franjasDe,
  horaDe,
  minutosDeAtencion,
  type Dia,
  type Modalidad,
} from "@/lib/mi-local/horario";
import { useAccionQueCierra } from "@/lib/mi-local/respuesta";
import { cn } from "@/lib/utils";
import { Apartado, BarraDelDia, claseDeBotonDeTexto, ElegirUno, SelectorDeHora } from "./HorasDelDia";
import { claseDeOpcion } from "./Opciones";
import RespuestaDeAccion from "./RespuestaDeAccion";

/** Un descanso mientras se edita: recién agregado, todavía sin horas. */
type Descanso = { desde: number | null; hasta: number | null };

/**
 * El editor de un día, como `EditorDiaSheet` de la app: abierto o cerrado,
 * cuándo abre y cierra, sus descansos, cómo se atiende y en qué otros días se
 * repite. La base decide si va (D3 del plan de la fase 3).
 */
export default function EditorDelDia({
  profesional,
  dia,
  inicial,
  repetirEn,
  cerrar,
}: {
  profesional: string;
  /** 1 = lunes … 7 = domingo. */
  dia: number;
  inicial: Dia;
  repetirEn: number[];
  cerrar: () => void;
}) {
  const copy = miLocal.horarios.dia;
  const nombres = miLocal.horarios.dias;
  const [abierto, setAbierto] = useState(inicial.abierto);
  const [apertura, setApertura] = useState(inicial.apertura);
  const [cierre, setCierre] = useState(inicial.cierre);
  const [descansos, setDescansos] = useState<Descanso[]>(inicial.descansos);
  const [modalidad, setModalidad] = useState<Modalidad>(inicial.modalidad);
  const [intervalo, setIntervalo] = useState(inicial.intervalo);
  const [dias, setDias] = useState(repetirEn);
  const [estado, enviar, enviando] = useAccionQueCierra(guardarDias, cerrar);

  // Lo que se ve arriba: sólo con los descansos que ya tienen sus dos horas.
  const completos = descansos.flatMap((d) => (d.desde !== null && d.hasta !== null ? [{ desde: d.desde, hasta: d.hasta }] : []));
  const vista: Dia = { abierto, apertura, cierre, descansos: completos, modalidad, intervalo };
  const atencion = Math.max(minutosDeAtencion(vista), 0);
  const cambiarDescanso = (i: number, cambio: Partial<Descanso>) =>
    setDescansos(descansos.map((d, j) => (j === i ? { ...d, ...cambio } : d)));

  return (
    <form onSubmit={enviarSinBorrar(enviar)} className="flex flex-col gap-6">
      <input type="hidden" name="profesional" value={profesional} />
      <input type="hidden" name="abierto" value={abierto ? "1" : "0"} />
      <input type="hidden" name="modalidad" value={modalidad} />
      <input type="hidden" name="intervalo" value={intervalo} />
      {dias.map((d) => (
        <input key={d} type="hidden" name="dias" value={d} />
      ))}

      <div>
        <h2 id="editor-del-dia" className="text-title font-bold text-fg">
          {nombres[dia - 1]}
        </h2>
        <p className="mt-1 text-small text-muted">
          {copy.bajada(abierto ? duracionCorta(atencion) : null, abierto ? completos.length : 0)}
        </p>
      </div>

      <ElegirUno
        etiqueta={nombres[dia - 1] ?? ""}
        opciones={[
          { valor: "abierto", label: copy.abierto },
          { valor: "cerrado", label: copy.cerrado },
        ]}
        valor={abierto ? "abierto" : "cerrado"}
        onChange={(v) => setAbierto(v === "abierto")}
      />

      {abierto && (
        <>
          <div className="flex flex-col gap-2">
            <BarraDelDia franjas={franjasDe(vista)} escala={{ desde: apertura, hasta: Math.max(cierre, apertura + 30) }} />
            <p aria-hidden className="flex justify-between text-micro text-muted tabular-nums">
              <span>{horaDe(apertura)}</span>
              <span>{horaDe(cierre)}</span>
            </p>
          </div>

          <Apartado titulo={copy.horario} className="gap-4">
            <div className="grid grid-cols-2 gap-3">
              <SelectorDeHora id="dia-abre" name="abre" label={copy.abre} valor={apertura} onChange={(m) => m !== null && setApertura(m)} />
              <SelectorDeHora id="dia-cierra" name="cierra" label={copy.cierra} valor={cierre} onChange={(m) => m !== null && setCierre(m)} />
            </div>
            {descansos.map((d, i) => (
              <div key={i} role="group" aria-label={copy.descanso(i + 1)} className="flex flex-col gap-2 border-t border-line pt-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-small font-semibold text-fg">{copy.descanso(i + 1)}</p>
                  <button
                    type="button"
                    onClick={() => setDescansos(descansos.filter((_, j) => j !== i))}
                    className={claseDeBotonDeTexto("danger")}
                  >
                    {copy.quitarDescanso}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <SelectorDeHora id={`descanso-${i}-desde`} name="descanso_desde" label={copy.desde} valor={d.desde} onChange={(m) => cambiarDescanso(i, { desde: m })} />
                  <SelectorDeHora id={`descanso-${i}-hasta`} name="descanso_hasta" label={copy.hasta} valor={d.hasta} onChange={(m) => cambiarDescanso(i, { hasta: m })} />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setDescansos([...descansos, { desde: null, hasta: null }])}
              className={cn(claseDeBotonDeTexto("accent"), "self-start")}
            >
              + {copy.agregarDescanso}
            </button>
          </Apartado>

          <Apartado titulo={copy.turnos} className="gap-4 border-t border-line pt-5">
            <div role="radiogroup" aria-label={copy.turnos} className="grid gap-2 sm:grid-cols-2">
              {(["con_turno", "orden_llegada"] as const).map((m) => (
                <label
                  key={m}
                  className={cn(
                    "ring-focus flex cursor-pointer flex-col gap-0.5 rounded-field border px-4 py-3 transition-colors duration-(--duration-chico)",
                    modalidad === m ? "border-fg bg-fg/4" : "border-line hover:border-fg/25",
                  )}
                >
                  <input type="radio" name="modalidad_visible" checked={modalidad === m} onChange={() => setModalidad(m)} className="sr-only" />
                  <span className="font-semibold text-fg">{copy.modalidades[m].titulo}</span>
                  <span className="text-small text-muted">{copy.modalidades[m].bajada}</span>
                </label>
              ))}
            </div>
            {modalidad === "con_turno" && (
              <Field id="dia-intervalo" label={copy.intervalo}>
                {(props) => (
                  <>
                    <select {...props} value={intervalo} onChange={(e) => setIntervalo(Number(e.target.value))}>
                      {(INTERVALOS.includes(intervalo) ? INTERVALOS : [...INTERVALOS, intervalo]).map((m) => (
                        <option key={m} value={m}>
                          {duracionCorta(m)}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-small text-muted">{copy.intervaloBajada}</p>
                  </>
                )}
              </Field>
            )}
          </Apartado>
        </>
      )}

      <Apartado titulo={copy.repetir} className="border-t border-line pt-5">
        <div className="flex flex-wrap gap-2">
          {DIAS_DE_LA_SEMANA.map((d) => {
            const marcado = dias.includes(d);
            return (
              <label
                key={d}
                className={cn(claseDeOpcion(marcado), "min-w-12 justify-center", d === dia ? "cursor-default" : "cursor-pointer")}
              >
                <input
                  type="checkbox"
                  checked={marcado}
                  // El día que se edita va siempre.
                  disabled={d === dia}
                  onChange={() => setDias(marcado ? dias.filter((x) => x !== d) : [...dias, d].sort((a, b) => a - b))}
                  className="sr-only"
                  aria-label={nombres[d - 1]}
                />
                <span aria-hidden>{nombres[d - 1]?.slice(0, 3)}</span>
              </label>
            );
          })}
        </div>
        <p className="text-small text-muted">{copy.repetirNota}</p>
      </Apartado>

      <div className="flex flex-col gap-3">
        <RespuestaDeAccion estado={estado} className="text-center" />
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button type="submit" disabled={enviando} className="flex-1">
            {enviando ? copy.guardando : copy.guardar(dias.length)}
          </Button>
          <Volver onClick={cerrar} className="flex-1">
            {copy.volver}
          </Volver>
        </div>
      </div>
    </form>
  );
}
