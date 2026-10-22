"use client";

import { ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import Dialogo from "@/components/ui/Dialogo";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { DIA_CERRADO, DIAS_DE_LA_SEMANA, duracionCorta, etiquetaDe, franjasDe, minutosDeAtencion, type Dia } from "@/lib/mi-local/horario";
import EditorDelDia from "./EditorDelDia";
import { BarraDelDia } from "./HorasDelDia";

/**
 * La semana habitual de un profesional, como `SemanaTab` de la app: los siete
 * días a la vista, cada uno con sus franjas y su barra, y arriba cuánto se
 * atiende. Si el dueño lo edita, cada día abre su editor.
 */
export default function SemanaDelProfesional({
  profesional,
  semana,
  editable,
}: {
  profesional: string;
  /** De lunes a domingo. */
  semana: Dia[];
  editable: boolean;
}) {
  const copy = miLocal.horarios.semana;
  const nombres = miLocal.horarios.dias;
  const dialogo = useRef<HTMLDialogElement>(null);
  // Al cerrarse, el editor se desarma: cada apertura arranca de lo guardado.
  const [editando, setEditando] = useState<number | null>(null);

  const abiertos = semana.filter((d) => d.abierto);
  const escala = abiertos.length
    ? { desde: Math.min(...abiertos.map((d) => d.apertura)), hasta: Math.max(...abiertos.map((d) => d.cierre)) }
    : { desde: 9 * 60, hasta: 18 * 60 };
  const total = abiertos.reduce((suma, d) => suma + minutosDeAtencion(d), 0);

  const abrir = (dia: number) => {
    setEditando(dia);
    dialogo.current?.showModal();
  };

  /**
   * Con lo que se pueda adivinar puesto, como la app: un día cerrado arranca
   * con la forma del primer día abierto y, con la semana vacía, "Repetir en"
   * viene de lunes a viernes.
   */
  const editor = (dia: number) => {
    const actual = semana[dia - 1] ?? DIA_CERRADO;
    const inicial = actual.abierto ? actual : { ...(abiertos[0] ?? actual), abierto: true };
    return {
      inicial,
      repetirEn: abiertos.length ? [dia] : [...new Set([1, 2, 3, 4, 5, dia])].sort((a, b) => a - b),
    };
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold text-fg">{copy.titulo}</h2>
        <p className="text-small text-muted">{copy.resumen(abiertos.length, duracionCorta(total))}</p>
      </div>

      <Superficie tone="surface">
        <ul className="divide-y divide-line">
          {DIAS_DE_LA_SEMANA.map((d) => {
            const dia = semana[d - 1];
            if (!dia) return null;
            const contenido = (
              <>
                <span className="flex min-w-0 flex-1 flex-col gap-2.5">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold text-fg">{nombres[d - 1]}</span>
                    <span className="truncate text-small text-muted tabular-nums">
                      {dia.abierto ? franjasDe(dia).map(etiquetaDe).join(" · ") : copy.cerrado}
                    </span>
                  </span>
                  <BarraDelDia franjas={franjasDe(dia)} escala={escala} />
                </span>
                {editable && <ChevronRight aria-hidden className="size-4 shrink-0 text-muted" />}
              </>
            );
            return (
              <li key={d}>
                {editable ? (
                  <button
                    type="button"
                    onClick={() => abrir(d)}
                    aria-label={copy.editar(nombres[d - 1] ?? "")}
                    className="ring-focus flex w-full items-center gap-3 px-5 py-4 text-left transition-colors duration-(--duration-chico) hover:bg-fg/4 md:px-6"
                  >
                    {contenido}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 px-5 py-4 md:px-6">{contenido}</div>
                )}
              </li>
            );
          })}
        </ul>
      </Superficie>
      {editable && !abiertos.length && <p className="text-small text-muted">{copy.nota}</p>}

      {editable && (
        <Dialogo
          ref={dialogo}
          etiqueta="editor-del-dia"
          onClose={() => setEditando(null)}
          className="w-[min(34rem,calc(100%-2.5rem))]"
        >
          {editando && (
            <EditorDelDia
              profesional={profesional}
              dia={editando}
              {...editor(editando)}
              cerrar={() => dialogo.current?.close()}
            />
          )}
        </Dialogo>
      )}
    </section>
  );
}
