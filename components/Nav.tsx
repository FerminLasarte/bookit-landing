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
 * ══ El fondo que tiene el header detrás ═════════════════════════════════
 *
 * D1 de la auditoría. El predicado anterior preguntaba si ALGÚN `[data-canvas]`
 * tocaba la banda de 72px del header, y con eso vestía de oscuro sobre un
 * header transparente. Dos cosas fallaban.
 *
 * Una, "tocar" no es "estar detrás": con el lienzo cubriendo sólo la franja de
 * arriba de la banda, el contenido claro del header caía sobre página clara y
 * daba 1,61:1 en los links y 1,25:1 en el lockup.
 *
 * Dos, y más grave, los tres lienzos no terminan donde termina su rectángulo:
 *   · el hero se disuelve con un degradé de salida propio de 160px (112 si el
 *     viewport es bajo),
 *   · `#puntos` lleva una máscara `fade-y` de 96px ARRIBA Y ABAJO, sólo en
 *     claro (en oscuro vale 0),
 *   · `#cierre` sí corta neto.
 * Medir el rectángulo daba "hay lienzo" cuando el negro ya se había ido.
 *
 * Y hay un tercer problema que ningún umbral arregla: entre el 28% y el 84% del
 * degradé del hero —unos 90px de scroll— NINGÚN vestido pasa AA. El oscuro cae
 * a 4,04:1 y el claro todavía está en 3,52:1, porque el header claro es
 * `cream-50/80` y lo que pasa por detrás le arrastra el contraste. Con 80% de
 * opacidad sobre `marca-profunda` compone #CDCCCB y deja `ink-500` en 3,02:1;
 * haría falta 98% para llegar a 4,5:1.
 *
 * Por eso son TRES estados y no dos:
 *
 *   `lienzo`  el lienzo cubre la barra entera y con negro pleno. Header
 *             transparente y vestido oscuro: `bone-300` da 11,60:1.
 *   `borde`   hay lienzo pero no cubre todo, o está en su degradé. Header con
 *             superficie OPACA: el contraste deja de depender del fondo y
 *             `ink-500` da 4,71:1 garantizado. Es el estado que faltaba.
 *   `pagina`  no hay lienzo cerca. Header translúcido como siempre; sobre
 *             cualquier superficie clara el 80% compone bien.
 *
 * El vestido oscuro del tema oscuro nunca estuvo roto (`ink-950/80` da 6,09:1
 * hasta sobre `cream-50`), así que sólo cambia lo que hacía falta.
 */
type Fondo = "lienzo" | "borde" | "pagina";

const BANDA = 72; // alto del header: `h-18`

/*
 * Tolerancia de redondeo. El header mide 72,5px reales y el hero lo compensa
 * con `-mt-18` (72px exactos), así que arriba de todo el lienzo arranca medio
 * píxel POR DEBAJO del tope y `arriba <= 0` fallaba: la portada entera —el
 * cuadro más visible del sitio— se vestía de `borde` y aparecía una banda
 * crema sobre el hero. No es un margen de diseño, es el redondeo del layout.
 */
const EPS = 2;

const fondoClasses: Record<Fondo, string> = {
  lienzo: "bg-transparent",
  borde: "bg-cream-50 dark:bg-ink-950",
  pagina: "bg-cream-50/80 dark:bg-ink-950/80",
};

/** `6rem` y `96px` a número de píxeles. `--fade-y` se escribe en rem acá. */
function aPx(valor: string): number {
  const n = parseFloat(valor);
  if (!n) return 0;
  return valor.trim().endsWith("rem")
    ? n * parseFloat(getComputedStyle(document.documentElement).fontSize)
    : n;
}

/**
 * Dónde termina de verdad el negro de un lienzo. Se mide en vivo en vez de
 * anotar números a mano, y con eso sale gratis que `#puntos` no tenga fade en
 * oscuro y que el degradé del hero cambie de alto según el viewport.
 */
