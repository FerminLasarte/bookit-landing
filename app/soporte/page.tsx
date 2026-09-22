import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import Eyebrow from "@/components/Eyebrow";
import Hairline from "@/components/Hairline";
import { IconInstagram } from "@/components/icons";
import { site } from "@/content/site";
import { footerLegales } from "@/content/nav";

export const metadata: Metadata = {
  title: "Soporte",
  description:
    "Cómo contactarnos por tu cuenta, la app o tus datos: email, Instagram y teléfono. Tiempos de respuesta y links a los legales de Bookit.",
  alternates: { canonical: "/soporte" },
};

const iconClasses = "mt-1 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300";

const canales = [
  {
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
    hint: "El canal principal. Respondemos en días hábiles.",
    icon: <Mail className={iconClasses} strokeWidth={1.75} aria-hidden="true" />,
  },
  {
    label: "Instagram",
    value: site.instagram.handle,
    href: site.instagram.url,
    hint: "Novedades del lanzamiento y mensajes directos.",
    icon: <IconInstagram className={iconClasses} />,
  },
  {
    label: "Teléfono",
    value: site.phone.display,
    href: site.phone.href,
    hint: "Llamadas y WhatsApp, en horario comercial.",
    icon: <Phone className={iconClasses} strokeWidth={1.75} aria-hidden="true" />,
  },
] as const;

export default function SoportePage() {
  return (
    <div className="py-16 md:py-24">
      <div className="wrap">
        <div className="md:grid md:grid-cols-12 md:gap-10">
          <header className="md:col-span-5">
            <Eyebrow>Soporte</Eyebrow>
            <h1 className="mt-6 text-display-lg font-semibold text-ink-900 dark:text-bone-100">
              Estamos del otro lado.
            </h1>
            <p className="measure mt-6 text-ink-500 dark:text-bone-300">
              Bookit todavía no lanzó, así que somos un equipo chico contestando de a un mensaje por
              vez. Escribinos y te respondemos.
            </p>
          </header>

          <div className="mt-12 md:col-span-6 md:col-start-7 md:mt-0">
            <ul className="space-y-8">
              {canales.map(({ label, value, href, hint, icon }) => (
                <li key={label}>
                  <Hairline />
                  <div className="mt-5 flex items-start gap-4">
                    {icon}
                    <div>
                      <Eyebrow>{label}</Eyebrow>
                      <a
                        href={href}
                        {...(href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="ring-focus mt-2 block rounded-pill text-h3 font-semibold text-ink-900 underline decoration-ink-900/15 underline-offset-4 transition-colors hover:decoration-amber-500 dark:text-bone-100 dark:decoration-white/20"
                      >
                        {value}
                      </a>
                      <p className="mt-2 text-small text-ink-500 dark:text-bone-300">{hint}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <section aria-labelledby="tiempos" className="mt-16">
              <Hairline />
              <h2
                id="tiempos"
                className="mt-6 text-h3 font-semibold text-ink-900 dark:text-bone-100"
              >
                Qué esperar
              </h2>
              <ul className="measure mt-4 space-y-2 text-small text-ink-500 dark:text-bone-300">
                <li>Consultas generales: hasta 3 días hábiles.</li>
                <li>
                  Pedidos sobre tus datos personales (acceso, rectificación o supresión): hasta 10
                  días corridos, como pide la {site.legal.dataProtectionLaw}.
                </li>
              </ul>
            </section>

            <section aria-labelledby="datos" className="mt-14">
              <Hairline />
              <h2 id="datos" className="mt-6 text-h3 font-semibold text-ink-900 dark:text-bone-100">
                Quiero que borren mis datos
              </h2>
              <p className="measure mt-4 text-small text-ink-500 dark:text-bone-300">
                Escribinos a {site.email} desde la misma dirección con la que te anotaste y lo
                hacemos sin costo. Los pasos completos están en{" "}
                <Link
                  href="/legal/eliminar-cuenta"
                  className="ring-focus rounded-pill font-semibold text-amber-700 underline decoration-amber-700/30 underline-offset-2 dark:text-amber-300 dark:decoration-amber-300/30"
                >
                  Eliminación de cuenta y datos
                </Link>
                .
              </p>
            </section>

            <section aria-labelledby="legales-soporte" className="mt-14">
              <Hairline />
              <h2
                id="legales-soporte"
                className="mt-6 text-h3 font-semibold text-ink-900 dark:text-bone-100"
              >
                Legales
              </h2>
              <ul className="mt-4 space-y-2">
                {footerLegales.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ring-focus rounded-pill text-small text-amber-700 underline decoration-amber-700/30 underline-offset-2 dark:text-amber-300 dark:decoration-amber-300/30"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="ring-focus rounded-pill text-small text-amber-700 underline decoration-amber-700/30 underline-offset-2 dark:text-amber-300 dark:decoration-amber-300/30"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
