"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Superficie from "@/components/ui/Superficie";
import TextLink from "@/components/ui/TextLink";
import { IconCheck, IconInstagram } from "@/components/ui/icons";
import { categoriasFormulario } from "@/content/categorias";
import { site } from "@/content/site";
import { submittingLabel, successTitle, waitlistCopy, type Audience } from "@/content/waitlist";
import { CAMPO_DEL_ERROR, WAITLIST_ERRORS, WAITLIST_FIELD_ERRORS, pareceEmail } from "@/lib/waitlist-errors";
import { cn } from "@/lib/utils";
import AudienceSwitch from "./AudienceSwitch";
import Field, { FieldError } from "./Field";

type Status = "idle" | "submitting" | "success";

type FieldName = "userType" | "name" | "email" | "category" | "categoryOther" | "consent";

/** Campo → su mensaje. Vacío es "no hay nada mal". */
type FieldErrors = Partial<Record<FieldName, string>>;

/** El `name` de cada control, para limpiar su error en cuanto se lo corrige. */
const porNombre: Record<string, FieldName> = {
  user_type: "userType",
  name: "name",
  email: "email",
  category: "category",
  category_other: "categoryOther",
  consent: "consent",
};

/*
 * Sin asteriscos: el único campo opcional lo dice y los demás llevan
 * `required`, que es lo que anuncia un lector de pantalla. Cinco marcas ámbar
 * le competían al botón.
 */
