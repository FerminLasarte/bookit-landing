"use client";

import { startTransition, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import Button from "@/components/ui/Button";
import Dialogo, { Volver } from "@/components/ui/Dialogo";
import { miLocal } from "@/content/mi-local";
import {
  FORMAS,
  ZOOM_MAXIMO,
  acercar,
  centrado,
  dibujar,
  exportar,
  mover,
  recorte,
  type Encuadre,
  type Forma,
} from "@/lib/encuadre";
import { useAccionQueCierra, type Respuesta } from "@/lib/mi-local/respuesta";
import { cn } from "@/lib/utils";
import RespuestaDeAccion from "./RespuestaDeAccion";

/** Cuánto corre la foto cada flecha, en fracción del recorte. */
const PASO = 0.05;

/** Un lienzo que dibuja la parte encuadrada de la foto a su tamaño en pantalla, nítido en pantallas densas. */
function Lienzo({
  foto,
  forma,
  encuadre,
  className,
}: {
  foto: ImageBitmap;
  forma: Forma;
  encuadre: Encuadre;
  className?: string;
}) {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const elemento = lienzo.current;
    if (!elemento) return;
    const pintar = () => {
      const densidad = window.devicePixelRatio || 1;
      elemento.width = Math.round(elemento.clientWidth * densidad);
      elemento.height = Math.round(elemento.clientHeight * densidad);
      dibujar(elemento, foto, forma, encuadre);
    };
    pintar();
    const observador = new ResizeObserver(pintar);
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [foto, forma, encuadre]);

  return <canvas ref={lienzo} aria-hidden className={cn("block size-full", className)} />;
}

/** Guardar y volver, con lo que contestó la acción. `recortes` arma lo que viaja: los JPEG y los campos. */
function Guardar({
  accion,
  cerrar,
  recortes,
}: {
  accion: (antes: Respuesta, datos: FormData) => Promise<Respuesta>;
  cerrar: () => void;
  recortes: (() => Promise<FormData>) | null;
}) {
  const copy = miLocal.encuadre;
  const [preparando, setPreparando] = useState(false);
  const [estado, enviar, enviando] = useAccionQueCierra(accion, cerrar);

  const guardar = async () => {
    if (!recortes) return;
    setPreparando(true);
    try {
      const datos = await recortes();
      startTransition(() => enviar(datos));
    } finally {
      setPreparando(false);
    }
  };

  const ocupado = preparando || enviando;
  return (
    <>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
        <Button type="button" onClick={guardar} disabled={ocupado || !recortes} className="flex-1">
          {ocupado ? copy.guardando : copy.guardar}
        </Button>
        <Volver onClick={cerrar} className="flex-1">
          {copy.volver}
        </Volver>
      </div>
      <RespuestaDeAccion estado={estado} className="mt-3 text-center" />
    </>
  );
}

function NoAbrio() {
  return (
    <p role="alert" className="text-small font-medium text-danger">
      {miLocal.encuadre.errores.abrir}
    </p>
  );
}

/**
 * Cambiar una foto, como la app: se elige del disco, se acomoda y se sube. La
 * del local tiene dos encuadres sobre la misma foto, el círculo y la portada,
 * con las dos vistas a mano (`PhotoFramerScreen`: una sola imagen no gana las
 * dos). La de un profesional, sólo el círculo. El recorte lo hace el
 * navegador: al servidor viajan los JPEG del tamaño que sube la app.
 */
