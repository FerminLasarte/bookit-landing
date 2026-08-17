import { z } from "zod";

/**
 * Mensajes de error del endpoint. Los seis primeros son contrato: ya circulan
 * en producción y el formulario los muestra tal cual. NO cambiar el texto.
 */
export const WAITLIST_ERRORS = {
  method: "Método no permitido",
  missing: "Faltan datos obligatorios.",
  consent: "Es necesario aceptar recibir novedades para continuar.",
  category: "Contanos la categoría de tu comercio.",
  duplicate: "Este correo ya está en la lista VIP.",
  unexpected: "Hubo un error al procesar tu solicitud. Intentá de nuevo.",
  // Agregados en la migración (endurecen sin romper los de arriba):
  email: "Revisá el correo electrónico: no parece válido.",
  rateLimit: "Probá de nuevo en un minuto.",
} as const;

export const userTypes = ["cliente", "local"] as const;
export type UserType = (typeof userTypes)[number];

/** Lo que efectivamente se guarda, ya normalizado. */
export const waitlistSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().min(3).max(254),
  user_type: z.enum(userTypes),
  whatsapp: z.string().max(40).optional(),
  category: z.string().max(80).optional(),
  consent: z.literal(true),
});

export type WaitlistPayload = z.infer<typeof waitlistSchema>;

/** Campos antispam que el cliente manda y el server nunca guarda. */
const antiSpamSchema = z.object({
  /** Honeypot invisible: si viene con algo, es un bot. */
  website: z.string().optional(),
  /** Milisegundos entre el montaje del form y el submit. */
  elapsedMs: z.number().nonnegative().optional(),
});

/** Un humano no completa el formulario en menos de esto. */
export const MIN_FILL_MS = 2500;

export type ParseResult =
  | { ok: true; data: WaitlistPayload; spam: boolean }
  | { ok: false; error: string };

const asString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

/**
 * Valida el body replicando **el orden exacto** de chequeos del handler
 * original, para que un cliente viejo reciba el mismo mensaje que antes.
 */
export function parseWaitlistBody(body: unknown): ParseResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: WAITLIST_ERRORS.missing };
  }

  const raw = body as Record<string, unknown>;

  const name = asString(raw.name);
  const email = asString(raw.email).toLowerCase();
  const userType = asString(raw.user_type);
  const whatsapp = asString(raw.whatsapp);
  const category = asString(raw.category);
  const consent = raw.consent === true || raw.consent === "true";

  // 1. Faltan obligatorios (mismo chequeo de "falsy" que el handler viejo).
  if (!name || !email || !userType) {
    return { ok: false, error: WAITLIST_ERRORS.missing };
  }
  if (!userTypes.includes(userType as UserType)) {
    return { ok: false, error: WAITLIST_ERRORS.missing };
  }

  // 2. Consentimiento (Ley 25.326).
  if (!consent) {
    return { ok: false, error: WAITLIST_ERRORS.consent };
  }

  // 3. Un local tiene que declarar su categoría.
  if (userType === "local" && !category) {
    return { ok: false, error: WAITLIST_ERRORS.category };
  }

  // 4. Formato de email — el handler viejo no lo validaba.
  if (!z.email().safeParse(email).success) {
    return { ok: false, error: WAITLIST_ERRORS.email };
  }

  const parsed = waitlistSchema.safeParse({
    name,
    email,
    user_type: userType,
    whatsapp: whatsapp || undefined,
    // `category` se guarda null cuando no es local: lo resuelve el route handler.
    category: userType === "local" ? category : undefined,
    consent: true,
  });

  if (!parsed.success) {
    return { ok: false, error: WAITLIST_ERRORS.missing };
  }

  const antiSpam = antiSpamSchema.safeParse(raw);
  const honeypotFilled = antiSpam.success && !!antiSpam.data.website?.trim();
  const tooFast =
    antiSpam.success &&
    antiSpam.data.elapsedMs !== undefined &&
    antiSpam.data.elapsedMs < MIN_FILL_MS;

  return { ok: true, data: parsed.data, spam: honeypotFilled || tooFast };
}
