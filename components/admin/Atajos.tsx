"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Button from "@/components/ui/Button";
import Dialogo from "@/components/ui/Dialogo";
import { atajosAdmin, seccionesAdmin } from "@/content/admin";
import Buscador, { Tecla } from "./Buscador";

/*
 * Los atajos del panel (docs/PLAN-ADMIN-V5.md, paso R): ⌘K (Ctrl+K) abre
 * "Ir a…", `g` y una letra van a una sección, `/` lleva a la búsqueda de la
 * página y `?` muestra la lista. Las letras no hacen nada mientras se escribe
 * en un campo ni con un diálogo abierto.
 */

/** Cuánto espera la letra después de la `g`. */
const ESPERA_DE_LA_G = 1000;

const AbrirBuscador = createContext<() => void>(() => {});

/** Si lo que tiene el foco es un lugar para escribir. */
function esCampo(destino: EventTarget | null) {
  return (
    destino instanceof HTMLElement &&
    (destino.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(destino.tagName))
  );
}

const nada = () => () => {};

/** "⌘" en Apple y "Ctrl" en el resto. El servidor no sabe: dibuja "⌘" y se corrige al hidratar. */
function useTeclaDeComando() {
  return useSyncExternalStore(
    nada,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl"),
    () => "⌘",
  );
}

export default function Atajos({ children }: { children: ReactNode }) {
  const router = useRouter();
  const buscador = useRef<HTMLDialogElement>(null);
  const ayuda = useRef<HTMLDialogElement>(null);
  const id = useId();
  // Cambia al cerrar: el buscador vuelve vacío la próxima vez.
  const [vez, setVez] = useState(0);
  const comando = useTeclaDeComando();
  const copy = atajosAdmin;

  const abrir = useCallback(() => {
    if (!document.querySelector("dialog[open]")) buscador.current?.showModal();
  }, []);

  const ir = (href: string) => {
    buscador.current?.close();
    router.push(href);
  };

  useEffect(() => {
    let g = 0;
    const alApretar = (evento: KeyboardEvent) => {
      if ((evento.metaKey || evento.ctrlKey) && evento.key.toLowerCase() === "k") {
        evento.preventDefault();
        abrir();
        return;
      }
      if (evento.metaKey || evento.ctrlKey || evento.altKey || esCampo(evento.target)) return;
      if (document.querySelector("dialog[open]")) return;

      if (evento.key === "?") {
        evento.preventDefault();
        ayuda.current?.showModal();
      } else if (evento.key === "/") {
        const campo = document.getElementById("q");
        if (!campo) return;
        evento.preventDefault();
        campo.focus();
      } else if (evento.key === "g") {
        g = Date.now();
      } else if (Date.now() - g < ESPERA_DE_LA_G) {
        g = 0;
        const seccion = seccionesAdmin.find((s) => s.tecla === evento.key);
        if (!seccion) return;
        evento.preventDefault();
        router.push(seccion.href);
      }
    };
    window.addEventListener("keydown", alApretar);
    return () => window.removeEventListener("keydown", alApretar);
  }, [abrir, router]);

  return (
    <AbrirBuscador value={abrir}>
      {children}

      <Dialogo
        ref={buscador}
        etiqueta={`${id}-buscador`}
        onClose={() => setVez((v) => v + 1)}
        className="mt-[12dvh] mb-auto w-[min(36rem,calc(100%-2.5rem))] overflow-hidden p-0"
      >
        <Buscador key={vez} etiqueta={`${id}-buscador`} alElegir={ir} />
      </Dialogo>

      <Dialogo ref={ayuda} etiqueta={id}>
        <h2 id={id} className="text-title font-bold text-fg">
          {copy.ayuda.titulo}
        </h2>
        <p className="mt-2 text-small text-muted">{copy.ayuda.bajada}</p>
        <dl className="mt-5 flex flex-col gap-2.5 text-small">
          <Atajo teclas={[comando, "K"]}>{copy.ayuda.abrirBuscador}</Atajo>
          {seccionesAdmin.map((s) => (
            <Atajo key={s.id} teclas={["g", s.tecla]}>{`${copy.ayuda.irA} ${s.label}`}</Atajo>
          ))}
          <Atajo teclas={["/"]}>{copy.ayuda.busquedaDeLaPagina}</Atajo>
          <Atajo teclas={["?"]}>{copy.ayuda.estaLista}</Atajo>
        </dl>
        <Button onClick={() => ayuda.current?.close()} className="mt-6 w-full">
          {copy.ayuda.cerrar}
        </Button>
      </Dialogo>
    </AbrirBuscador>
  );
}

/** Una fila de la lista de atajos: lo que hace y sus teclas. */
function Atajo({ teclas, children }: { teclas: string[]; children: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-fg">{children}</dt>
      <dd className="flex shrink-0 gap-1">
        {teclas.map((t) => (
          <Tecla key={t}>{t}</Tecla>
        ))}
      </dd>
    </div>
  );
}

/** "Buscar", arriba de las secciones: abre "Ir a…" para quien no conoce el atajo. */
export function BotonBuscar() {
  const abrir = use(AbrirBuscador);
  const comando = useTeclaDeComando();

  return (
    <button
      type="button"
      onClick={abrir}
      className="ring-focus flex min-h-11 w-full items-center gap-3 rounded-pill border border-line px-4 text-small text-muted transition-colors duration-(--duration-chico) hover:bg-fg/6 hover:text-fg"
    >
      <Search aria-hidden className="size-[1.125rem] shrink-0" strokeWidth={1.75} />
      <span className="flex-1 text-left">{atajosAdmin.buscar}</span>
      <span aria-hidden className="flex gap-1 max-lg:hidden">
        <Tecla>{comando}</Tecla>
        <Tecla>K</Tecla>
      </span>
    </button>
  );
}
