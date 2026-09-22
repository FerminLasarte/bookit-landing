"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Button from "./Button";
import AudienceSwitch from "./AudienceSwitch";
import Field, { FieldError } from "./Field";
import { IconCheck, IconInstagram } from "./icons";
import { categoriasFormulario } from "@/content/categorias";
import { site } from "@/content/site";
import {
  CAMPO_DEL_ERROR,
  WAITLIST_ERRORS,
  WAITLIST_FIELD_ERRORS,
  pareceEmail,
} from "@/lib/waitlist-errors";
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

/** Campo → su mensaje. Vacío es "no hay nada mal". */
type FieldErrors = Partial<Record<FieldName, string>>;

/**
 * El `name` del control, para poder limpiar su error mientras se corrige.
 * Marcar un campo en rojo y dejarlo rojo hasta el próximo envío es de las
 * cosas que el manual llama gritar: el error ya se está arreglando.
 */
const porNombre: Record<string, FieldName> = {
  name: "name",
  email: "email",
  user_type: "userType",
  category: "category",
  category_other: "categoryOther",
  consent: "consent",
};

/**
 * NO HAY ASTERISCOS. Los llevaban los cinco campos obligatorios, en ámbar, y
 * el único opcional decía además "(opcional)" — o sea que la marca estaba
 * puesta dos veces y del lado que no hacía falta. Marcar el opcional alcanza
 * para WCAG 3.3.2, no deja ningún rótulo sin explicar y saca cinco acentos
 * ámbar de un formulario donde el ámbar tiene que ser el botón. El atributo
 * `required` sigue en cada control, así que un lector de pantalla lo anuncia.
 */

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
  /** Sólo lo que devuelve el servidor o la red. Lo de cada campo va en el campo. */
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

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

  /** Limpia el error de un campo en cuanto se lo toca. */
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
    const focusOrder: Array<[FieldName, HTMLElement | null]> = [
      ["name", nameRef.current],
      ["email", emailRef.current],
      ["userType", userTypeRef.current],
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

    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const whatsapp = String(data.get("whatsapp") ?? "").trim();
    const categoryOther = String(data.get("category_other") ?? "").trim();
    const consent = data.get("consent") === "on";

    /*
     * Validación propia para poder enfocar el primer campo que falló (§4.5) y,
     * ahora, para decirle a cada uno qué le pasa. El formato del correo se
     * chequea acá además del servidor: mandarlo, esperar el viaje y recibir un
     * mensaje al pie era el único error del formulario que costaba un round
     * trip, y el texto que se muestra es el mismo que devuelve el endpoint.
     */
    const failures: FieldErrors = {};
    if (!name) failures.name = WAITLIST_FIELD_ERRORS.name;
    if (!email) failures.email = WAITLIST_FIELD_ERRORS.email;
    else if (!pareceEmail(email)) failures.email = WAITLIST_ERRORS.email;
    if (!audience) failures.userType = WAITLIST_FIELD_ERRORS.userType;
    if (isLocal && !category) failures.category = WAITLIST_FIELD_ERRORS.category;
    if (isOtherCategory && !categoryOther) failures.categoryOther = WAITLIST_FIELD_ERRORS.categoryOther;
    if (!consent) failures.consent = WAITLIST_ERRORS.consent;

    if (Object.keys(failures).length > 0 || !audience) {
      // Sin resumen al pie: cada campo ya dice lo suyo, el foco va al primero
      // que falló y un `aria-live` encima lo anunciaría por duplicado.
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
      const message =
        error instanceof Error ? error.message : "Ocurrió un error al registrarte.";
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
      <div
        ref={successRef}
        tabIndex={-1}
        className="ring-focus rounded-card border border-ink-900/10 bg-paper p-8 [--ring-hueco:var(--color-paper)] dark:[--ring-hueco:var(--color-ink-800)] md:p-10 dark:border-white/10 dark:bg-ink-800"
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
    <div className="rounded-card border border-ink-900/10 bg-paper p-6 [--ring-hueco:var(--color-paper)] dark:[--ring-hueco:var(--color-ink-800)] md:p-10 dark:border-white/10 dark:bg-ink-800">
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

      <form onSubmit={handleSubmit} onInput={handleInput} noValidate className="mt-8 space-y-5">
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

        <div ref={userTypeRef} tabIndex={-1} className="ring-focus pt-1">
          <AudienceSwitch value={audience} onChange={setAudience} error={errors.userType} />
        </div>

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
        <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
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
                // 24px: el mínimo de target que pide WCAG 2.2 para un control chico.
                "ring-focus mt-0.5 h-6 w-6 shrink-0 rounded-pill accent-amber-500",
                errors.consent && "outline-2 outline-error dark:outline-error-dark",
              )}
            />
            <label
              htmlFor="wl-consent"
              className="text-xs leading-relaxed text-ink-500 dark:text-bone-300"
            >
              Acepto recibir novedades de Bookit por email y/o WhatsApp, y que mis datos sean
              tratados conforme a la Ley 25.326 de Protección de Datos Personales.
            </label>
          </div>
          <FieldError id="wl-consent-error" message={errors.consent} />
        </div>

        {/*
          El error del servidor va ARRIBA del botón, no debajo. Debajo, el único
          mensaje del formulario aparecía después del control que acababas de
          apretar, o sea fuera del orden de lectura del gesto. Y ya no reserva
          alto con `min-h-5`: como sólo carga los errores de red y de servidor,
          en el 99% de los envíos ese hueco estaba vacío.
        */}
        <p
          aria-live="polite"
          className="text-small font-medium text-error empty:hidden dark:text-error-dark"
        >
          {formError}
        </p>

        <div className="pt-3">
          <Button
            type="submit"
            fullWidth
            disabled={status === "submitting"}
            text={status === "submitting" ? submittingLabel : copy.button}
          />
        </div>

        <p className="text-center text-xs text-ink-500 dark:text-bone-300">
          Al anotarte aceptás nuestros{" "}
          <Link
            href="/legal/terminos"
            className="ring-focus rounded-pill font-semibold text-amber-700 underline decoration-amber-700/30 underline-offset-2 dark:text-amber-300 dark:decoration-amber-300/30"
          >
            Términos
          </Link>{" "}
          y la{" "}
          <Link
            href="/legal/privacidad"
            className="ring-focus rounded-pill font-semibold text-amber-700 underline decoration-amber-700/30 underline-offset-2 dark:text-amber-300 dark:decoration-amber-300/30"
          >
            Política de Privacidad
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
