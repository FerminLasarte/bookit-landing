"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, useMotionValueEvent, useScroll } from "motion/react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Resaltado from "@/components/ui/Resaltado";
import Wordmark from "@/components/ui/Wordmark";
import { navCta, navLinks } from "@/content/nav";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/** El ancla de la home que está en el centro de la pantalla. */
function useSeccionActiva(enHome: boolean) {
  const [activa, setActiva] = useState<string | null>(null);

  useEffect(() => {
    if (!enHome) return setActiva(null);

    const secciones = navLinks
      .map((link) => link.href.split("#")[1])
      .map((id) => id && document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiva(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    secciones.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enHome]);

  return activa;
}

export default function Nav() {
  const pathname = usePathname();
  const activa = useSeccionActiva(pathname === "/");
  const [sobre, setSobre] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const [compacto, setCompacto] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setCompacto(y > 24));
  const [abierto, setAbierto] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setAbierto(false), [pathname]);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setAbierto(false);
      toggleRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  const esActiva = (href: string) => activa !== null && href.endsWith(`#${activa}`);

  return (
    <>
      <a
        href="#contenido"
        className="ring-focus sr-only rounded-pill bg-fg px-5 py-3 text-small font-semibold text-page focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100"
      >
        Saltar al contenido
      </a>

      {/* Al scrollear, la píldora se achica y se vuelve más opaca: acompaña sin tapar. */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 px-3 transition-[padding] duration-(--duration-entrada) ease-out-cubic md:px-6",
          compacto ? "pt-2 md:pt-3" : "pt-3 md:pt-5",
        )}
      >
        <nav
          aria-label="Principal"
          className={cn(
            "mx-auto rounded-card shadow-float backdrop-blur-xl transition-[max-width,background-color] duration-(--duration-entrada) ease-out-cubic [--ring-hueco:var(--surface)]",
            compacto ? "max-w-[60rem] bg-surface/92" : "max-w-[68rem] bg-surface/80",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 pr-3 pl-5 transition-[height] duration-(--duration-entrada) ease-out-cubic",
              compacto ? "h-14" : "h-16",
            )}
          >
            <Link href="/" className="ring-focus flex min-h-11 items-center rounded-pill">
              <Wordmark className="h-8" />
            </Link>
            <Badge className="hidden sm:inline-flex">Pronto en {site.city}</Badge>

            <ul className="mx-auto hidden items-center lg:flex" onMouseLeave={() => setSobre(null)}>
              {navLinks.map((link) => (
                <li
                  key={link.href}
                  onMouseEnter={() => setSobre(link.href)}
                  onFocus={() => setSobre(link.href)}
                  onBlur={() => setSobre(null)}
                >
                  <Link
                    href={link.href}
                    aria-current={esActiva(link.href) ? "location" : undefined}
                    className={cn(
                      "ring-focus relative isolate flex min-h-10 items-center rounded-pill px-4 text-small transition-colors duration-(--duration-chico)",
                      esActiva(link.href) ? "font-semibold text-fg" : "text-muted hover:text-fg",
                    )}
                  >
                    <AnimatePresence>{sobre === link.href && <Resaltado grupo="nav-resaltado" />}</AnimatePresence>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <Button href={navCta.href} size="compact" className="ml-auto hidden lg:ml-0 lg:inline-flex">
              {navCta.label}
            </Button>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setAbierto((v) => !v)}
              aria-expanded={abierto}
              aria-controls="menu-movil"
              aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
              className="ring-focus ml-auto flex size-11 items-center justify-center rounded-pill text-fg lg:hidden"
            >
              {abierto ? (
                <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Menu className="size-5" strokeWidth={1.75} aria-hidden="true" />
              )}
            </button>
          </div>

          <div id="menu-movil" hidden={!abierto} className="border-t border-line p-3 lg:hidden">
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setAbierto(false)}
                    className="ring-focus flex min-h-12 items-center rounded-field px-3 text-title font-semibold text-fg hover:bg-fg/6"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Button href={navCta.href} className="mt-3 w-full">
              {navCta.label}
            </Button>
          </div>
        </nav>
      </header>
    </>
  );
}
