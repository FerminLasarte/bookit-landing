"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu } from "lucide-react";
import Button from "./Button";
import Wordmark from "./Wordmark";
import { navLinks } from "@/content/nav";
import { cn } from "@/lib/utils";

/*
 * El lockup, solo. Antes acá iban el PNG del isotipo y el wordmark
 * tipográfico al lado; el lockup ya trae el isotipo adentro, así que ponerlo
 * de nuevo al costado era dibujar la marca dos veces. El manual §2 sólo
 * admite el wordmark suelto cuando el isotipo ya está presente en la pieza,
 * que no es el caso de un nav.
 */
function Logo({ className = "", onDark = false }: { className?: string; onDark?: boolean }) {
  return <Wordmark className={className} onDark={onDark} />;
}

/*
 * ══ El header ═══════════════════════════════════════════════════════════
 *
 * La barra no tiene superficie. Los links sí: viajan dentro de una píldora con
 * relleno propio, así que su contraste no depende de lo que pase por detrás.
 *
 * Eso es lo que destraba el problema, y conviene dejar escrito cuál era, porque
 * la solución obvia —un solo color de texto sobre una barra transparente— no
 * funciona y alguien va a querer intentarla de nuevo. Con la barra transparente
 * el fondo detrás del header puede estar PARTIDO: la mitad oscura de la card de
 * `#publico` (`ink-950`) cruza la banda durante ~680px de scroll y deja claro a
 * la izquierda y oscuro a la derecha. Medido, con el vestido claro "Puntos" y
 * "Soporte" quedan en 1,31:1, y dándolo vuelta los dos links de la izquierda
 * quedan en 1,61:1 sobre la mitad clara. No hay color único que sirva, porque
 * el problema no es CUÁNDO cambia el vestido sino que hay dos fondos a la vez.
 *
 * Con la píldora, los links dan siempre lo mismo:
 *   claro   `ink-900` sobre `paper`    14,68:1
 *   oscuro  `bone-300` sobre `ink-800`  9,68:1
 *
 * Lo ÚNICO que todavía cambia de vestido es el lockup, que va suelto a la
 * izquierda. Es seguro porque ahí nunca hay fondo partido: la mitad oscura de
 * `Audiences` arranca en el medio del `wrap`, y todo lo demás que pasa por
 * detrás —el hero, `#puntos`, `#cierre` y el footer— ocupa el ancho entero.
 *   con lienzo  `bone-100` sobre `marca-profunda`  14,91:1
 *   sin lienzo  `ink-900` sobre `cream-50`         14,29:1
 *
 * Y el hero ya no se mete debajo del header: es un lienzo con esquinas, apoyado
 * dentro del `wrap`. Por eso en reposo el nav está sobre la página y no sobre
 * el negro, que es de donde salía la banda crema que había que dibujar antes.
 */

const BANDA = 72; // alto del header: `h-18`

