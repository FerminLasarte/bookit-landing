"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Button from "./Button";
import AudienceSwitch from "./AudienceSwitch";
import { IconCheck, IconInstagram } from "./icons";
import { categoriasFormulario } from "@/content/categorias";
import { site } from "@/content/site";
import {
  submittingLabel,
  successTitle,
  waitlistCopy,
  type Audience,
} from "@/content/waitlist";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "success";

/** Campos que pueden quedar marcados como inválidos. */
type FieldName = "name" | "email" | "userType" | "category" | "categoryOther" | "consent";

const fieldClasses =
  "ring-focus min-h-11 w-full rounded-field border border-ink-900/12 bg-paper px-3.5 py-2.5 text-base text-ink-900 placeholder:text-ink-500/60 transition-colors duration-150 hover:border-ink-900/25 focus:border-amber-500 dark:border-white/12 dark:bg-ink-800 dark:text-bone-100 dark:placeholder:text-bone-300/50 dark:hover:border-white/25";

const labelClasses = "block text-small font-semibold text-ink-900 dark:text-bone-100";

// `--color-error` / `--color-error-dark` son los semánticos del manual y estaban
// sin usar mientras el formulario tiraba de los rojos de fábrica de Tailwind.
// Es el mismo "hex suelto en un componente", escrito como clase utilitaria.
const invalidClasses = "border-error dark:border-error-dark";

function Required() {
  return <span className="text-amber-700 dark:text-amber-300">*</span>;
}

