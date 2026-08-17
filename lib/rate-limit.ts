/**
 * Rate limit básico por IP, en memoria.
 *
 * Alcance real: la memoria vive por instancia de función, así que esto frena
 * ráfagas de un mismo cliente, no un ataque distribuido. Es suficiente para
 * que el endpoint no sea un spam relay. Si hace falta algo serio,
 * reemplazar por Upstash Redis manteniendo esta misma firma.
 */

type Bucket = { hits: number[] };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_HITS = 5;
/** Para que el Map no crezca sin techo en una instancia de larga vida. */
const MAX_KEYS = 5_000;

export function rateLimit(key: string): { allowed: boolean } {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };

  bucket.hits = bucket.hits.filter((hit) => now - hit < WINDOW_MS);

  if (bucket.hits.length >= MAX_HITS) {
    buckets.set(key, bucket);
    return { allowed: false };
  }

  bucket.hits.push(now);

  if (!buckets.has(key) && buckets.size >= MAX_KEYS) {
    // Descarta la entrada más vieja para acotar la memoria.
    const oldest = buckets.keys().next();
    if (!oldest.done) buckets.delete(oldest.value);
  }

  buckets.set(key, bucket);
  return { allowed: true };
}

/** IP del cliente detrás del proxy de Vercel. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? "unknown";
}