export default function Nav() {
  const [overDark, setOverDark] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  /*
   * ¿Hay un lienzo detrás del header? Se pregunta con un `IntersectionObserver`
   * cuya raíz es una franja de 72px pegada arriba: si algún `[data-canvas]` la
   * toca, hay lienzo. El navegador lo resuelve solo, fuera del hilo principal,
   * así que no hay `getBoundingClientRect` por cuadro ni loop de scroll.
   *
   * La franja se arma con `rootMargin`, que necesita píxeles, así que el
   * observer se rehace cuando cambia el alto del viewport.
   */
  useEffect(() => {
    const lienzos = Array.from(document.querySelectorAll("[data-canvas]"));
    if (!lienzos.length) {
      setOverDark(false);
      return;
    }

    let obs: IntersectionObserver | null = null;
    const encima = new Set<Element>();

    const armar = () => {
      obs?.disconnect();
      encima.clear();
      obs = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) encima.add(e.target);
            else encima.delete(e.target);
          }
          setOverDark(encima.size > 0);
        },
        { rootMargin: `0px 0px ${BANDA - window.innerHeight}px 0px`, threshold: 0 },
      );
      lienzos.forEach((el) => obs!.observe(el));
    };

    armar();
    window.addEventListener("resize", armar);
    return () => {
      obs?.disconnect();
      window.removeEventListener("resize", armar);
    };
  }, [pathname]);

  // Cerrar el menú al navegar.
  useEffect(() => setOpen(false), [pathname]);

  /*
   * Scrollspy. Cuatro anclas sobre una página de ~8.000px y ninguna señal de
   * dónde estás. No anima nada: sólo marca el link de la sección visible.
   */
  const [activa, setActiva] = useState<string | null>(null);
  useEffect(() => {
    if (pathname !== "/") return;
    const ids = navLinks
      .map((l) => l.href.split("#")[1])
      .filter((x): x is string => Boolean(x));
    const nodos = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!nodos.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiva(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    nodos.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [pathname]);

  const menuRef = useRef<HTMLDivElement>(null);

  /*
   * Con el menú abierto: sin scroll de fondo, Esc cierra, y el foco queda
   * adentro. Declaraba `aria-modal="true"` pero el tabulador seguía caminando
   * hacia la página de atrás: para quien navega con teclado o lector de
   * pantalla, el menú decía ser modal y no lo era.
   */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focosDe = () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const focos = focosDe();
      if (!focos.length) return;
      const primero = focos[0]!;
      const ultimo = focos[focos.length - 1]!;
      const actual = document.activeElement;
      if (e.shiftKey && (actual === primero || !menuRef.current?.contains(actual))) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && actual === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <a
        href="#contenido"
        className="ring-focus sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:flex focus:min-h-11 focus:items-center focus:rounded-pill focus:bg-ink-950 focus:px-5 focus:text-small focus:font-semibold focus:text-bone-100"
      >
        Saltar al contenido
      </a>

      {/*
        Transparente. Sin superficie, sin `backdrop-blur` y sin filete al
        scrollear: lo único que hace el header es cambiar el color de su
        contenido cuando entra o sale de un lienzo, con el fundido de 300ms de
        la tabla de Movimiento.
      */}
      <header className="sticky top-0 z-50 bg-transparent">
        <nav aria-label="Principal" className="wrap flex h-18 items-center justify-between gap-8">
          {/* Sin `aria-label`: el nombre accesible sale del wordmark ("Bookit"),
              así el texto visible y el nombre accesible coinciden. */}
          <Link href="/" className="ring-focus flex min-h-11 items-center rounded-pill transition-colors duration-300">
            <Logo className="text-xl" onDark={overDark} />
          </Link>

          {/*
            La píldora. Relleno + borde al 10% — el borde ACOMPAÑA a un relleno,
            así que le corresponde el 10% del manual y no el 3:1 de un borde que
            sostiene solo un control (Divergencia 6). Sin sombra: es una píldora.
          */}
          <ul className="hidden items-center gap-1 rounded-pill border border-ink-900/10 bg-paper p-1.5 md:flex dark:border-white/10 dark:bg-ink-800">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={
                    activa && link.href.endsWith(`#${activa}`) ? "location" : undefined
                  }
                  className={cn(
                    // Sin `overDark`: el link está sobre la píldora, no sobre la
                    // página, así que su contraste es el mismo en toda la ruta.
                    "ring-focus flex min-h-9 items-center rounded-pill px-3.5 text-small transition-colors duration-150",
                    "text-ink-900 hover:bg-ink-900/5 dark:text-bone-300 dark:hover:bg-white/8 dark:hover:text-bone-100",
                    // La sección en la que estás, marcada con el peso y no sólo
                    // con el color: el manual pide que el color nunca sea el
                    // único portador de un dato.
                    activa && link.href.endsWith(`#${activa}`)
                      ? "font-bold dark:text-bone-100"
                      : "font-medium",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            {/* Misma etiqueta que los CTA del cuerpo: eran dos nombres para
                la misma acción. El destino queda neutro a propósito — desde el
                nav no sabemos de qué lado del mostrador está quien hace clic. */}
            <Button
              text="Sumate a la lista VIP"
              href="/lista-espera"
              size="compact"
              variant="secondary"
              onDark={overDark}
            />
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={open}
            className={cn(
              "ring-focus -mr-2 flex h-11 w-11 items-center justify-center rounded-pill transition-colors duration-300 md:hidden",
              overDark ? "text-bone-100" : "text-ink-900 dark:text-bone-100",
            )}
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </nav>
      </header>

      {/* Menú mobile full-screen: links en display-lg, mucho aire (§6.1) */}
      {open && (
        <div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          className="fixed inset-0 z-90 flex flex-col bg-cream-50 md:hidden dark:bg-ink-950"
        >
          <div className="wrap flex h-18 shrink-0 items-center justify-between">
            <Logo className="text-xl" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              autoFocus
              className="ring-focus -mr-2 flex h-11 w-11 items-center justify-center rounded-pill text-ink-900 dark:text-bone-100"
            >
              <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>

          <div className="wrap flex flex-1 flex-col justify-center gap-10 pb-20">
            <ul className="space-y-6">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="ring-focus block rounded-pill font-display text-display-lg font-semibold text-ink-900 dark:text-bone-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Button
              text="Sumate a la lista VIP"
              href="/lista-espera"
              fullWidth
            />
          </div>
        </div>
      )}
    </>
  );
}
