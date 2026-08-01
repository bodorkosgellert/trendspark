import { SIGNALS } from '@/lib/data/signals';
import { heatScore } from '@/lib/format';
import type { NicheId, Signal } from '@/lib/types';

/**
 * Signals the user has opted into. Falls back to the full set so the feed is
 * never empty just because someone picked a quiet niche.
 */
export function scopeSignals(niches: NicheId[], dismissedIds: string[]): Signal[] {
  const base = SIGNALS.filter((signal) => !dismissedIds.includes(signal.id)).filter((signal) =>
    niches.length === 0 ? true : niches.includes(signal.niche),
  );
  return base.length > 0 ? base : SIGNALS;
}

export function rankByHeat(signals: Signal[]): Signal[] {
  return [...signals].sort(
    (a, b) => heatScore(b.momentum, b.competition) - heatScore(a.momentum, a.competition),
  );
}

/** The signals that make it into today's spoken briefing. */
export function topSignals(niches: NicheId[], dismissedIds: string[], count = 3): Signal[] {
  return rankByHeat(scopeSignals(niches, dismissedIds)).slice(0, count);
}
