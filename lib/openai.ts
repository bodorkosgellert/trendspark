import type { Playbook, Signal } from '@/lib/types';

/**
 * OpenAI playbook generation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ADD YOUR HACKATHON KEY HERE (single place):
 *   .env  →  EXPO_PUBLIC_OPENAI_API_KEY=sk-...
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Every signal already ships with a written playbook, so the app never depends
 * on this call. When a key is present, "Regenerate" produces a fresh playbook
 * for the same signal. Move this behind a server route before release: an
 * EXPO_PUBLIC_ key is readable inside the shipped bundle.
 */
const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';

const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

export function isModelConfigured(): boolean {
  return API_KEY.length > 0;
}

const SYSTEM_PROMPT = [
  'You turn a rising search trend into a concrete money-making plan for one person working alone.',
  'Be specific and unglamorous. No hype, no emoji, no exclamation marks.',
  'Prefer numbers, named steps and honest limitations over encouragement.',
  'Return JSON only, matching the requested shape exactly.',
].join(' ');

interface ChatResponse {
  choices?: { message?: { content?: string } }[];
}

function isChatResponse(value: unknown): value is ChatResponse {
  return typeof value === 'object' && value !== null;
}

function coercePlaybook(raw: unknown, fallback: Playbook): Playbook {
  if (typeof raw !== 'object' || raw === null) return fallback;
  const value = raw as Partial<Playbook>;
  return {
    kind: value.kind ?? fallback.kind,
    headline: value.headline ?? fallback.headline,
    audience: value.audience ?? fallback.audience,
    steps: Array.isArray(value.steps) && value.steps.length > 0 ? value.steps : fallback.steps,
    angles: Array.isArray(value.angles) && value.angles.length > 0 ? value.angles : fallback.angles,
    monetization: value.monetization ?? fallback.monetization,
    firstPost: value.firstPost ?? fallback.firstPost,
    keywords:
      Array.isArray(value.keywords) && value.keywords.length > 0
        ? value.keywords
        : fallback.keywords,
  };
}

/** Returns a regenerated playbook, or null when unavailable so the UI keeps the seeded one. */
export async function regeneratePlaybook(signal: Signal): Promise<Playbook | null> {
  if (!isModelConfigured()) return null;

  const userPrompt = [
    `Rising search term: "${signal.keyword}"`,
    `Niche: ${signal.niche}. Region: ${signal.region}.`,
    `Momentum: +${signal.momentum}% on ~${signal.volume} monthly searches. Competition: ${signal.competition}.`,
    `Projected window: ${signal.peakInDays} days. Context: ${signal.why}`,
    '',
    'Return JSON with keys:',
    'kind (one of content, product, affiliate, local), headline, audience,',
    'steps (4 items with title and detail), angles (3 strings),',
    'monetization (model, estimate, note), firstPost (2-3 sentences), keywords (4 strings).',
  ].join('\n');

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.8,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) return null;

    const data: unknown = await response.json();
    const content = isChatResponse(data) ? data.choices?.[0]?.message?.content : undefined;
    if (!content) return null;

    return coercePlaybook(JSON.parse(content), signal.play);
  } catch {
    return null;
  }
}
