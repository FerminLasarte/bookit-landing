"use client";

import { useEffect, useRef, useState } from "react";
import { Copy } from "lucide-react";
import Eyebrow from "./Eyebrow";
import { cn } from "@/lib/utils";

const COPIED = "¡Código copiado con éxito!";
const MANUAL = "Copiá el código a mano: Ctrl + C";

/**
 * §6.3 — caja de referido. Tocar copia el código y muestra un toast 2,5s.
 * Si `navigator.clipboard` no está disponible (http, navegador viejo), cae a
 * seleccionar el texto en un input espejo para que el copiado manual funcione.
 */
export default function ReferralCode({ code }: { code: string }) {
  const [toast, setToast] = useState<string | null>(null);
  const mirrorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function copy() {
    try {
      if (!navigator.clipboard) throw new Error("clipboard no disponible");
      await navigator.clipboard.writeText(code);
      setToast(COPIED);
    } catch {
      const mirror = mirrorRef.current;
      if (mirror) {
        mirror.select();
        mirror.setSelectionRange(0, code.length);
      }
      setToast(MANUAL);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        /*
         * Sin `aria-label`. WCAG 2.5.3 (Label in Name) pide que el nombre
         * accesible CONTENGA el texto visible, y cualquier etiqueta que
         * escribamos a mano se desincroniza del contenido — la anterior
         * ("Copiar el código de invitación ABC123") no incluía ni "Tocá para
         * copiar" ni el encabezado, así que quien maneja el navegador por voz
         * decía lo que ve y no activaba nada. Dejando que el nombre salga del
         * contenido, la regla se cumple por construcción y el código va
         * incluido. El ícono ya está en `aria-hidden`.
         */
        // Sin `bg-amber-50` en claro: el texto chico de abajo daba 4,49:1 sobre ese
        // lavado y 4,71:1 sin él. El borde punteado ámbar ya marca la caja.
        className="ring-focus group w-full rounded-card border border-dashed border-amber-500/40 px-6 py-6 text-left transition-colors duration-150 hover:border-amber-500 hover:bg-amber-50 dark:bg-amber-500/8 dark:hover:bg-amber-500/12"
      >
        <Eyebrow>¡Te regalaron una invitación!</Eyebrow>
        <span className="mt-3 flex items-center gap-3">
          <span className="font-mono text-3xl font-bold tracking-[0.12em] text-ink-900 dark:text-bone-100">
            {code}
          </span>
          <Copy
            className="h-4 w-4 shrink-0 text-ink-500 transition-colors group-hover:text-amber-700 dark:text-bone-300 dark:group-hover:text-amber-300"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </span>
        <span className="mt-3 block text-xs text-ink-500 dark:text-bone-300">
          Tocá para copiar el código e ingresalo al registrarte
        </span>
      </button>

      {/* Espejo para el fallback de copiado. Fuera de pantalla, no enfocable. */}
      <input
        ref={mirrorRef}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
        value={code}
        className="pointer-events-none absolute left-[-9999px] h-px w-px opacity-0"
      />

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-60 flex justify-center px-6"
      >
        {/*
         * Es un toast, y estaba escrito como una píldora con `shadow-lg`: el
         * manual le da radio propio (16px) y prohíbe la sombra en las píldoras,
         * así que el elemento rompía las dos reglas a la vez.
         *
         * Con `rounded-toast` y `--shadow-card` queda en la forma que le
         * corresponde, y de paso esos dos tokens de sombra dejan de estar sin
         * usar: es la única superficie del sitio que de verdad flota por encima
         * de la página, o sea el único lugar donde una sombra dice algo.
         * Ver `docs/DECISIONES.md` §3 sexies.
         */}
        <p
          className={cn(
            "mb-8 rounded-toast bg-ink-950 px-6 py-3 text-small font-semibold text-bone-100 shadow-card transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] dark:bg-bone-100 dark:text-ink-900 dark:shadow-card-dark",
            toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
          )}
        >
          {toast ?? ""}
        </p>
      </div>
    </>
  );
}
