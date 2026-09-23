"use client";

import { useEffect, useRef, useState } from "react";
import { Copy } from "lucide-react";
import Superficie from "@/components/ui/Superficie";
import { invite } from "@/content/paginas";
import { cn } from "@/lib/utils";

const { codigo: copy } = invite;

/**
 * Tocar copia el código y muestra un toast 2,5 s. Sin `navigator.clipboard`
 * (http, navegador viejo) selecciona el código en un input espejo para que el
 * copiado manual funcione.
 *
 * Sin `aria-label`: el nombre accesible sale del contenido y así siempre
 * contiene el texto visible (WCAG 2.5.3) y el código.
 */
export default function ReferralCode({ code }: { code: string }) {
  const [toast, setToast] = useState<string | null>(null);
  const mirrorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function copyCode() {
    try {
      if (!navigator.clipboard) throw new Error("clipboard no disponible");
      await navigator.clipboard.writeText(code);
      setToast(copy.copiado);
    } catch {
      mirrorRef.current?.select();
      mirrorRef.current?.setSelectionRange(0, code.length);
      setToast(copy.manual);
    }
  }

  return (
    <>
      <Superficie
        as="button"
        tone="surface"
        onClick={copyCode}
        className="ring-focus group w-full px-6 py-7 transition-colors duration-(--duration-chico) hover:border-fg/25"
      >
        <span className="block text-small font-semibold text-fg">{copy.rotulo}</span>
        <span className="mt-3 flex items-center justify-center gap-3">
          <span className="font-mono text-title font-bold tracking-[0.12em] break-all text-fg">{code}</span>
          <Copy
            className="size-4 shrink-0 text-muted transition-colors group-hover:text-fg"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </span>
        <span className="mt-3 block text-micro text-muted">{copy.ayuda}</span>
      </Superficie>

      <input
        ref={mirrorRef}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
        value={code}
        className="pointer-events-none absolute -left-[9999px] size-px opacity-0"
      />

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-60 flex justify-center px-6">
        <p
          className={cn(
            "mb-8 rounded-toast bg-fg px-6 py-3 text-small font-semibold text-page shadow-float",
            "transition-[opacity,translate] duration-(--duration-entrada) ease-out-cubic",
            toast ? "opacity-100" : "translate-y-4 opacity-0",
          )}
        >
          {toast ?? ""}
        </p>
      </div>
    </>
  );
}
