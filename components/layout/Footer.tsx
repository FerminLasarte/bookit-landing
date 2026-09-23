import type { ReactNode } from "react";
import { Mail, Phone } from "lucide-react";
import TextLink from "@/components/ui/TextLink";
import Wordmark from "@/components/ui/Wordmark";
import { IconInstagram } from "@/components/ui/icons";
import { footerLegales, footerProducto, type NavLink } from "@/content/nav";
import { site } from "@/content/site";

const ICONO = "size-3.5 shrink-0 self-center";

const contacto: readonly { href: string; label: ReactNode; icono: ReactNode }[] = [
  {
    href: `mailto:${site.email}`,
    label: site.email,
    icono: <Mail className={ICONO} strokeWidth={1.75} aria-hidden="true" />,
  },
  {
    href: site.instagram.url,
    label: `Instagram ${site.instagram.handle}`,
    icono: <IconInstagram className={ICONO} />,
  },
  {
    href: site.phone.href,
    label: <span className="num">{site.phone.display}</span>,
    icono: <Phone className={ICONO} strokeWidth={1.75} aria-hidden="true" />,
  },
];

/** Un rótulo y su lista. El rótulo le da nombre al `<nav>` o, si no es navegación, a la lista. */
function Columna({
  id,
  title,
  nav = false,
  className,
  children,
}: {
  id: string;
  title: string;
  nav?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const Root = nav ? "nav" : "div";

  return (
    <Root aria-labelledby={nav ? id : undefined} className={className}>
      <p id={id} className="text-small font-semibold text-fg">
        {title}
      </p>
      <ul aria-labelledby={nav ? undefined : id} className="mt-4 space-y-3 text-small">
        {children}
      </ul>
    </Root>
  );
}

function Links({ links }: { links: readonly NavLink[] }) {
  return links.map((link) => (
    <li key={link.href}>
      <TextLink href={link.href} tone="quiet">
        {link.label}
      </TextLink>
    </li>
  ));
}

export default function Footer() {
  return (
    <footer className="wrap">
      <div className="grid gap-12 border-t border-line py-16 md:grid-cols-12 md:gap-8 md:py-20">
        <div className="md:col-span-4">
          <Wordmark className="h-8" />
          <p className="mt-4 max-w-[28ch] text-small text-muted">
            Turnos de belleza y cuidado personal, empezando por {site.city}.
          </p>
          <p className="mt-6 text-small text-muted">{site.hq}</p>
        </div>

        <Columna nav id="footer-producto" title="Producto" className="md:col-span-2">
          <Links links={footerProducto} />
        </Columna>

        <Columna nav id="footer-legales" title="Legales" className="md:col-span-3">
          <Links links={footerLegales} />
        </Columna>

        <Columna id="footer-contacto" title="Contacto" className="md:col-span-3">
          {contacto.map((item) => (
            <li key={item.href}>
              {/* `anywhere`: el mail no tiene espacios y a 768 px no entra en su columna. */}
              <TextLink href={item.href} tone="quiet" className="min-w-0 gap-1.5 [overflow-wrap:anywhere]">
                {item.icono}
                {item.label}
              </TextLink>
            </li>
          ))}
        </Columna>
      </div>

      <div className="flex flex-col gap-2 border-t border-line py-6 text-small text-muted md:flex-row md:justify-between">
        <p>
          © <span className="num">{new Date().getFullYear()}</span> Bookit. Todos los derechos reservados.
        </p>
        <p>Datos personales tratados conforme a la Ley 25.326.</p>
      </div>
    </footer>
  );
}
