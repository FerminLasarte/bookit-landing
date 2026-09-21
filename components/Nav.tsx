"use client";

import { useEffect, useState } from "react";
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

  // El hairline inferior aparece recién cuando se scrollea.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cerrar el menú al navegar.
  useEffect(() => setOpen(false), [pathname]);

  /*
   * El hero de la home es un lienzo `marca-profunda` en los dos temas, y el nav
   * se le monta encima. Arriba de todo el nav se vuelve transparente y viste de
   * oscuro; apenas se scrollea vuelve a su superficie de siempre. En el resto de
   * las páginas el tope es claro, así que esto no aplica nunca.
   */
  const overDark = pathname === "/" && !scrolled;

  // Con el menú abierto: sin scroll de fondo y Esc cierra.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
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
                  className={cn(
                    "ring-focus rounded-sm text-small font-medium transition-colors duration-150",
                    overDark
                      ? "text-bone-300 hover:text-bone-100"
                      : "text-ink-500 hover:text-ink-900 dark:text-bone-300 dark:hover:text-bone-100",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <AnimatedButton
              text="Sumate a la lista"
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
              text="Sumate a la lista"
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
