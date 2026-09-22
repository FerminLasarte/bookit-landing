import Link from "next/link";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import Wordmark from "./Wordmark";
import Hairline from "./Hairline";
import { IconInstagram } from "./icons";
import { site } from "@/content/site";
import { footerLegales, footerProducto, type NavLink as NavLinkType } from "@/content/nav";

const linkClasses =
  // El mail es un token sin espacios de 193px y a 768px su columna mide 148:
  // se salía del viewport y metía scroll horizontal. `break-words` no alcanza
  // acá — no achica el tamaño min-content, así que el ítem de flex anónimo
  // seguía sin poder encogerse. `overflow-wrap: anywhere` sí lo achica.
  "ring-focus inline-flex min-w-0 items-start gap-1.5 rounded-sm text-small [overflow-wrap:anywhere] text-bone-300 transition-colors duration-150 hover:text-bone-100";

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

/*
 * Rótulo de columna, no encabezado de sección. Era un `<h2>` de 13px, así que
 * "Producto", "Legales" y "Contacto" entraban al esquema del documento al mismo
 * nivel que los títulos reales de la página — un lector de pantalla los
 * anunciaba como tres secciones más de contenido. El nombre accesible de cada
 * columna ya lo da el `aria-label` de su `<nav>`.
 */
function ColumnTitle({ children, id }: { children: string; id?: string }) {
  return (
    <p id={id} className="text-[0.8125rem] font-semibold tracking-[-0.01em] text-bone-300">
      {children}
    </p>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    // `data-canvas`: el footer es `ink-950` en los DOS temas, así que para el
    // header es una superficie oscura más. Sin esto, al final de cualquier
    // página el nav se vestía de claro sobre el footer (1,31:1). Antes no se
    // notaba porque el header tenía una superficie crema translúcida encima.
    <footer data-canvas className="bg-ink-950 text-bone-100">
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
            {/*
              Sin emoji: `docs/MARCA.md` ("Voz y tono") registra una sola
              excepción, el 🎉 de las pantallas de éxito del formulario.
              `aria-hidden` lo escondía del lector de pantalla, no de la regla.
            */}
            <p className="mt-4 text-small text-bone-300">Hecho en {site.city}.</p>
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

          {/* Sin `<nav>`: son datos de contacto, no navegación. El nombre
              accesible de la lista sale del rótulo, vía `aria-labelledby`. */}
          <div className="md:col-span-3">
            <ColumnTitle id="footer-contacto">Contacto</ColumnTitle>
            <ul aria-labelledby="footer-contacto" className="mt-5 space-y-3">
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
