import { DEFAULT_FLAGGED_DAYS_AGO, FLAGGED_DAYS_AGO } from '@/lib/data/history';
import { SIGNALS } from '@/lib/data/signals';
import type { Signal } from '@/lib/types';
import { buildHistory, HISTORY_DAYS } from '@/lib/watch';

const DAY = 24 * 60 * 60 * 1000;

/** How far along a signal is between first breakout and projected peak. */
export type Stage = 'fresh' | 'running' | 'mature';

export interface ArchiveEntry {
  signal: Signal;
  history: number[];
  /** Days between the breakout and today. */
  flaggedDaysAgo: number;
  flaggedAt: string;
  /** Index into {@link history} where the breakout sits. */
  flaggedIndex: number;
  valueThen: number;
  valueNow: number;
  /** Change in the interest index since the breakout. */
  changePct: number;
  stage: Stage;
}

export const PERIODS = [
  { id: 'week', label: 'This week', hint: 'Broke out in the last 7 days', max: 7 },
  { id: 'weeks', label: '1–3 weeks ago', hint: '8 to 21 days ago', max: 21 },
  { id: 'sixWeeks', label: '3–6 weeks ago', hint: '22 to 45 days ago', max: 45 },
  { id: 'months', label: '2–3 months ago', hint: '46 days and older', max: HISTORY_DAYS },
] as const;

export type PeriodId = (typeof PERIODS)[number]['id'];

export function periodOf(daysAgo: number): PeriodId {
  for (const period of PERIODS) {
    if (daysAgo <= period.max) return period.id;
  }
  return 'months';
}

function stageOf(daysAgo: number): Stage {
  if (daysAgo <= 14) return 'fresh';
  if (daysAgo <= 45) return 'running';
  return 'mature';
}

export function stageLabel(stage: Stage): string {
  switch (stage) {
    case 'fresh':
      return 'Just broke out';
    case 'running':
      return 'Running a while';
    default:
      return 'Long climb';
  }
}

export const STAGE_TEXT_CLASS: Record<Stage, string> = {
  fresh: 'text-hot',
  running: 'text-up',
  mature: 'text-muted',
};

function entryFor(signal: Signal): ArchiveEntry {
  const history = buildHistory(signal);
  const flaggedDaysAgo = Math.min(
    HISTORY_DAYS - 1,
    FLAGGED_DAYS_AGO[signal.id] ?? DEFAULT_FLAGGED_DAYS_AGO,
  );
  const flaggedIndex = Math.max(0, history.length - 1 - flaggedDaysAgo);
  const valueThen = history[flaggedIndex] ?? 1;
  const valueNow = history[history.length - 1] ?? valueThen;

  return {
    signal,
    history,
    flaggedDaysAgo,
    flaggedAt: new Date(Date.now() - flaggedDaysAgo * DAY).toISOString(),
    flaggedIndex,
    valueThen,
    valueNow,
    changePct: ((valueNow - valueThen) / Math.max(1, valueThen)) * 100,
    stage: stageOf(flaggedDaysAgo),
  };
}

let archive: ArchiveEntry[] | null = null;

/** Every signal with its breakout date, newest breakout first. */
export function buildArchive(): ArchiveEntry[] {
  if (archive) return archive;
  archive = SIGNALS.map(entryFor).sort((a, b) => a.flaggedDaysAgo - b.flaggedDaysAgo);
  return archive;
}

export function archiveFor(signalId: string): ArchiveEntry | undefined {
  return buildArchive().find((entry) => entry.signal.id === signalId);
}

export function flaggedLabel(daysAgo: number): string {
  if (daysAgo <= 1) return 'Broke out today';
  if (daysAgo < 14) return `Broke out ${daysAgo} days ago`;
  const weeks = Math.round(daysAgo / 7);
  if (daysAgo < 60) return `Broke out ${weeks} weeks ago`;
  return `Broke out ${Math.round(daysAgo / 30)} months ago`;
}

/** Signals whose interest index is meaningfully higher than at breakout. */
export function stillClimbingCount(entries: ArchiveEntry[]): number {
  return entries.filter((entry) => entry.changePct >= 25).length;
}