export default function CambiarFoto({
  accion,
  formas,
  textos,
  hayFoto,
  campos,
}: {
  accion: (antes: Respuesta, datos: FormData) => Promise<Respuesta>;
  formas: Forma[];
  textos: { titulo: string; bajada: string };
  hayFoto: boolean;
  /** Lo que acompaña a la foto, como el id del profesional. */
  campos?: Record<string, string>;
}) {
  const copy = miLocal.encuadre;
  const titulo = useId();
  const dialogo = useRef<HTMLDialogElement>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const [foto, setFoto] = useState<ImageBitmap | null>(null);
  const [encuadres, setEncuadres] = useState<Partial<Record<Forma, Encuadre>>>({});
  const [activa, setActiva] = useState<Forma>(formas[0]!);
  const [noAbrio, setNoAbrio] = useState(false);
  // Cada foto elegida es un intento nuevo: lo que contestó el anterior no se muestra.
  const [intento, setIntento] = useState(0);
  const arrastre = useRef<{ x: number; y: number } | null>(null);

  const medida = foto && { ancho: foto.width, alto: foto.height };
  const encuadre = encuadres[activa];

  const elegir = async (elegido: File | undefined) => {
    if (!elegido) return;
    setNoAbrio(false);
    try {
      // La orientación de la cámara: una foto del teléfono no aparece acostada.
      const abierta = await createImageBitmap(elegido, { imageOrientation: "from-image" });
      const inicial = centrado({ ancho: abierta.width, alto: abierta.height });
      foto?.close();
      setFoto(abierta);
      setEncuadres(Object.fromEntries(formas.map((f) => [f, inicial])));
      setActiva(formas[0]!);
      setIntento((n) => n + 1);
      if (!dialogo.current?.open) dialogo.current?.showModal();
    } catch {
      setNoAbrio(true);
    }
  };

  const cambiar = (nuevo: (actual: Encuadre) => Encuadre) =>
    setEncuadres((todos) => (todos[activa] ? { ...todos, [activa]: nuevo(todos[activa]) } : todos));

  /** Cuántos píxeles de la foto mide un píxel del marco. */
  const escala = (marco: HTMLElement) =>
    medida && encuadre ? recorte(medida, activa, encuadre).ancho / marco.clientWidth : 0;

  const alArrastrar = (event: PointerEvent<HTMLDivElement>) => {
    if (!arrastre.current || !medida) return;
    const factor = escala(event.currentTarget);
    const dx = (event.clientX - arrastre.current.x) * factor;
    const dy = (event.clientY - arrastre.current.y) * factor;
    arrastre.current = { x: event.clientX, y: event.clientY };
    // Arrastrar la foto a la derecha muestra lo que está a su izquierda.
    cambiar((actual) => mover(medida, activa, actual, -dx, -dy));
  };

  const conFlechas = (event: KeyboardEvent<HTMLDivElement>) => {
    const sentidos: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const sentido = sentidos[event.key];
    if (!sentido || !medida || !encuadre) return;
    event.preventDefault();
    const r = recorte(medida, activa, encuadre);
    cambiar((actual) => mover(medida, activa, actual, sentido[0] * r.ancho * PASO, sentido[1] * r.alto * PASO));
  };


  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" variant="secondary" size="compact" onClick={() => archivo.current?.click()}>
        {hayFoto ? copy.cambiar : copy.poner}
      </Button>
      {noAbrio && !foto && <NoAbrio />}

      <Dialogo
        ref={dialogo}
        etiqueta={titulo}
        onClose={() => {
          foto?.close();
          setFoto(null);
        }}
        className="w-[min(36rem,calc(100%-2.5rem))]"
      >
        {/* Adentro del diálogo: abierto, lo de afuera queda inerte y "Elegir otra foto" no lo alcanzaría. */}
        <input
          ref={archivo}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            void elegir(event.target.files?.[0]);
            // Elegir la misma foto otra vez tiene que volver a abrirla.
            event.target.value = "";
          }}
        />
        <h2 id={titulo} className="text-title font-bold text-fg">
          {textos.titulo}
        </h2>
        <p className="mt-1 text-small text-muted">{textos.bajada}</p>

        {foto && medida && encuadre && (
          <div className="mt-5 flex flex-col gap-4">
            {formas.length > 1 && (
              <div role="radiogroup" aria-label={textos.titulo} className="flex gap-3">
                {formas.map((forma) => (
                  <button
                    key={forma}
                    type="button"
                    role="radio"
                    aria-checked={forma === activa}
                    onClick={() => setActiva(forma)}
                    className={cn(
                      "ring-focus flex min-w-0 flex-1 items-center gap-2 rounded-field border p-2 text-left sm:gap-3 transition-colors duration-(--duration-chico)",
                      forma === activa ? "border-fg" : "border-line hover:border-fg/25",
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 overflow-hidden bg-fg/6",
                        forma === "perfil" ? "size-8 rounded-full sm:size-10" : "h-8 w-16 rounded-[4px] sm:h-10 sm:w-20",
                      )}
                    >
                      <Lienzo foto={foto} forma={forma} encuadre={encuadres[forma]!} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-small font-semibold text-fg">{copy.formas[forma]}</span>
                      {/* En el teléfono no entra: queda el nombre de la forma y su miniatura. */}
                      <span className="hidden text-micro text-muted sm:block">{copy.ayudas[forma]}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* El mismo alto para las dos formas: cambiar de una a otra no mueve el diálogo. */}
            <div className="flex h-64 items-center justify-center sm:h-80">
              <div
                role="img"
                aria-label={copy.formas[activa]}
                tabIndex={0}
                onKeyDown={conFlechas}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  arrastre.current = { x: event.clientX, y: event.clientY };
                }}
                onPointerMove={alArrastrar}
                onPointerUp={() => (arrastre.current = null)}
                onPointerCancel={() => (arrastre.current = null)}
                style={{ aspectRatio: FORMAS[activa].proporcion }}
                className={cn(
                  "ring-focus relative cursor-grab touch-none overflow-hidden rounded-[4px] bg-ink-950 select-none active:cursor-grabbing",
                  activa === "perfil" ? "h-full" : "w-full",
                )}
              >
                <Lienzo foto={foto} forma={activa} encuadre={encuadre} />
                {/* El círculo: lo de afuera no se ve en la app. */}
                {activa === "perfil" && (
                  <span className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_100vmax_rgb(0_0_0/0.5)]" />
                )}
              </div>
            </div>
            <p className="text-small text-muted">{copy.mover}</p>

            <label className="flex items-center gap-3 text-small font-semibold text-fg">
              {copy.zoom}
              <input
                type="range"
                min={1}
                max={ZOOM_MAXIMO}
                step={0.01}
                value={encuadre.zoom}
                onChange={(event) => cambiar((actual) => acercar(medida, activa, actual, Number(event.target.value)))}
                className="w-full accent-(--color-accent)"
              />
            </label>

            <button
              type="button"
              onClick={() => archivo.current?.click()}
              className="ring-focus self-start rounded-[4px] px-1 -ml-1 text-small font-semibold text-accent-fg underline-offset-2 hover:underline"
            >
              {copy.otra}
            </button>
            {noAbrio && <NoAbrio />}
          </div>
        )}

        <Guardar
          key={intento}
          accion={accion}
          cerrar={() => dialogo.current?.close()}
          recortes={
            foto &&
            (async () => {
              const datos = new FormData();
              for (const [nombre, valor] of Object.entries(campos ?? {})) datos.set(nombre, valor);
              for (const forma of formas) {
                const jpeg = await exportar(foto, forma, encuadres[forma] ?? centrado({ ancho: foto.width, alto: foto.height }));
                datos.set(forma, new File([jpeg], `${forma}.jpg`, { type: "image/jpeg" }));
              }
              return datos;
            })
          }
        />
      </Dialogo>
    </div>
  );
}
