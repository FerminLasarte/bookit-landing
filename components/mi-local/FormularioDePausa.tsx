"use client";

import { useRouter } from "next/navigation";
import { useActionState, useRef, useState, useSyncExternalStore, useTransition, type MouseEvent } from "react";
import { pausar, volver } from "@/app/mi-local/(panel)/perfil/pausa/acciones";
import Field from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import Dialogo, { Volver } from "@/components/ui/Dialogo";
import Superficie from "@/components/ui/Superficie";
import { miLocal } from "@/content/mi-local";
import { diaCorto, diaDe, diaYMesDe, hora } from "@/lib/formato";
import { formularioSinBorrar } from "@/lib/formularios";
import type { TurnoEnLaPausa } from "@/lib/mi-local/pausa";
import type { Respuesta } from "@/lib/mi-local/respuesta";
import { sumarDias } from "@/lib/mi-local/vista";
import { enlaceDeLaPausa, vuelta, type Pausa } from "@/lib/pausa";
import { cn } from "@/lib/utils";
import { ElegirUno } from "./HorasDelDia";
import RespuestaDeAccion from "./RespuestaDeAccion";

/** Lo que muestra el formulario: `hasta` vacío es que todavía no se eligió. */
export type Elegido = { desde: string; conVuelta: boolean; hasta: string };

const nada = () => () => {};

/**
 * Pausar el local, cambiarle las fechas o volver, como la hoja de la app
 * (`pausa_sheet.dart`). Las fechas viven en la URL: la página lee con ellas
 * los turnos que se cancelan (D3). Con JavaScript, cambiar una fecha cambia la
 * URL y la lista llega sola, y guardar con turnos pregunta antes; sin él,
 * "Ver los turnos" pide la lista y el botón de guardar ya dice qué cancela.
 */