export default function WaitlistForm({
  /** Preselección desde `?tipo=local`. */
  initialAudience = null,
  /**
   * `h1` en /lista-espera, donde el copy dinámico es el título de la página.
   * `p` cuando va embebido en la landing: ahí la sección ya tiene su H2 y el
   * copy funciona como bajada, sin competirle ni duplicar un heading.
   */
  headingAs = "h1",
}: {
  initialAudience?: Audience | null;
  headingAs?: "h1" | "p";
}) {
  const [audience, setAudience] = useState<Audience | null>(initialAudience);
  /** Copy que se está mostrando: va un tick atrás del `audience` por el crossfade. */
  const [shownAudience, setShownAudience] = useState<Audience>(initialAudience ?? "cliente");
  const [fading, setFading] = useState(false);

  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<Set<FieldName>>(new Set());

  const [category, setCategory] = useState("");
  const mountedAt = useRef(Date.now());

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const userTypeRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const categoryOtherRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const isLocal = audience === "local";
  const isOtherCategory = isLocal && category === "otro";
  const copy = waitlistCopy[shownAudience];
  const Heading = headingAs;
  const headingClasses =
    headingAs === "p"
      ? "font-display text-h3 font-semibold text-ink-900 dark:text-bone-100"
      : "text-display-lg font-semibold text-ink-900 dark:text-bone-100";

  // Crossfade de 150ms al cambiar de público (§6.2) — sin tocar el DOM.
  useEffect(() => {
    if (!audience || audience === shownAudience) return;
    setFading(true);
    const timer = window.setTimeout(() => {
      setShownAudience(audience);
      setFading(false);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [audience, shownAudience]);

  // Al cambiar a cliente, la categoría deja de aplicar.
  useEffect(() => {
    if (!isLocal) setCategory("");
  }, [isLocal]);

  // El foco va a la pantalla de éxito para que un lector de pantalla la anuncie.
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  function markInvalid(fields: FieldName[]) {
    setInvalid(new Set(fields));
    const focusOrder: Array<[FieldName, HTMLElement | null]> = [
      ["name", nameRef.current],
      ["email", emailRef.current],
      ["userType", userTypeRef.current],
      ["category", categoryRef.current],
      ["categoryOther", categoryOtherRef.current],
      ["consent", consentRef.current],
    ];
    for (const [field, element] of focusOrder) {
      if (fields.includes(field) && element) {
        element.focus();
        return;
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const whatsapp = String(data.get("whatsapp") ?? "").trim();
    const categoryOther = String(data.get("category_other") ?? "").trim();
    const consent = data.get("consent") === "on";

    // Validación propia para poder enfocar el primer campo con error (§4.5).
    const failures: FieldName[] = [];
    if (!name) failures.push("name");
    if (!email) failures.push("email");
    if (!audience) failures.push("userType");
    if (isLocal && !category) failures.push("category");
    if (isOtherCategory && !categoryOther) failures.push("categoryOther");
    if (!consent) failures.push("consent");

    if (failures.length > 0 || !audience) {
      setFormError("Revisá los campos marcados para continuar.");
      markInvalid(failures);
      return;
    }

    setInvalid(new Set());
    setFormError(null);
    setStatus("submitting");

    const payload = {
      name,
      email,
      whatsapp: whatsapp || undefined,
      user_type: audience,
      ...(isLocal ? { category: isOtherCategory ? categoryOther : category } : {}),
      consent,
      // Antispam: honeypot invisible + tiempo de llenado.
      website: String(data.get("website") ?? ""),
      elapsedMs: Date.now() - mountedAt.current,
    };

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof result === "object" && result !== null && "error" in result
            ? String((result as { error: unknown }).error)
            : "Ocurrió un error al registrarte.";
        throw new Error(message);
      }

      setStatus("success");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Ocurrió un error al registrarte.");
      setStatus("idle");
    }
  }

  if (status === "success") {
    const success = waitlistCopy[audience ?? "cliente"].success;
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="ring-focus rounded-card border border-ink-900/10 bg-paper p-8 md:p-10 dark:border-white/10 dark:bg-ink-800"
      >
        <IconCheck className="h-9 w-9 text-amber-500" />
        {/* Mismo nivel de heading que el título que reemplaza. */}
        <Heading className="mt-5 font-display text-display-lg font-semibold text-ink-900 dark:text-bone-100">
          {successTitle}
        </Heading>
        <p className="mt-4 font-medium text-ink-900 dark:text-bone-100">{success.lead}</p>
        <p className="measure mt-2 text-small text-ink-500 dark:text-bone-300">{success.body}</p>
        <div className="mt-8">
          <Button
            text="Seguinos en Instagram"
            href={site.instagram.url}
            variant="secondary"
            icon={<IconInstagram className="h-4 w-4" />}
          />
        </div>
      </div>
    );
  }

  return (
    /*
     * Card, y de las tres que quedan en el sitio. El criterio está en
     * `docs/DECISIONES.md` §3 sexies: es card lo que se toma —se completa, se
     * copia o se compara con lo de al lado—, no lo que sólo se lee. Un
     * formulario se completa.
     *
     * Filo de borde y no de sombra: medido, en claro las dos opciones dan el
     * mismo 1,208:1, y en oscuro `--shadow-card-dark` da 1,064:1, menos que el
     * propio relleno de la card (1,157:1). Una regla que funciona en un tema y
     * no en el otro no es la regla.
     */
    <div className="rounded-card border border-ink-900/10 bg-paper p-6 md:p-10 dark:border-white/10 dark:bg-ink-800">
      <div
        className={cn(
          "transition-opacity duration-150 motion-reduce:transition-none",
          fading ? "opacity-0" : "opacity-100",
        )}
      >
        <Heading className={headingClasses}>{copy.title}</Heading>
        <p className="measure mt-4 text-ink-500 dark:text-bone-300">
          {copy.desc.before}
          <strong className="font-semibold text-ink-900 dark:text-bone-100">
            {copy.desc.strong}
          </strong>
          {copy.desc.after}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <div>
          <label htmlFor="wl-name" className={labelClasses}>
            Nombre y apellido <Required />
          </label>
          <input
            ref={nameRef}
            id="wl-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Ej: Martín"
            aria-invalid={invalid.has("name") || undefined}
            className={cn(fieldClasses, "mt-2", invalid.has("name") && invalidClasses)}
          />
        </div>

        <div>
          <label htmlFor="wl-email" className={labelClasses}>
            Correo electrónico <Required />
          </label>
          <input
            ref={emailRef}
            id="wl-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@correo.com"
            aria-invalid={invalid.has("email") || undefined}
            className={cn(fieldClasses, "mt-2", invalid.has("email") && invalidClasses)}
          />
        </div>

        <div>
          <label htmlFor="wl-whatsapp" className={labelClasses}>
            WhatsApp{" "}
            <span className="font-normal text-ink-500 dark:text-bone-300">(opcional)</span>
          </label>
          <input
            id="wl-whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Ej: 2494..."
            className={cn(fieldClasses, "mt-2")}
          />
        </div>

        <div ref={userTypeRef} tabIndex={-1} className="ring-focus pt-1">
          <AudienceSwitch value={audience} onChange={setAudience} />
        </div>

        {isLocal && (
          <div>
            <label htmlFor="wl-category" className={labelClasses}>
              Categoría de tu comercio <Required />
            </label>
            <select
              ref={categoryRef}
              id="wl-category"
              name="category"
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-invalid={invalid.has("category") || undefined}
              className={cn(fieldClasses, "mt-2", invalid.has("category") && invalidClasses)}
            >
              <option value="">Seleccioná una opción</option>
              {categoriasFormulario.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {isOtherCategory && (
          <div>
            <label htmlFor="wl-category-other" className={labelClasses}>
              Contanos cuál <Required />
            </label>
            <input
              ref={categoryOtherRef}
              id="wl-category-other"
              name="category_other"
              type="text"
              required
              placeholder="Ej: Depilación láser"
              aria-invalid={invalid.has("categoryOther") || undefined}
              className={cn(
                fieldClasses,
                "mt-2",
                invalid.has("categoryOther") && invalidClasses,
              )}
            />
          </div>
        )}

        {/* Honeypot invisible: un humano nunca lo completa. */}
        <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
          <label htmlFor="wl-website">No completar</label>
          <input id="wl-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex items-start gap-3 pt-1">
          <input
            ref={consentRef}
            id="wl-consent"
            name="consent"
            type="checkbox"
            required
            aria-invalid={invalid.has("consent") || undefined}
            className={cn(
              // 24px: el mínimo de target que pide WCAG 2.2 para un control chico.
              "ring-focus mt-0.5 h-6 w-6 shrink-0 rounded-sm accent-amber-500",
              invalid.has("consent") && "outline-2 outline-error dark:outline-error-dark",
            )}
          />
          <label
            htmlFor="wl-consent"
            className="text-xs leading-relaxed text-ink-500 dark:text-bone-300"
          >
            Acepto recibir novedades de Bookit por email y/o WhatsApp, y que mis datos sean tratados
            conforme a la Ley 25.326 de Protección de Datos Personales. <Required />
          </label>
        </div>

        <div className="pt-3">
          <Button
            type="submit"
            fullWidth
            disabled={status === "submitting"}
            text={status === "submitting" ? submittingLabel : copy.button}
          />
        </div>

        <p aria-live="polite" className="min-h-5 text-center text-small font-semibold text-error dark:text-error-dark">
          {formError}
        </p>

        <p className="text-center text-xs text-ink-500 dark:text-bone-300">
          Al anotarte aceptás nuestros{" "}
          <Link
            href="/legal/terminos"
            className="ring-focus rounded-sm font-semibold text-amber-700 underline decoration-amber-700/30 underline-offset-2 dark:text-amber-300 dark:decoration-amber-300/30"
          >
            Términos
          </Link>{" "}
          y la{" "}
          <Link
            href="/legal/privacidad"
            className="ring-focus rounded-sm font-semibold text-amber-700 underline decoration-amber-700/30 underline-offset-2 dark:text-amber-300 dark:decoration-amber-300/30"
          >
            Política de Privacidad
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
