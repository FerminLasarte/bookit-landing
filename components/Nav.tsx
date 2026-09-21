"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu } from "lucide-react";
import AnimatedButton from "./AnimatedButton";
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

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
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
    const onScroll = () => {
      const hero = document.querySelector("[data-hero]");
      const umbral = hero ? hero.getBoundingClientRect().height - 72 : 8;
      setScrolled(window.scrollY > umbral);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  // Cerrar el menú al navegar.
  useEffect(() => setOpen(false), [pathname]);

  /*
   * El hero de la home es un lienzo `marca-profunda` en los dos temas, y el nav
   * se le monta encima. Arriba de todo el nav se vuelve transparente y viste de
   * oscuro; apenas se scrollea vuelve a su superficie de siempre. En el resto de
   * las páginas el tope es claro, así que esto no aplica nunca.
   */
  const overDark = pathname === "/" && !scrolled;

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
          overDark ? "bg-transparent" : "bg-cream-50/80 dark:bg-ink-950/80",
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
            <AnimatedButton
              text="Sumate a la lista VIP"
              href="/lista-espera"
              size="sm"
              variant={overDark ? "glass" : "ink"}
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
            <AnimatedButton
              text="Sumate a la lista VIP"
              href="/lista-espera"
              size="lg"
              variant="primary"
              fullWidth
            />
          </div>
        </div>
      )}
    </>
  );
}
