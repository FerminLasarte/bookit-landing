"use client";

import { useRef, useState } from "react";
import { eliminarDiaEspecial, guardarDiaEspecial } from "@/app/mi-local/(panel)/horarios/acciones";
import Field from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import Dialogo, { Volver } from "@/components/ui/Dialogo";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { dia as diaLargo } from "@/lib/formato";
import { enviarSinBorrar } from "@/lib/formularios";
import { horaDe, type DiaEspecial } from "@/lib/mi-local/horario";
import { useAccionQueCierra } from "@/lib/mi-local/respuesta";
import { Apartado, claseDeBotonDeTexto, ElegirUno, SelectorDeHora } from "./HorasDelDia";
import RespuestaDeAccion from "./RespuestaDeAccion";

/** "Cerrado de 10:00 a 12:00 · Médico" (`ExcepcionFila` de la app). */
function detalleDe({ tipo, horas, motivo }: DiaEspecial) {
  const { detalle } = miLocal.horarios.especiales;
  const que = tipo === "dia_libre" || !horas ? detalle.dia_libre() : detalle[tipo](horaDe(horas.desde), horaDe(horas.hasta));
  return [que, motivo].filter(Boolean).join(" · ");
}

/**
 * Los días especiales por venir, como `ExceptionsTab` de la app: los días
 * libres y las horas cerradas, para crear, editar y eliminar si el dueño lo
 * edita.
 */
