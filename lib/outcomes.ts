import { OUTCOME_STAGES } from '@/lib/data/catalog';
import { getSignalById } from '@/lib/data/signals';
import { euro } from '@/lib/format';
import type { Outcome, OutcomeStage, Signal } from '@/lib/types';

export interface OutcomeItem {
  outcome: Outcome;
  signal: Signal;
}

/** Drops results whose signal has left the feed so the list never renders blanks. */
export function resolveOutcomes(outcomes: Outcome[]): OutcomeItem[] {
  return outcomes
    .map((outcome) => {
      const signal = getSignalById(outcome.signalId);
      return signal ? { outcome, signal } : null;
    })
    .filter((item): item is OutcomeItem => item !== null);
}

export interface OutcomeTotals {
  logged: number;
  /** Results that reported money, not just a shipped thing. */
  earning: number;
  revenueCents: number;
  passedBackCents: number;
  /** Share of reported revenue actually passed back, or null with no revenue. */
  sharePct: number | null;
  /** The single biggest reported result. */
  bestCents: number;
}

export function outcomeTotals(outcomes: Outcome[]): OutcomeTotals {
  const revenueCents = outcomes.reduce((sum, item) => sum + item.revenueCents, 0);
  const passedBackCents = outcomes.reduce((sum, item) => sum + item.passedBackCents, 0);
  return {
    logged: outcomes.length,
    earning: outcomes.filter((item) => item.revenueCents > 0).length,
    revenueCents,
    passedBackCents,
    sharePct: revenueCents > 0 ? (passedBackCents / revenueCents) * 100 : null,
    bestCents: outcomes.reduce((best, item) => Math.max(best, item.revenueCents), 0),
  };
}

export function stageMeta(stage: OutcomeStage) {
  return OUTCOME_STAGES.find((item) => item.id === stage) ?? OUTCOME_STAGES[0];
}

export function stageRank(stage: OutcomeStage): number {
  const index = OUTCOME_STAGES.findIndex((item) => item.id === stage);
  return index < 0 ? 0 : index;
}

export function stageToneClass(stage: OutcomeStage): string {
  return stage === 'shipped' ? 'text-muted' : 'text-up';
}

export interface ProgressStep {
  key: string;
  label: string;
  value: number;
  detail: string;
}

/**
 * The four things a user can actually get to, in order. Counts come from real
 * stored state, so the ladder is a record rather than a motivational graphic.
 */
export function progressSteps(
  trackedCount: number,
  readCount: number,
  outcomes: Outcome[],
): ProgressStep[] {
  const shipped = outcomes.length;
  const earning = outcomes.filter((item) => item.revenueCents > 0).length;
  const repeating = outcomes.filter((item) => item.stage === 'repeating').length;
  return [
    { key: 'read', label: 'Playbooks read', value: readCount, detail: 'Signals you looked into' },
    { key: 'tracked', label: 'Tracked', value: trackedCount, detail: 'Kept an eye on over time' },
    { key: 'shipped', label: 'Shipped', value: shipped, detail: 'Something exists because of it' },
    {
      key: 'earning',
      label: 'Made money',
      value: earning,
      detail: repeating > 0 ? `${repeating} still paying` : 'At least one payment in',
    },
  ];
}

/** What the user has left to pass back on a result, if they want to. */
export function unpaidShareCents(outcome: Outcome, fraction: number): number {
  return Math.max(0, Math.round(outcome.revenueCents * fraction) - outcome.passedBackCents);
}

export function outcomeSummaryLine(outcome: Outcome): string {
  if (outcome.revenueCents === 0) return 'Shipped, nothing earned yet';
  if (outcome.passedBackCents === 0) return `${euro(outcome.revenueCents)} reported`;
  const pct = (outcome.passedBackCents / outcome.revenueCents) * 100;
  return `${euro(outcome.revenueCents)} reported · ${euro(outcome.passedBackCents)} passed back (${pct.toFixed(pct < 1 ? 1 : 0)}%)`;
}

/** Parses the free-text revenue field. Accepts "1.200,50", "1,200.50" and "1200". */
export function parseAmountToCents(input: string): number {
  const cleaned = input.replace(/[^\d.,]/g, '');
  if (!cleaned) return 0;
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  const decimalAt = Math.max(lastComma, lastDot);
  const tail = decimalAt >= 0 ? cleaned.slice(decimalAt + 1) : '';
  // A trailing group of one or two digits is a decimal part; anything else is a
  // thousands separator, so "1,200" reads as 1200 and "1,20" reads as 1.20.
  const isDecimal = decimalAt >= 0 && tail.length > 0 && tail.length <= 2;
  const whole = (isDecimal ? cleaned.slice(0, decimalAt) : cleaned).replace(/[^\d]/g, '');
  const fraction = isDecimal ? tail.padEnd(2, '0') : '00';
  const cents = Number(`${whole || '0'}${fraction}`);
  return Number.isFinite(cents) ? cents : 0;
}

/** Plain-euro display for the input field, without the currency symbol. */
export function centsToInput(cents: number): string {
  if (cents === 0) return '';
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}