function negroPleno(el: Element): { arriba: number; abajo: number } {
  const r = el.getBoundingClientRect();

  /*
   * El `--fade-y` sólo cuenta si la máscara está puesta de verdad. `Section`
   * escribe la variable en las tres tonalidades pero aplica la utilidad
   * `fade-y` únicamente cuando NO es lienzo, así que leer la variable a secas
   * le restaba 128px a `#cierre`, que corta neto.
   */
  const capa = el.querySelector<HTMLElement>("[data-canvas-capa]");
  let fade = 0;
  if (capa) {
    const cs = getComputedStyle(capa);
    const mascara = cs.maskImage || cs.webkitMaskImage;
    if (mascara && mascara !== "none") fade = aPx(cs.getPropertyValue("--fade-y"));
  }

  const salida = el.querySelector<HTMLElement>("[data-canvas-salida]");
  const alturaSalida = salida ? salida.getBoundingClientRect().height : 0;

  return {
    arriba: r.top + fade,
    abajo: r.bottom - Math.max(fade, alturaSalida),
  };
}

function fondoDetras(): Fondo {
  let toca = false;
  for (const el of document.querySelectorAll("[data-canvas]")) {
    const r = el.getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= BANDA) continue;
    toca = true;
    const { arriba, abajo } = negroPleno(el);
    if (arriba <= EPS && abajo >= BANDA - EPS) return "lienzo";
  }
  return toca ? "borde" : "pagina";
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [fondo, setFondo] = useState<Fondo>("pagina");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  /*
   * El nav cambia de superficie cuando deja de tener el hero detrás, no a los
   * 8px. Con el umbral viejo, en la home se volvía `cream-50/80` con blur
   * mientras todavía estaba sobre el lienzo negro: quedaba una banda lechosa
   * con el contenido de atrás emborronado. En el resto de las páginas, donde
   * no hay hero oscuro, sigue siendo el gesto mínimo de siempre.
   */
  useEffect(() => {
    let pendiente = 0;

    const medir = () => {
      pendiente = 0;
      const hero = document.querySelector("[data-hero]");
      const umbral = hero ? hero.getBoundingClientRect().height - BANDA : 8;
      setScrolled(window.scrollY > umbral);
      setFondo(fondoDetras());
    };

    /*
     * Por cuadro, no por evento: `medir` hace varios `getBoundingClientRect`,
     * que fuerzan layout. React igual descarta el render cuando el valor no
     * cambió, así que lo caro es la medición, no el estado.
     */
    const onScroll = () => {
      if (pendiente) return;
      pendiente = requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (pendiente) cancelAnimationFrame(pendiente);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  // Cerrar el menú al navegar.
  useEffect(() => setOpen(false), [pathname]);

  /*
   * Viste de oscuro sólo cuando el lienzo cubre la barra ENTERA. En el borde
   * de un lienzo el header se apoya en su propia superficie opaca, así que el
   * contraste deja de depender de lo que pase por detrás.
   */
  const overDark = fondo === "lienzo";

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

      <header
        className={cn(
          "sticky top-0 z-50 backdrop-blur-md transition-colors duration-300",
          fondoClasses[fondo],
          scrolled ? "border-b border-ink-900/8 dark:border-white/8" : "border-b border-transparent",
        )}
      >
        <nav aria-label="Principal" className="wrap flex h-18 items-center justify-between gap-8">
          {/* Sin `aria-label`: el nombre accesible sale del wordmark ("Bookit"),
              así el texto visible y el nombre accesible coinciden. */}
          <Link href="/" className="ring-focus flex min-h-11 items-center rounded-sm">
            <Logo className="text-xl" onDark={overDark} />
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={
                    activa && link.href.endsWith(`#${activa}`) ? "location" : undefined
                  }
                  className={cn(
                    "ring-focus rounded-sm text-small font-medium transition-colors duration-150",
                    overDark
                      ? "text-bone-300 hover:text-bone-100"
                      : "text-ink-500 hover:text-ink-900 dark:text-bone-300 dark:hover:text-bone-100",
                    // La sección en la que estás: color pleno, no un subrayado.
                    activa &&
                      link.href.endsWith(`#${activa}`) &&
                      (overDark ? "text-bone-100" : "text-ink-900 dark:text-bone-100"),
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
              "ring-focus -mr-2 flex h-11 w-11 items-center justify-center rounded-pill md:hidden",
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
                    className="ring-focus block rounded-sm font-display text-display-lg font-semibold text-ink-900 dark:text-bone-100"
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
