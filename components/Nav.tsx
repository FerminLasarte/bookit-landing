"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu } from "lucide-react";
import AnimatedButton from "./AnimatedButton";
import Wordmark from "./Wordmark";
import { navLinks } from "@/content/nav";
import { cn } from "@/lib/utils";

/**
 * Ícono + wordmark. El PNG tiene fondo papel claro: en dark mode el header
 * pasa a ink-900 y esa placa clara quedaría flotando, así que el ícono
 * solo se muestra en light y el wordmark (que sí es dark-aware) queda solo.
 */
function Logo({ className = "" }: { className?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Image
        src="/brand/icon.jpeg"
        alt=""
        width={28}
        height={28}
        className="rounded-[0.4rem] dark:hidden"
        priority
      />
      <Wordmark className={className} />
    </span>
  );
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
        className="ring-focus sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:flex focus:min-h-11 focus:items-center focus:rounded-pill focus:bg-ink-900 focus:px-5 focus:text-small focus:font-semibold focus:text-bone-100"
      >
        Saltar al contenido
      </a>

      <header
        className={cn(
          "sticky top-0 z-50 bg-cream-50/80 backdrop-blur-md transition-colors duration-300 dark:bg-ink-900/80",
          scrolled ? "border-b border-ink-900/8 dark:border-white/8" : "border-b border-transparent",
        )}
      >
        <nav aria-label="Principal" className="wrap flex h-18 items-center justify-between gap-8">
          {/* Sin `aria-label`: el nombre accesible sale del wordmark ("Bookit"),
              así el texto visible y el nombre accesible coinciden. */}
          <Link href="/" className="ring-focus flex min-h-11 items-center rounded-sm">
            <Logo className="text-xl" />
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="ring-focus rounded-sm text-small font-medium text-ink-500 transition-colors duration-150 hover:text-ink-900 dark:text-bone-300 dark:hover:text-bone-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <AnimatedButton text="Sumate a la lista" href="/lista-espera" size="sm" variant="ink" />
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={open}
            className="ring-focus -mr-2 flex h-11 w-11 items-center justify-center rounded-pill text-ink-900 md:hidden dark:text-bone-100"
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
          className="fixed inset-0 z-90 flex flex-col bg-cream-50 md:hidden dark:bg-ink-900"
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
