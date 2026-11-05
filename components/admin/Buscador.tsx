"use client";

import { Search } from "lucide-react";
import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { atajosAdmin, seccionesAdmin } from "@/content/admin";
import type { Encontrado, Encontrados } from "@/lib/admin/datos";
import { cn } from "@/lib/utils";

/** Un lugar de la lista: las secciones llevan su atajo. */
type Opcion = Encontrado & { tecla?: string };

type Estado = "quieto" | "buscando" | "error";

/** Sin mayúsculas ni tildes: "operacion" encuentra "Operación". */
const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

/**
 * Lo de adentro de "Ir a…" (docs/PLAN-ADMIN-V5.md, paso R): un campo y la
 * lista. Sin escribir, las secciones; escribiendo, las secciones que
 * coinciden y los locales y personas de /admin/buscar. Se maneja con las
 * flechas y Enter. Sólo lleva a lugares: las acciones siguen en la ficha.
 */
export default function Buscador({ etiqueta, alElegir }: { etiqueta: string; alElegir: (href: string) => void }) {
  const copy = atajosAdmin;
  const id = useId();
  const [texto, setTexto] = useState("");
  const [encontrados, setEncontrados] = useState<Encontrados | null>(null);
  const [estado, setEstado] = useState<Estado>("quieto");
  const [activo, setActivo] = useState(0);
  const pedido = texto.trim();

  // Espera a que se deje de tipear y descarta la respuesta de un pedido viejo.
  useEffect(() => {
    if (pedido.length < 2) return;
    const control = new AbortController();
    const espera = setTimeout(async () => {
      setEstado("buscando");
      try {
        const respuesta = await fetch(`/admin/buscar?q=${encodeURIComponent(pedido)}`, { signal: control.signal });
        if (!respuesta.ok) throw new Error(String(respuesta.status));
        setEncontrados(await respuesta.json());
        setEstado("quieto");
      } catch {
        if (!control.signal.aborted) setEstado("error");
      }
    }, 200);
    return () => {
      clearTimeout(espera);
      control.abort();
    };
  }, [pedido]);

  const buscado = normalizar(texto);
  const conTexto = pedido.length >= 2;
  const grupos: { titulo: string; opciones: Opcion[] }[] = [
    {
      titulo: copy.secciones,
      opciones: seccionesAdmin
        .filter((s) => !buscado || normalizar(s.label).includes(buscado))
        .map((s): Opcion => ({
          href: s.href,
          titulo: s.label,
          detalle: "",
          tecla: s.tecla,
        })),
    },
    {
      titulo: copy.locales,
      opciones: conTexto ? (encontrados?.comercios ?? []) : [],
    },
    {
      titulo: copy.personas,
      opciones: conTexto ? (encontrados?.personas ?? []) : [],
    },
  ].filter((g) => g.opciones.length > 0);
  const opciones = grupos.flatMap((g) => g.opciones);
  const elegida = Math.min(activo, opciones.length - 1);
  const idDe = (i: number) => `${id}-${i}`;

  const alApretar = (evento: KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      evento.preventDefault();
      if (opciones.length === 0) return;
      const paso = evento.key === "ArrowDown" ? 1 : -1;
      setActivo((elegida + paso + opciones.length) % opciones.length);
    } else if (evento.key === "Enter" && opciones[elegida]) {
      evento.preventDefault();
      alElegir(opciones[elegida].href);
    }
  };

  const aviso =
    conTexto && estado === "error"
      ? copy.error
      : conTexto && estado === "buscando"
        ? copy.buscando
        : conTexto && encontrados && opciones.length === 0
          ? copy.nada
          : "";

  let indice = 0;
  return (
    <>
      <h2 id={etiqueta} className="sr-only">
        {copy.titulo}
      </h2>
      <div className="flex items-center gap-3 border-b border-line px-5">
        <Search aria-hidden className="size-5 shrink-0 text-muted" />
        <input
          autoFocus
          type="text"
          role="combobox"
          aria-labelledby={etiqueta}
          aria-expanded={opciones.length > 0}
          aria-controls={`${id}-lista`}
          aria-activedescendant={opciones.length > 0 ? idDe(elegida) : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          value={texto}
          placeholder={copy.campo}
          onChange={(e) => {
            setTexto(e.target.value);
            setActivo(0);
          }}
          onKeyDown={alApretar}
          className="min-h-14 min-w-0 flex-1 bg-transparent text-body text-fg outline-none placeholder:text-muted"
        />
      </div>

      <div
        id={`${id}-lista`}
        role="listbox"
        aria-labelledby={etiqueta}
        className="max-h-[min(26rem,60dvh)] overflow-y-auto p-2"
      >
        {grupos.map((grupo) => (
          <div key={grupo.titulo} role="group" aria-labelledby={`${id}-${grupo.titulo}`} className="py-1">
            <p id={`${id}-${grupo.titulo}`} className="px-3 py-1.5 text-micro font-semibold text-muted">
              {grupo.titulo}
            </p>
            {grupo.opciones.map((opcion) => {
              const i = indice++;
              const esLaElegida = i === elegida;
              return (
                <div
                  key={opcion.href}
                  id={idDe(i)}
                  role="option"
                  aria-selected={esLaElegida}
                  onMouseMove={() => i !== elegida && setActivo(i)}
                  onClick={() => alElegir(opcion.href)}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-field px-3 py-2",
                    esLaElegida && "bg-fg/6",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-small font-semibold text-fg">{opcion.titulo}</span>
                    {opcion.detalle && <span className="block truncate text-micro text-muted">{opcion.detalle}</span>}
                  </span>
                  {opcion.tecla && (
                    <span className="flex shrink-0 gap-1 max-lg:hidden">
                      <Tecla>g</Tecla>
                      <Tecla>{opcion.tecla}</Tecla>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <p role="status" className={cn("px-3 text-small text-muted", aviso && "py-3")}>
          {aviso}
        </p>
      </div>

      <p className="border-t border-line px-5 py-3 text-micro text-muted max-lg:hidden">{copy.pie}</p>
    </>
  );
}

/** Una tecla, como se dibuja en los atajos. */
export function Tecla({ children }: { children: string }) {
  return (
    <kbd className="inline-flex min-w-6 items-center justify-center rounded-[6px] border border-line bg-surface px-1.5 font-sans text-micro font-semibold text-muted">
      {children}
    </kbd>
  );
}
