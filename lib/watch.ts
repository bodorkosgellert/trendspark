import type { Signal } from '@/lib/types';

/** Days of interest history the timeline can show. */
export const HISTORY_DAYS = 90;

/** Ranges offered by the timeline range switch. */
export const TIMELINE_RANGES = [14, 30, 90] as const;

const DAY = 24 * 60 * 60 * 1000;

function hashId(id: string): number {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Small deterministic PRNG so a signal's back-history never changes between renders. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Extends a signal's 14 tracked points back to {@link HISTORY_DAYS} so a user can
 * see where the keyword sat before it started rising. The lead-in is generated
 * from the signal id, so it is stable across sessions and devices.
 */
export function buildHistory(signal: Signal): number[] {
  const random = mulberry32(hashId(signal.id));
  const target = signal.series[0] ?? 10;
  const floor = Math.max(2, target * 0.4);
  const lead = Math.max(0, HISTORY_DAYS - signal.series.length);
  const points: number[] = [];

  for (let index = 0; index < lead; index += 1) {
    const progress = lead > 1 ? index / (lead - 1) : 1;
    const base = floor + (target - floor) * progress ** 1.7;
    const noise = (random() - 0.5) * Math.max(2.5, base * 0.3);
    points.push(Math.max(1, Math.round((base + noise) * 10) / 10));
  }

  return [...points, ...signal.series];
}

export function daysSince(iso: string): number {
  const elapsed = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(elapsed / DAY));
}

export type WatchStatus = 'accelerating' | 'holding' | 'cooling';

export interface WatchStats {
  daysWatched: number;
  /** Index into the history array where tracking began. */
  startIndex: number;
  startValue: number;
  nowValue: number;
  peakValue: number;
  /** Percentage change in the interest index since tracking began. */
  changePct: number;
  daysLeft: number;
  status: WatchStatus;
  verdict: string;
}

export function watchStats(signal: Signal, startedAt: string, history: number[]): WatchStats {
  const daysWatched = Math.min(daysSince(startedAt), history.length - 1);
  const startIndex = Math.max(0, history.length - 1 - daysWatched);
  const startValue = history[startIndex] ?? 1;
  const nowValue = history[history.length - 1] ?? startValue;
  const peakValue = Math.max(...history.slice(startIndex));
  const changePct = ((nowValue - startValue) / Math.max(1, startValue)) * 100;
  const daysLeft = Math.max(0, signal.peakInDays - daysWatched);

  const status: WatchStatus =
    changePct >= 12 ? 'accelerating' : changePct >= -6 ? 'holding' : 'cooling';

  return {
    daysWatched,
    startIndex,
    startValue,
    nowValue,
    peakValue,
    changePct,
    daysLeft,
    status,
    verdict: verdictFor(status, daysLeft),
  };
}

function verdictFor(status: WatchStatus, daysLeft: number): string {
  if (status === 'accelerating') {
    return daysLeft <= 3
      ? 'Still climbing, but the window is nearly shut. Move today or let it go.'
      : 'Still climbing since you started tracking. This is the part where acting pays.';
  }
  if (status === 'holding') {
    return daysLeft <= 3
      ? 'Flat and the window is closing. Only worth it if you can ship this week.'
      : 'Holding steady. Nothing urgent — keep watching a few more days.';
  }
  return 'Cooling since you started tracking. Waiting was the right call.';
}

export function statusLabel(status: WatchStatus): string {
  switch (status) {
    case 'accelerating':
      return 'Still climbing';
    case 'holding':
      return 'Holding';
    default:
      return 'Cooling';
  }
}

export const STATUS_TEXT_CLASS: Record<WatchStatus, string> = {
  accelerating: 'text-up',
  holding: 'text-muted',
  cooling: 'text-down',
};

export function trackedLabel(daysWatched: number): string {
  if (daysWatched <= 0) return 'Tracking since today';
  if (daysWatched === 1) return 'Tracking 1 day';
  return `Tracking ${daysWatched} days`;
}

export function signedPct(value: number): string {
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

export function rangeLabel(days: number): string {
  return days >= HISTORY_DAYS ? '90d' : `${days}d`;
}
