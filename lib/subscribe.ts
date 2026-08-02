/**
 * Email capture, via a hosted form service — no backend, no database.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * .env  →  EXPO_PUBLIC_FORM_ENDPOINT=https://formspree.io/f/xxxxxxx
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Works with anything that accepts a JSON POST and answers 2xx: Formspree (free
 * tier 50 submissions/month), Tally, Formcarry, Buttondown's form endpoint. The
 * service stores the address and emails you; you sign their processor agreement
 * and nothing else changes in this app.
 *
 * With no endpoint set the field stays visible and says it is not connected,
 * rather than pretending to have taken the address.
 */
const ENDPOINT = process.env.EXPO_PUBLIC_FORM_ENDPOINT ?? '';

export type SubscribeResult = 'ok' | 'invalid' | 'not-configured' | 'failed';

export function isSubscribeConfigured(): boolean {
  return ENDPOINT.length > 0;
}

/** Deliberately loose: rejecting valid addresses is worse than accepting a typo. */
export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 5 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export async function subscribeEmail(email: string, city: string): Promise<SubscribeResult> {
  if (!isValidEmail(email)) return 'invalid';
  if (!isSubscribeConfigured()) return 'not-configured';

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        city,
        source: 'trendspark-app',
        // Formspree uses _subject for the notification mail; harmless elsewhere.
        _subject: `TrendSpark briefing signup — ${city}`,
      }),
    });
    return response.ok ? 'ok' : 'failed';
  } catch {
    return 'failed';
  }
}