export default function DiasEspeciales({
  profesional,
  dias,
  editable,
  hoy,
}: {
  profesional: string;
  dias: DiaEspecial[];
  editable: boolean;
  hoy: string;
}) {
  const copy = miLocal.horarios.especiales;
  const formulario = useRef<HTMLDialogElement>(null);
  const confirmacion = useRef<HTMLDialogElement>(null);
  // Cerrado, el formulario se desarma: cada apertura arranca de lo guardado.
  const [editando, setEditando] = useState<DiaEspecial | "nuevo" | null>(null);
  const [borrando, setBorrando] = useState<DiaEspecial | null>(null);
  const [estadoBaja, eliminar, eliminando] = useAccionQueCierra(eliminarDiaEspecial, () => confirmacion.current?.close());

  const abrir = (que: DiaEspecial | "nuevo") => {
    setEditando(que);
    formulario.current?.showModal();
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold text-fg">{copy.titulo}</h2>
          <p className="mt-1 text-small text-muted">{dias.length ? copy.proximos(dias.length) : copy.bajada}</p>
        </div>
        {editable && (
          <Button size="compact" variant="secondary" onClick={() => abrir("nuevo")}>
            {copy.nuevo}
          </Button>
        )}
      </div>

      <Superficie tone="surface">
        {dias.length ? (
          <ul className="divide-y divide-line">
            {dias.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 md:px-6">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-fg first-letter:uppercase">{diaLargo(d.fecha)}</span>
                  <span className="block text-small text-muted">{detalleDe(d)}</span>
                </span>
                {editable && (
                  <span className="flex gap-3">
                    {/* El horario especial la app lo muestra pero no lo crea: acá tampoco se edita. */}
                    {d.tipo !== "horario_especial" && (
                      <button
                        type="button"
                        onClick={() => abrir(d)}
                        aria-label={copy.editarDia(diaLargo(d.fecha))}
                        className={claseDeBotonDeTexto()}
                      >
                        {copy.editarUno}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setBorrando(d);
                        confirmacion.current?.showModal();
                      }}
                      aria-label={copy.eliminarDia(diaLargo(d.fecha))}
                      className={claseDeBotonDeTexto("danger")}
                    >
                      {copy.eliminar}
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-center text-small text-muted">{copy.vacio}</p>
        )}
      </Superficie>

      {editable && (
        <>
          <Dialogo
            ref={formulario}
            etiqueta="dia-especial"
            onClose={() => setEditando(null)}
            className="w-[min(30rem,calc(100%-2.5rem))]"
          >
            {editando && (
              <FormularioDeDiaEspecial
                profesional={profesional}
                dia={editando === "nuevo" ? null : editando}
                hoy={hoy}
                cerrar={() => formulario.current?.close()}
              />
            )}
          </Dialogo>

          <Dialogo ref={confirmacion} etiqueta="eliminar-dia-especial">
            <h2 id="eliminar-dia-especial" className="text-title font-bold text-fg">
              {copy.eliminarTitulo}
            </h2>
            <p className="mt-3 text-body text-fg first-letter:uppercase">
              {copy.eliminarTexto(borrando && diaLargo(borrando.fecha))}
            </p>
            <form action={eliminar} className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <input type="hidden" name="id" value={borrando?.id ?? ""} />
              <input type="hidden" name="profesional" value={profesional} />
              <Button type="submit" variant="secondary" disabled={eliminando} className="flex-1">
                {eliminando ? copy.eliminando : copy.eliminar}
              </Button>
              <Volver onClick={() => confirmacion.current?.close()} className="flex-1">
                {copy.volver}
              </Volver>
            </form>
            <RespuestaDeAccion estado={estadoBaja} className="mt-3 text-center" />
          </Dialogo>
        </>
      )}
    </section>
  );
}

/**
 * Crear o editar un día especial, como `ExcepcionSheet`: un día libre o unas
 * horas cerradas, y por qué. Un día libre nuevo puede ir "del … al …" (D8).
 */
function FormularioDeDiaEspecial({
  profesional,
  dia,
  hoy,
  cerrar,
}: {
  profesional: string;
  /** El que se edita, o `null` para uno nuevo. */
  dia: DiaEspecial | null;
  hoy: string;
  cerrar: () => void;
}) {
  const copy = miLocal.horarios.especiales;
  const [tipo, setTipo] = useState<"dia_libre" | "bloqueo">(dia?.tipo === "bloqueo" ? "bloqueo" : "dia_libre");
  const [desde, setDesde] = useState<number | null>(dia?.horas?.desde ?? 9 * 60);
  const [hasta, setHasta] = useState<number | null>(dia?.horas?.hasta ?? 13 * 60);
  const [estado, enviar, enviando] = useAccionQueCierra(guardarDiaEspecial, cerrar);
  const conRango = tipo === "dia_libre" && !dia;

  return (
    <form onSubmit={enviarSinBorrar(enviar)} className="flex flex-col gap-5">
      {dia && <input type="hidden" name="id" value={dia.id} />}
      <input type="hidden" name="profesional" value={profesional} />
      <input type="hidden" name="tipo" value={tipo} />
      <h2 id="dia-especial" className="text-title font-bold text-fg">
        {dia ? copy.editar : copy.nuevo}
      </h2>

      <ElegirUno
        etiqueta={copy.titulo}
        opciones={[
          { valor: "dia_libre", label: copy.diaLibre },
          { valor: "bloqueo", label: copy.unasHoras },
        ]}
        valor={tipo}
        onChange={setTipo}
      />

      <div className={conRango ? "grid grid-cols-2 gap-3" : undefined}>
        <Field id="dia-especial-del" label={conRango ? copy.del : copy.dia}>
          {(props) => <input {...props} name="del" type="date" min={hoy} defaultValue={dia?.fecha ?? hoy} />}
        </Field>
        {conRango && (
          <Field id="dia-especial-al" label={copy.al} optional>
            {(props) => <input {...props} name="al" type="date" min={hoy} />}
          </Field>
        )}
      </div>
      {conRango && <p className="-mt-3 text-small text-muted">{copy.alNota}</p>}

      {tipo === "bloqueo" && (
        <Apartado titulo={copy.horasCerradas}>
          <div className="grid grid-cols-2 gap-3">
            <SelectorDeHora id="dia-especial-desde" name="desde" label={copy.desde} valor={desde} onChange={setDesde} />
            <SelectorDeHora id="dia-especial-hasta" name="hasta" label={copy.hasta} valor={hasta} onChange={setHasta} />
          </div>
        </Apartado>
      )}

      <Field id="dia-especial-motivo" label={copy.motivo} optional>
        {(props) => (
          <input {...props} name="motivo" type="text" maxLength={200} defaultValue={dia?.motivo ?? ""} placeholder={copy.motivoEjemplo} />
        )}
      </Field>

      <p className="text-small text-muted">{copy.aviso}</p>

      <div className="flex flex-col gap-3">
        <RespuestaDeAccion estado={estado} className="text-center" />
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button type="submit" disabled={enviando} className="flex-1">
            {enviando ? copy.guardando : copy.guardar}
          </Button>
          <Volver onClick={cerrar} className="flex-1">
            {copy.volver}
          </Volver>
        </div>
      </div>
    </form>
  );
}
