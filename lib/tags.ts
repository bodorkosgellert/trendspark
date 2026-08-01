import { SIGNALS } from '@/lib/data/signals';
import { playKindLabel } from '@/lib/format';
import type { Signal } from '@/lib/types';

export interface Tag {
  id: string;
  label: string;
}

export interface TagCount extends Tag {
  count: number;
}

/**
 * Theme tags are derived, not authored, so a new signal is taggable the moment
 * it enters the feed. Each rule reads the keyword, the reason, the headline and
 * the target keywords, which is enough to place a signal without a taxonomy.
 */
const THEME_RULES: { id: string; label: string; test: RegExp }[] = [
  { id: 'ai', label: 'AI', test: /\bai\b|llm|gpt|generator|automation|clon(e|ing)|model/ },
  { id: 'audio', label: 'Audio', test: /voice|podcast|audio|listener|speech/ },
  { id: 'video', label: 'Video', test: /youtube|video|ugc|tiktok|short form|shorts|reel/ },
  { id: 'gear', label: 'Gear', test: /dock|tub|fryer|fountain|kit|refill|hardware|device/ },
  { id: 'supplements', label: 'Supplements', test: /creatine|protein|gumm|supplement/ },
  { id: 'sleep', label: 'Sleep', test: /sleep|taping|cortisol|swelling|circadian/ },
  {
    id: 'admin',
    label: 'Rules & admin',
    test: /anmeld|visa|requirements|legal|safety|compliance|regulation|bundesnetzagentur|immigration|bürgeramt|amt|antrag|elster|steuererkl/,
  },
  {
    id: 'housing',
    label: 'Housing',
    test: /wohnung|miete|mietspiegel|mieterh|vermieter|kita|apartment|balkon/,
  },
  {
    id: 'booking',
    label: 'Getting a slot',
    test: /termin|buchen|slot|platz|appointment|booking|einlass/,
  },
  { id: 'community', label: 'Community', test: /meetup|community|event|club|newsletter/ },
  { id: 'diy', label: 'DIY', test: /diy|homemade|selber|starter kit|recipe|build your own/ },
  { id: 'money', label: 'Money', test: /micropayment|depot|gebühren|fees|invest|x402|payout/ },
  { id: 'compare', label: 'Comparison', test: /vergleich|comparison|accuracy|alternative|versus/ },
  { id: 'energy', label: 'Energy', test: /balkonkraftwerk|solar|strom|energy|watt/ },
  { id: 'seasonal', label: 'Seasonal', test: /season|summer|winter|2026 route|holiday/ },
];

const cache = new Map<string, Tag[]>();

function haystack(signal: Signal): string {
  return [signal.keyword, signal.why, signal.play.headline, ...signal.play.keywords]
    .join(' ')
    .toLowerCase();
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/** Deterministic tag set for a signal. Cached because the input never changes. */
export function tagsFor(signal: Signal): Tag[] {
  const cached = cache.get(signal.id);
  if (cached) return cached;

  const text = haystack(signal);
  const tags: Tag[] = [];

  for (const rule of THEME_RULES) {
    if (rule.test.test(text)) tags.push({ id: rule.id, label: rule.label });
  }

  if (signal.region !== 'Global') {
    tags.push({ id: `geo-${slug(signal.region)}`, label: signal.region });
  }
  if (signal.competition === 'low') {
    tags.push({ id: 'open-field', label: 'Open field' });
  }
  if (signal.peakInDays <= 10) {
    tags.push({ id: 'short-window', label: 'Short window' });
  }
  tags.push({ id: `kind-${signal.play.kind}`, label: playKindLabel(signal.play.kind) });

  const trimmed = tags.slice(0, 6);
  cache.set(signal.id, trimmed);
  return trimmed;
}

export function hasTag(signal: Signal, tagId: string): boolean {
  return tagsFor(signal).some((tag) => tag.id === tagId);
}

let counted: TagCount[] | null = null;

/** Every tag in use across the feed, most common first, for filter chips. */
export function allTags(): TagCount[] {
  if (counted) return counted;

  const totals = new Map<string, TagCount>();
  for (const signal of SIGNALS) {
    for (const tag of tagsFor(signal)) {
      const existing = totals.get(tag.id);
      if (existing) {
        existing.count += 1;
      } else {
        totals.set(tag.id, { ...tag, count: 1 });
      }
    }
  }

  counted = [...totals.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );
  return counted;
}