export default function WaitlistForm({
  /** Preselección desde `?tipo=local` o `?tipo=cliente`. */
  initialAudience = null,
}: {
  initialAudience?: Audience | null;
}) {
  const [audience, setAudience] = useState<Audience | null>(initialAudience);
  /** El gancho que se ve: va un fundido atrás del `audience`. */
  const [shownAudience, setShownAudience] = useState<Audience>(initialAudience ?? "cliente");
  const [fading, setFading] = useState(false);

  const [status, setStatus] = useState<Status>("idle");
  /** Sólo lo que devuelve el servidor o la red. Lo de cada campo va en el campo. */
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [category, setCategory] = useState("");
  const mountedAt = useRef(Date.now());

  const userTypeRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const categoryOtherRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLElement>(null);

  const isLocal = audience === "local";
  const isOtherCategory = isLocal && category === "otro";
  const copy = waitlistCopy[shownAudience];

  // El gancho se apaga, cambia y vuelve. Dura lo mismo que su transición.
  useEffect(() => {
    if (!audience || audience === shownAudience) return;
    setFading(true);
    // Llega como "180ms" o, minificado, como ".18s".
    const valor = getComputedStyle(document.documentElement).getPropertyValue("--duration-chico").trim();
    const ms = parseFloat(valor) * (valor.endsWith("ms") ? 1 : 1000);
    const timer = window.setTimeout(() => {
      setShownAudience(audience);
      setFading(false);
    }, ms || 0);
    return () => window.clearTimeout(timer);
  }, [audience, shownAudience]);

  // Al pasar a cliente, la categoría deja de aplicar.
  useEffect(() => {
    if (!isLocal) setCategory("");
  }, [isLocal]);

  // El foco va a la pantalla de éxito para que un lector de pantalla la anuncie.
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  function handleInput(event: FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement | null;
    const field = target?.name ? porNombre[target.name] : undefined;
    if (!field) return;
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  function markInvalid(fields: FieldErrors) {
    setErrors(fields);
    const focusOrder: Array<[FieldName, HTMLElement | null | undefined]> = [
      ["userType", userTypeRef.current?.querySelector("input")],
      ["name", nameRef.current],
      ["email", emailRef.current],
      ["category", categoryRef.current],
      ["categoryOther", categoryOtherRef.current],
      ["consent", consentRef.current],
    ];
    for (const [field, element] of focusOrder) {
      if (fields[field] && element) {
        element.focus();
        return;
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const whatsapp = String(data.get("whatsapp") ?? "").trim();
    const categoryOther = String(data.get("category_other") ?? "").trim();
    const consent = data.get("consent") === "on";

    // El formato del correo se chequea también acá, con el mismo texto que
    // devuelve el endpoint, para no gastar un viaje en un error de tipeo.
    const failures: FieldErrors = {};
    if (!audience) failures.userType = WAITLIST_FIELD_ERRORS.userType;
    if (!name) failures.name = WAITLIST_FIELD_ERRORS.name;
    if (!email) failures.email = WAITLIST_FIELD_ERRORS.email;
    else if (!pareceEmail(email)) failures.email = WAITLIST_ERRORS.email;
    if (isLocal && !category) failures.category = WAITLIST_FIELD_ERRORS.category;
    if (isOtherCategory && !categoryOther) failures.categoryOther = WAITLIST_FIELD_ERRORS.categoryOther;
    if (!consent) failures.consent = WAITLIST_ERRORS.consent;

    if (Object.keys(failures).length > 0 || !audience) {
      setFormError(null);
      markInvalid(failures);
      return;
    }

    setErrors({});
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
      const message = error instanceof Error ? error.message : "Ocurrió un error al registrarte.";
      // Si el servidor habla de un campo, el mensaje va al campo.
      const field = CAMPO_DEL_ERROR[message];
      if (field) markInvalid({ [field]: message });
      else setFormError(message);
      setStatus("idle");
    }
  }

  if (status === "success") {
    const success = waitlistCopy[audience ?? "cliente"].success;
    return (
      <Superficie ref={successRef} tabIndex={-1} tone="surface" className="ring-focus p-8 md:p-10">
        <IconCheck className="size-9 text-accent-fg" />
        <h2 className="mt-5 text-display font-bold text-fg">{successTitle}</h2>
        <p className="mt-4 font-semibold text-fg">{success.lead}</p>
        <p className="mt-2 text-pretty text-small text-muted">{success.body}</p>
        <div className="mt-8">
          <Button href={site.instagram.url} variant="secondary">
            <IconInstagram className="size-4" />
            Seguinos en Instagram
          </Button>
        </div>
      </Superficie>
    );
  }

  return (
    <Superficie tone="surface" className="p-6 md:p-10">
      <form onSubmit={handleSubmit} onInput={handleInput} noValidate className="space-y-5">
        <div ref={userTypeRef}>
          <AudienceSwitch value={audience} onChange={setAudience} error={errors.userType} />
        </div>

        <p
          className={cn(
            "text-pretty text-muted transition-opacity duration-(--duration-chico) ease-out-cubic",
            fading && "opacity-0",
          )}
        >
          {copy.desc.before}
          <strong className="font-semibold text-fg">{copy.desc.strong}</strong>
          {copy.desc.after}
        </p>

        <Field id="wl-name" label="Nombre y apellido" error={errors.name}>
          {(props) => (
            <input
              {...props}
              ref={nameRef}
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Ej: Martín"
            />
          )}
        </Field>

        <Field id="wl-email" label="Correo electrónico" error={errors.email}>
          {(props) => (
            <input
              {...props}
              ref={emailRef}
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@correo.com"
            />
          )}
        </Field>

        <Field id="wl-whatsapp" label="WhatsApp" optional>
          {(props) => (
            <input
              {...props}
              name="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Ej: 2494..."
            />
          )}
        </Field>

        {isLocal && (
          <Field id="wl-category" label="Categoría de tu comercio" error={errors.category}>
            {(props) => (
              <select
                {...props}
                ref={categoryRef}
                name="category"
                required
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">Seleccioná una opción</option>
                {categoriasFormulario.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
        )}

        {isOtherCategory && (
          <Field id="wl-category-other" label="Contanos cuál" error={errors.categoryOther}>
            {(props) => (
              <input
                {...props}
                ref={categoryOtherRef}
                name="category_other"
                type="text"
                required
                placeholder="Ej: Depilación láser"
              />
            )}
          </Field>
        )}

        {/* Honeypot invisible: un humano nunca lo completa. */}
        <div aria-hidden="true" className="absolute size-0 overflow-hidden opacity-0">
          <label htmlFor="wl-website">No completar</label>
          <input id="wl-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="pt-1">
          <div className="flex items-start gap-3">
            <input
              ref={consentRef}
              id="wl-consent"
              name="consent"
              type="checkbox"
              required
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? "wl-consent-error" : undefined}
              className={cn(
                // 24 px: el mínimo de WCAG 2.2 para un control chico.
                "ring-focus mt-0.5 size-6 shrink-0 rounded-pill accent-accent",
                errors.consent && "outline-2 outline-danger",
              )}
            />
            <label htmlFor="wl-consent" className="text-small text-muted">
              Acepto recibir novedades de Bookit por email y/o WhatsApp, y que mis datos sean
              tratados conforme a la Ley 25.326 de Protección de Datos Personales.
            </label>
          </div>
          <FieldError id="wl-consent-error" message={errors.consent} />
        </div>

        {/* Arriba del botón: es lo próximo que se lee después de apretarlo. */}
        <p aria-live="polite" className="text-small font-medium text-danger empty:hidden">
          {formError}
        </p>

        <div className="pt-3">
          <Button type="submit" className="w-full" disabled={status === "submitting"}>
            {status === "submitting" ? submittingLabel : copy.button}
          </Button>
        </div>

        <p className="text-center text-micro text-muted">
          Al anotarte aceptás nuestros <TextLink href="/legal/terminos">Términos</TextLink> y la{" "}
          <TextLink href="/legal/privacidad">Política de Privacidad</TextLink>.
        </p>
      </form>
    </Superficie>
  );
}
