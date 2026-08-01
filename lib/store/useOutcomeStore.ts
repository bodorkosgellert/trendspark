import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/store/storage';
import type { Outcome, OutcomeStage } from '@/lib/types';

interface LogInput {
  signalId: string;
  stage: OutcomeStage;
  revenueCents: number;
  note: string;
}

/**
 * Self-reported results, one per signal.
 *
 * This is the other half of pay-after: contributions record what the user gave,
 * this records what they say they got. Both numbers stay on the device, and the
 * app never tries to verify the revenue — an unverifiable number the user
 * volunteers is the only honest basis for a share, because attribution from a
 * keyword to a bank balance cannot be proven.
 */
interface OutcomeState {
  outcomes: Outcome[];
  /** Creates or replaces the result for a signal. Returns the outcome id. */
  log: (input: LogInput) => string;
  remove: (id: string) => void;
  /** Records that a contribution was made against this result. */
  passBack: (id: string, cents: number) => void;
  reset: () => void;
}

export const useOutcomeStore = create<OutcomeState>()(
  persist(
    (set, get) => ({
      outcomes: [],
      log: ({ signalId, stage, revenueCents, note }) => {
        const now = new Date().toISOString();
        const existing = get().outcomes.find((item) => item.signalId === signalId);
        const id = existing?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const next: Outcome = {
          id,
          signalId,
          stage,
          revenueCents: Math.max(0, Math.round(revenueCents)),
          note,
          at: existing?.at ?? now,
          updatedAt: now,
          passedBackCents: existing?.passedBackCents ?? 0,
        };
        set((state) => ({
          outcomes: [next, ...state.outcomes.filter((item) => item.signalId !== signalId)],
        }));
        return id;
      },
      remove: (id) =>
        set((state) => ({ outcomes: state.outcomes.filter((item) => item.id !== id) })),
      passBack: (id, cents) =>
        set((state) => ({
          outcomes: state.outcomes.map((item) =>
            item.id === id
              ? { ...item, passedBackCents: item.passedBackCents + Math.max(0, cents) }
              : item,
          ),
        })),
      reset: () => set({ outcomes: [] }),
    }),
    { name: 'trendspark-outcomes', storage: persistStorage },
  ),
);

export function outcomeForSignal(outcomes: Outcome[], signalId: string): Outcome | undefined {
  return outcomes.find((item) => item.signalId === signalId);
}
