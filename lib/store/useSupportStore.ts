import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { MONTHLY_TIERS, PROMPT_AFTER_EVENTS, RUN_COST_CENTS } from '@/lib/data/catalog';
import { persistStorage } from '@/lib/store/storage';
import type { Contribution, ContributionSource, Usage, UsageKind } from '@/lib/types';

const DAY = 24 * 60 * 60 * 1000;

const EMPTY_USAGE: Usage = { briefing: 0, playbook: 0, regenerate: 0, copy: 0 };

function contribution(cents: number, label: string, source: ContributionSource): Contribution {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    cents,
    label,
    source,
    at: new Date().toISOString(),
  };
}

/**
 * Nothing in TrendSpark is locked, so this store is not a wallet — it counts what
 * a user got out of the app and records what they chose to give back. The two
 * numbers are deliberately separate: usage is measured, payment is decided.
 */
interface SupportState {
  contributedCents: number;
  monthlyTierId: string | null;
  contributions: Contribution[];
  usage: Usage;
  /** Signals the user said the playbook was worth it for. */
  worthIt: string[];
  notWorthIt: string[];
  /** Value moments since the app last mentioned paying. */
  eventsSincePrompt: number;
  lastPromptAt: string | null;
  record: (kind: UsageKind) => void;
  contribute: (cents: number, label: string, source: ContributionSource) => void;
  setMonthly: (tierId: string | null) => void;
  rate: (signalId: string, worth: boolean) => void;
  markPromptSeen: () => void;
  reset: () => void;
}

export const useSupportStore = create<SupportState>()(
  persist(
    (set) => ({
      contributedCents: 0,
      monthlyTierId: null,
      contributions: [],
      usage: EMPTY_USAGE,
      worthIt: [],
      notWorthIt: [],
      eventsSincePrompt: 0,
      lastPromptAt: null,
      record: (kind) =>
        set((state) => ({
          usage: { ...state.usage, [kind]: state.usage[kind] + 1 },
          eventsSincePrompt: state.eventsSincePrompt + 1,
        })),
      contribute: (cents, label, source) =>
        set((state) => {
          if (cents <= 0) {
            return { eventsSincePrompt: 0, lastPromptAt: new Date().toISOString() };
          }
          return {
            contributedCents: state.contributedCents + cents,
            contributions: [contribution(cents, label, source), ...state.contributions].slice(
              0,
              50,
            ),
            eventsSincePrompt: 0,
            lastPromptAt: new Date().toISOString(),
          };
        }),
      setMonthly: (tierId) =>
        set((state) => {
          const tier = MONTHLY_TIERS.find((item) => item.id === tierId);
          if (!tier) return { monthlyTierId: null };
          return {
            monthlyTierId: tier.id,
            contributedCents: state.contributedCents + tier.cents,
            contributions: [
              contribution(tier.cents, `Monthly · ${tier.price}`, 'monthly'),
              ...state.contributions,
            ].slice(0, 50),
            eventsSincePrompt: 0,
            lastPromptAt: new Date().toISOString(),
          };
        }),
      rate: (signalId, worth) =>
        set((state) => ({
          worthIt: worth
            ? state.worthIt.includes(signalId)
              ? state.worthIt
              : [signalId, ...state.worthIt]
            : state.worthIt.filter((id) => id !== signalId),
          notWorthIt: worth
            ? state.notWorthIt.filter((id) => id !== signalId)
            : state.notWorthIt.includes(signalId)
              ? state.notWorthIt
              : [signalId, ...state.notWorthIt],
        })),
      markPromptSeen: () => set({ eventsSincePrompt: 0, lastPromptAt: new Date().toISOString() }),
      reset: () =>
        set({
          contributedCents: 0,
          monthlyTierId: null,
          contributions: [],
          usage: EMPTY_USAGE,
          worthIt: [],
          notWorthIt: [],
          eventsSincePrompt: 0,
          lastPromptAt: null,
        }),
    }),
    { name: 'trendspark-support', storage: persistStorage },
  ),
);

/** What this user's activity actually cost to serve, in euro cents. */
export function runCostCents(usage: Usage): number {
  return (
    usage.briefing * RUN_COST_CENTS.briefing +
    usage.playbook * RUN_COST_CENTS.playbook +
    usage.regenerate * RUN_COST_CENTS.regenerate +
    usage.copy * RUN_COST_CENTS.copy
  );
}

export function valueMoments(usage: Usage): number {
  return usage.briefing + usage.playbook + usage.regenerate + usage.copy;
}

/**
 * Whether the app should mention paying. Asking straight after a value moment is
 * the only point where pay-what-you-want performs, and asking more than once a
 * day turns it into nagging.
 */
export function shouldAsk(eventsSincePrompt: number, lastPromptAt: string | null): boolean {
  if (eventsSincePrompt < PROMPT_AFTER_EVENTS) return false;
  if (!lastPromptAt) return true;
  return Date.now() - new Date(lastPromptAt).getTime() > DAY;
}
