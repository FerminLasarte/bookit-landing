"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { ControlProps } from "@/components/forms/Field";
import { cn } from "@/lib/utils";

export type Opcion = { clave: string; principal: string; secundario?: string | null };

type Props<T> = {
  /** Lo que pasa `Field`: id, estilo y el error atado. */
  control: ControlProps;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Desde cuántas letras se busca. */
  minimo?: number;
  /** Lo que se muestra cuando la búsqueda no trae nada. */
  vacio: string;
  /** El texto de cuando falla la búsqueda. */
  fallo: string;
  buscar: (texto: string) => Promise<T[]>;
  opcion: (item: T) => Opcion;
  /** `null` cuando se escribe de nuevo: lo elegido dejó de valer. */
  onElegir: (item: T | null) => void;
};

/** Cuánto se espera después de la última tecla para buscar. */
const PAUSA = 250;

/**
 * Un campo que busca mientras se escribe y obliga a elegir de la lista: el
 * combobox de WAI-ARIA, con flechas, Enter y Escape. Lo que vale es lo
 * elegido, no lo escrito; escribir de nuevo lo borra.
 */
export default function Buscador<T>({
  control,
  name,
  placeholder,
  disabled,
  minimo = 3,
  vacio,
  fallo,
  buscar,
  opcion,
  onElegir,
}: Props<T>) {
  const lista = useId();
  const [texto, setTexto] = useState("");
  const [items, setItems] = useState<T[]>([]);
  const [abierta, setAbierta] = useState(false);
  const [activa, setActiva] = useState(-1);
  const [estado, setEstado] = useState<"quieto" | "buscando" | "listo" | "fallo">("quieto");
  const ultima = useRef(0);
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  useEffect(() => {
    const pedido = ++ultima.current;
    if (texto.trim().length < minimo) {
      setItems([]);
      setEstado("quieto");
      return;
    }
    setEstado("buscando");
    const espera = window.setTimeout(async () => {
      try {
        const encontrados = await buscarRef.current(texto.trim());
        // Sólo la última búsqueda pinta: una vieja que llega tarde no pisa la nueva.
        if (pedido !== ultima.current) return;
        setItems(encontrados);
        setActiva(encontrados.length > 0 ? 0 : -1);
        setEstado("listo");
      } catch {
        if (pedido === ultima.current) setEstado("fallo");
      }
    }, PAUSA);
    return () => window.clearTimeout(espera);
  }, [texto, minimo]);

  const elegir = (item: T) => {
    setTexto(opcion(item).principal);
    setAbierta(false);
    // El texto cambió por elegir, no por escribir: no hay que volver a buscar.
    ultima.current++;
    setItems([]);
    setEstado("quieto");
    onElegir(item);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!abierta) return setAbierta(true);
      if (items.length === 0) return;
      const paso = event.key === "ArrowDown" ? 1 : -1;
      setActiva((i) => (i + paso + items.length) % items.length);
    } else if (event.key === "Enter" && abierta && items[activa]) {
      event.preventDefault();
      elegir(items[activa]);
    } else if (event.key === "Escape" && abierta) {
      event.preventDefault();
      setAbierta(false);
    }
  };

  const mensaje =
    estado === "fallo" ? fallo : estado === "listo" && items.length === 0 ? vacio : null;
  const mostrar = abierta && (items.length > 0 || mensaje !== null);

  return (
    <div className="relative">
      <input
        {...control}
        type="text"
        name={name}
        role="combobox"
        aria-expanded={mostrar}
        aria-controls={lista}
        aria-autocomplete="list"
        aria-activedescendant={mostrar && activa >= 0 ? `${lista}-${activa}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        disabled={disabled}
        value={texto}
        onChange={(event) => {
          setTexto(event.target.value);
          setAbierta(true);
          onElegir(null);
        }}
        onFocus={() => setAbierta(true)}
        onBlur={() => setAbierta(false)}
        onKeyDown={onKeyDown}
      />
      <ul
        id={lista}
        role="listbox"
        hidden={!mostrar}
        className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-field border border-line bg-surface p-1 shadow-float"
      >
        {items.map((item, i) => {
          const { clave, principal, secundario } = opcion(item);
          return (
            <li
              key={clave}
              id={`${lista}-${i}`}
              role="option"
              aria-selected={i === activa}
              // mousedown y no click: el blur del campo cerraría la lista antes.
              onMouseDown={(event) => {
                event.preventDefault();
                elegir(item);
              }}
              onMouseEnter={() => setActiva(i)}
              className={cn("cursor-pointer rounded-[10px] px-3 py-2", i === activa && "bg-fg/6")}
            >
              <span className="block text-small font-semibold text-fg">{principal}</span>
              {secundario && <span className="block text-micro text-muted">{secundario}</span>}
            </li>
          );
        })}
        {items.length === 0 && mensaje && (
          <li role="presentation" className="px-3 py-2 text-small text-muted">
            {mensaje}
          </li>
        )}
      </ul>
    </div>
  );
}