export default function FormularioDePausa({
  pausa,
  empezo,
  hoy,
  elegido,
  turnos,
}: {
  /** La que hay, en curso o programada, o `null`. */
  pausa: Pausa | null;
  empezo: boolean;
  hoy: string;
  /** Las fechas de la URL, con las que se leyó `turnos`. */
  elegido: Elegido;
  /** Los que se cancelan con esas fechas, o `null` si no se pudieron leer. */
  turnos: TurnoEnLaPausa[] | null;
}) {
  const copy = miLocal.pausa;
  const router = useRouter();
  const [mirando, startTransition] = useTransition();
  const conJs = useSyncExternalStore(nada, () => true, () => false);
  const confirmacion = useRef<HTMLDialogElement>(null);
  const [estado, enviar, enviando] = useActionState<Respuesta, FormData>(pausar, { error: null });
  const [estadoVuelta, volverAhora, volviendo] = useActionState<Respuesta, FormData>(volver, { error: null });

  const [desde, setDesde] = useState(elegido.desde);
  const [conVuelta, setConVuelta] = useState(elegido.conVuelta);
  const [hasta, setHasta] = useState(elegido.hasta);

  const hastaElegido = conVuelta ? hasta || null : null;
  const diaDeVuelta = vuelta({ desde, hasta: hastaElegido });
  const completa = desde !== "" && (!conVuelta || (hasta !== "" && hasta >= desde));
  const sinCambios = pausa !== null && desde === pausa.desde && hastaElegido === pausa.hasta;
  const cuantos = turnos?.length ?? 0;
  const ocupado = mirando || enviando || volviendo;

  /** Cambia una fecha y pide la lista de esas fechas. Una vuelta antes de la salida se borra, como en la app. */
  function mirar(cambio: Partial<Elegido>) {
    const nuevo = { desde, conVuelta, hasta, ...cambio };
    if (nuevo.hasta && nuevo.hasta < nuevo.desde) nuevo.hasta = "";
    setDesde(nuevo.desde);
    setConVuelta(nuevo.conVuelta);
    setHasta(nuevo.hasta);
    const url = enlaceDeLaPausa({ desde: nuevo.desde, vuelta: nuevo.conVuelta ? "con" : "sin", hasta: nuevo.hasta });
    startTransition(() => router.replace(url, { scroll: false }));
  }

  /** Con turnos que se cancelan y JavaScript, guardar pregunta antes, como la app. */
  function preguntar(event: MouseEvent<HTMLButtonElement>) {
    if (cuantos === 0) return;
    event.preventDefault();
    confirmacion.current?.showModal();
  }

  const etiquetaDeGuardar = enviando
    ? copy.guardando
    : !conJs && cuantos > 0
      ? copy.pausarYCancelar(cuantos)
      : pausa
        ? copy.guardar
        : copy.pausar;

  return (
    <div className="flex flex-col gap-6">
      <Superficie tone="surface" className="p-5 md:p-6">
        <form {...formularioSinBorrar(enviar)} className="flex flex-col gap-5">
          {turnos?.map((t) => <input key={t.id_turno} type="hidden" name="visto" value={t.id_turno} />)}
          {pausa && <input type="hidden" name="habia" value="1" />}

          <ElegirUno
            etiqueta={copy.vuelta}
            nombre="vuelta"
            opciones={[
              { valor: "con", label: copy.conVuelta },
              { valor: "sin", label: copy.sinFecha },
            ]}
            valor={conVuelta ? "con" : "sin"}
            onChange={(v) => mirar({ conVuelta: v === "con" })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Field id="pausa-desde" label={copy.desde}>
                {(props) => (
                  <input
                    {...props}
                    name="desde"
                    type="date"
                    required
                    // Empezada, se estira o se acorta sin moverle el principio (la base lo rechaza).
                    readOnly={empezo}
                    min={empezo ? undefined : hoy}
                    max={empezo ? undefined : sumarDias(hoy, 90)}
                    value={desde}
                    onChange={(e) => mirar({ desde: e.target.value })}
                    className={cn(props.className, empezo && "text-muted")}
                  />
                )}
              </Field>
              {empezo && <p className="mt-2 text-small text-muted">{copy.yaEmpezo}</p>}
            </div>
            {conVuelta && (
              <div>
                <Field id="pausa-hasta" label={copy.hasta}>
                  {(props) => (
                    <input
                      {...props}
                      name="hasta"
                      type="date"
                      required
                      min={desde && desde > hoy ? desde : hoy}
                      value={hasta}
                      onChange={(e) => mirar({ hasta: e.target.value })}
                    />
                  )}
                </Field>
                <p className="mt-2 text-small text-muted">{copy.hastaNota}</p>
              </div>
            )}
          </div>

          {completa && (
            <>
              <p className="text-small text-fg">
                {diaDeVuelta ? copy.volves(diaYMesDe(diaDeVuelta)) : copy.volvesCuandoQuieras}
              </p>
              <TurnosQueSeCancelan turnos={turnos} atenuada={mirando} />
            </>
          )}

          <div className="flex flex-col gap-3">
            <RespuestaDeAccion estado={estado} />
            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Sin JavaScript, el primero: el que manda Enter. Pide la lista sin guardar nada. */}
              {!conJs && (
                <Button type="submit" formAction="/mi-local/perfil/pausa" formMethod="get" variant="secondary">
                  {copy.verTurnos}
                </Button>
              )}
              <Button type="submit" disabled={!completa || sinCambios || ocupado} onClick={conJs ? preguntar : undefined}>
                {etiquetaDeGuardar}
              </Button>
            </div>
          </div>

          {/* Adentro del formulario: el botón que confirma lo manda con las mismas fechas. */}
          <Dialogo ref={confirmacion} etiqueta="pausa-confirmar">
            <h2 id="pausa-confirmar" className="text-title font-bold text-fg">
              {copy.confirmar.titulo(cuantos)}
            </h2>
            <p className="mt-3 text-body text-fg">{copy.confirmar.texto}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <Button type="submit" disabled={ocupado} onClick={() => confirmacion.current?.close()} className="flex-1">
                {copy.confirmar.si}
              </Button>
              <Volver onClick={() => confirmacion.current?.close()} className="flex-1">
                {copy.confirmar.revisar}
              </Volver>
            </div>
          </Dialogo>
        </form>
      </Superficie>

      {pausa && (
        <form action={volverAhora} className="flex flex-col items-start gap-2">
          <input type="hidden" name="empezo" value={empezo ? "1" : "0"} />
          <Button type="submit" variant="secondary" disabled={ocupado}>
            {volviendo ? copy.volviendo : empezo ? copy.volverAhora : copy.sacar}
          </Button>
          <RespuestaDeAccion estado={estadoVuelta} />
        </form>
      )}
    </div>
  );
}

/** "Se cancelan 3 turnos", con cada uno, como `TurnosQueSeCancelan` de la app. */
function TurnosQueSeCancelan({ turnos, atenuada }: { turnos: TurnoEnLaPausa[] | null; atenuada: boolean }) {
  const copy = miLocal.pausa.turnos;
  if (turnos === null) {
    return (
      <p role="alert" className="text-small font-medium text-danger">
        {copy.error}
      </p>
    );
  }
  if (turnos.length === 0) return <p className={cn("text-small text-muted", atenuada && "opacity-60")}>{copy.ninguno}</p>;

  return (
    <section aria-labelledby="pausa-turnos" className={cn("flex flex-col gap-3 transition-opacity", atenuada && "opacity-60")}>
      <div>
        <h2 id="pausa-turnos" className="font-semibold text-fg">
          {copy.titulo(turnos.length)}
        </h2>
        <p className="mt-1 text-small text-muted">{copy.nota}</p>
      </div>
      <ul className="flex flex-col divide-y divide-line rounded-[12px] border border-line">
        {turnos.map((t) => {
          const dia = diaDe(t.fecha_hora_inicio);
          return (
            <li key={t.id_turno} className="flex flex-col gap-0.5 px-4 py-3">
              <span className="text-small font-semibold text-fg first-letter:uppercase">
                {`${diaCorto(dia)} ${diaYMesDe(dia)} · ${hora(t.fecha_hora_inicio)}`}
              </span>
              <span className="text-small text-muted">
                {[t.cliente ?? copy.sinNombre, t.servicio, t.profesional].filter(Boolean).join(" · ")}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
