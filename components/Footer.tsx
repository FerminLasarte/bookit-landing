import Link from "next/link";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import Wordmark from "./Wordmark";
import Eyebrow from "./Eyebrow";
import Hairline from "./Hairline";
import { IconInstagram } from "./icons";
import { site } from "@/content/site";
import { footerLegales, footerProducto, type NavLink as NavLinkType } from "@/content/nav";

const linkClasses =
  // El mail es un token sin espacios de 193px y a 768px su columna mide 148:
  // se salía del viewport y metía scroll horizontal. `break-words` no alcanza
  // acá — no achica el tamaño min-content, así que el ítem de flex anónimo
  // seguía sin poder encogerse. `overflow-wrap: anywhere` sí lo achica.
  "ring-focus inline-flex min-w-0 items-start gap-1.5 rounded-pill text-small [overflow-wrap:anywhere] text-bone-300 transition-colors duration-150 hover:text-bone-100";

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
 * EL PISO DE LA PÁGINA. Desde la §3 terdecies los tres lienzos de marca son
 * objetos con esquinas apoyados dentro del `wrap`, así que el footer dejó de
 * ser la segunda de dos bandas oscuras pegadas —el D10— y pasó a ser la
 * superficie sobre la que el cierre se apoya. Eso ya está resuelto y no se
 * rehace acá; lo que sigue es composición.
 *
 * ── El rótulo de columna es el del sitio ────────────────────────────────
 *
 * "Producto", "Legales" y "Contacto" eran un componente propio de 13px con
 * `font-semibold` y `tracking-[-0.01em]`, o sea la SEGUNDA etiqueta del sitio
 * para la misma intención: rotular el bloque que viene abajo. El pre-flight del
 * contrato pide una etiqueta por intención, y `Eyebrow` ya es ésa desde la
 * §3 octies. De paso arregla dos cosas que el rótulo propio hacía mal:
 *
 *   - El tracking. El manual (§4) pide 0 en texto chico, "apretar una letra
 *     chica la vuelve ilegible", y éste llevaba -0.01em. `Eyebrow` lo devuelve
 *     a 0, que es exactamente la corrección que la §3 octies ya le había hecho.
 *   - El color. Iba en `bone-300`, la misma tinta que los links de abajo, así
 *     que la jerarquía la sostenía sólo el peso. En `bone-100` (14,40:1 sobre
 *     `ink-950`) el rótulo manda sobre su columna y los links quedan debajo,
 *     que es la misma relación que el rótulo tiene con su título en el cuerpo
 *     de la página.
 *
 * Lo que NO cambia es que sigue siendo un `<p>`: fue un `<h2>` de 13px y metía
 * tres secciones falsas en el esquema del documento. El nombre accesible de
 * cada columna lo da el `aria-label` de su `<nav>`, y el de la lista de
 * contacto —que no es navegación— sale de este rótulo por `aria-labelledby`,
 * que es para lo que `Eyebrow` aprende un `id`.
 */

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    // `data-canvas`: el footer es `ink-950` en los DOS temas, así que para el
    // header es una superficie oscura más. Sin esto, al final de cualquier
    // página el nav se vestía de claro sobre el footer (1,31:1). Antes no se
    // notaba porque el header tenía una superficie crema translúcida encima.
    <footer data-canvas className="bg-ink-950 text-bone-100 [--ring-hueco:var(--color-ink-950)]">
      {/*
        EL FILETE ENTRA AL `wrap`. Era el único `Hairline` del sitio fuera de su
        caja de contenido: los tres lienzos, `#como-funciona` y `#puntos` lo
        ponen adentro, y acá iba a sangre, con lo cual su tick ámbar —que marca
        dónde empieza el contenido— colgaba en x=0, contra el borde crudo del
        viewport, a 40 px del único sitio de la página donde algo arranca.

        Y la línea ya no tiene que hacer de separador: ésa era su función cuando
        el cierre era una banda a sangre pegada al footer, que es el D10. La
        §3 terdecies lo resolvió con geometría —176 px de página y las esquinas
        de la card—, así que lo que queda es lo que el filete es en todas las
        otras piezas: la línea con la que el bloque abre.
      */}
      <div className="wrap">
        <Hairline onDark />
      </div>

      <div className="wrap py-16 md:py-20">
        {/* Grilla asimétrica 4 / 2 / 3 / 3 (§7) */}
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <Wordmark className="text-2xl" onDark />
            <p className="mt-4 max-w-[28ch] text-small text-bone-300">
              Turnos para barberías, peluquerías y estética.
            </p>
            {/* Sin el `/80`: era un sexto valor de tinta puesto a mano para una
                línea que el sitio ya resuelve con un token, y al lado de "Hecho
                en Tandil." —la misma clase de dato, a la misma escala— dejaba
                dos grises distintos sin que nada los distinguiera. Es el mismo
                arreglo que hizo `#cierre` en la §3 terdecies. El número sube de
                7,49:1 a 11,20:1. */}
            <p className="mt-6 text-small text-bone-300">{site.hq}</p>
            {/*
              Sin emoji: `docs/MARCA.md` ("Voz y tono") registra una sola
              excepción, el 🎉 de las pantallas de éxito del formulario.
              `aria-hidden` lo escondía del lector de pantalla, no de la regla.
            */}
            <p className="mt-4 text-small text-bone-300">Hecho en {site.city}.</p>
          </div>

          <nav aria-label="Producto" className="md:col-span-2">
            <Eyebrow onDark>Producto</Eyebrow>
            <ul className="mt-5 space-y-3">
              {footerProducto.map((link) => (
                <li key={link.href}>
                  <FooterLink link={link} />
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legales" className="md:col-span-3">
            <Eyebrow onDark>Legales</Eyebrow>
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
            <Eyebrow onDark id="footer-contacto">Contacto</Eyebrow>
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

        {/* La línea de abajo sale de `text-xs`. 12px es un escalón que el
            `@theme` no declara —`--text-small` es 14— o sea el default de
            Tailwind puesto a mano, y de los diez usos que `PENDIENTES.md`
            contó, `#cierre` y `#puntos` ya pasaron los suyos a `text-small`.
            Éste era el último que quedaba en la home. */}
        <div className="mt-14 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-2 text-small text-bone-300 md:flex-row md:items-center md:justify-between">
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
