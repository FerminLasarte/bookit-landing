import Link from "next/link";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import Wordmark from "./Wordmark";
import Hairline from "./Hairline";
import { IconInstagram } from "./icons";
import { site } from "@/content/site";
import { footerLegales, footerProducto, type NavLink as NavLinkType } from "@/content/nav";

const linkClasses =
  "ring-focus inline-flex items-start gap-1.5 rounded-sm text-small text-bone-300 transition-colors duration-150 hover:text-bone-100";

function FooterLink({ link }: { link: NavLinkType }) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClasses}>
        {link.label}
        <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      </a>
    );
  }
  return (
    <Link href={link.href} className={linkClasses}>
      {link.label}
    </Link>
  );
}

function ColumnTitle({ children }: { children: string }) {
  return (
    <h2 className="text-[0.8125rem] font-semibold tracking-[-0.01em] text-bone-300">{children}</h2>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-950 text-bone-100">
      <Hairline onDark />

      <div className="wrap py-16 md:py-20">
        {/* Grilla asimétrica 4 / 2 / 3 / 3 (§7) */}
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <Wordmark className="text-2xl" onDark />
            <p className="mt-4 max-w-[28ch] text-small text-bone-300">
              Turnos para barberías, peluquerías y estética.
            </p>
            <p className="mt-6 text-small text-bone-300/80">{site.hq}</p>
            <p className="mt-4 text-small text-bone-300">
              Hecho en {site.city} <span aria-hidden="true">🧡</span>
            </p>
          </div>

          <nav aria-label="Producto" className="md:col-span-2">
            <ColumnTitle>Producto</ColumnTitle>
            <ul className="mt-5 space-y-3">
              {footerProducto.map((link) => (
                <li key={link.href}>
                  <FooterLink link={link} />
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legales" className="md:col-span-3">
            <ColumnTitle>Legales</ColumnTitle>
            <ul className="mt-5 space-y-3">
              {footerLegales.map((link) => (
                <li key={link.href}>
                  <FooterLink link={link} />
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <ColumnTitle>Contacto</ColumnTitle>
            <ul className="mt-5 space-y-3">
              <li>
                <a href={`mailto:${site.email}`} className={linkClasses}>
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClasses}
                >
                  <IconInstagram className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Instagram {site.instagram.handle}
                </a>
              </li>
              <li>
                <a href={site.phone.href} className={linkClasses}>
                  <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <span className="num">{site.phone.display}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/8 pt-6">
          <div className="flex flex-col gap-2 text-xs text-bone-300 md:flex-row md:items-center md:justify-between">
            <p>
              © <span className="num">{year}</span> Bookit. Todos los derechos reservados.
            </p>
            <p>Datos personales tratados conforme a la Ley 25.326.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
