import { SIGNALS } from '@/lib/data/signals';
import { heatScore } from '@/lib/format';
import { marketMomentum, relationTo, type SignalRelation } from '@/lib/markets';
import type { Market, NicheId, Signal } from '@/lib/types';

/**
 * How much a signal's score is trusted in a given market.
 *
 * A reading in the market it was measured in is a measurement, so it outranks a
 * derivation. A keyword measured in another city is a template rather than local
 * demand — real, but it needs rewriting before it means anything here — and a
 * keyword that only exists where it was observed is pushed to the floor instead
 * of being hidden, so the ranking stays inspectable.
 */
const RELATION_WEIGHT: Record<SignalRelation, number> = {
  observed: 1.3,
  national: 1,
  follower: 1,
  template: 0.5,
  bound: 0.12,
};

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

/** Heat for one market: momentum as that market reads it, discounted by competition. */
export function marketHeat(signal: Signal, market: Market): number {
  const score = heatScore(marketMomentum(signal, market), signal.competition);
  return score * RELATION_WEIGHT[relationTo(signal, market)];
}

export function rankForMarket(signals: Signal[], market: Market): Signal[] {
  return [...signals].sort((a, b) => marketHeat(b, market) - marketHeat(a, market));
}

/** How many of these signals were actually measured in a given market. */
export function observedCount(signals: Signal[], market: Market): number {
  return signals.filter((signal) => relationTo(signal, market) === 'observed').length;
}

/** The signals that make it into today's spoken briefing, read through one market. */
export function topSignals(
  niches: NicheId[],
  dismissedIds: string[],
  market: Market,
  count = 3,
): Signal[] {
  return rankForMarket(scopeSignals(niches, dismissedIds), market).slice(0, count);
}
