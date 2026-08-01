import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { CREDIT_PACKS, PLANS, STARTING_CREDITS } from '@/lib/data/catalog';
import { persistStorage } from '@/lib/store/storage';
import type { LedgerEntry, LedgerKind, PlanId } from '@/lib/types';

/** Free accounts can play one full briefing per day before the paywall. */
export const FREE_BRIEFINGS_PER_DAY = 1;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function entry(kind: LedgerKind, label: string, delta: number): LedgerEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    label,
    delta,
    at: new Date().toISOString(),
  };
}

interface WalletState {
  credits: number;
  plan: PlanId;
  ledger: LedgerEntry[];
  briefingDate: string;
  briefingPlays: number;
  /** Returns false when the balance is too low so callers can open the paywall. */
  spend: (amount: number, label: string) => boolean;
  buyPack: (packId: string) => void;
  subscribe: (planId: PlanId) => void;
  registerBriefingPlay: () => void;
  canPlayBriefing: () => boolean;
  reset: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      credits: STARTING_CREDITS,
      plan: 'free',
      ledger: [entry('bonus', 'Welcome credits', STARTING_CREDITS)],
      briefingDate: today(),
      briefingPlays: 0,
      spend: (amount, label) => {
        if (get().credits < amount) return false;
        set((state) => ({
          credits: state.credits - amount,
          ledger: [entry('unlock', label, -amount), ...state.ledger].slice(0, 50),
        }));
        return true;
      },
      buyPack: (packId) => {
        const pack = CREDIT_PACKS.find((item) => item.id === packId);
        if (!pack) return;
        set((state) => ({
          credits: state.credits + pack.credits,
          ledger: [
            entry('topup', `${pack.credits} credits · ${pack.price}`, pack.credits),
            ...state.ledger,
          ].slice(0, 50),
        }));
      },
      subscribe: (planId) => {
        const plan = PLANS.find((item) => item.id === planId);
        if (!plan) return;
        set((state) => ({
          plan: planId,
          credits: state.credits + plan.includedCredits,
          ledger: [
            entry('plan', `${plan.label} plan started`, plan.includedCredits),
            ...state.ledger,
          ].slice(0, 50),
        }));
      },
      registerBriefingPlay: () =>
        set((state) => {
          const stamp = today();
          const sameDay = state.briefingDate === stamp;
          return {
            briefingDate: stamp,
            briefingPlays: sameDay ? state.briefingPlays + 1 : 1,
          };
        }),
      canPlayBriefing: () => {
        const state = get();
        if (state.plan !== 'free') return true;
        if (state.briefingDate !== today()) return true;
        return state.briefingPlays < FREE_BRIEFINGS_PER_DAY;
      },
      reset: () =>
        set({
          credits: STARTING_CREDITS,
          plan: 'free',
          ledger: [entry('bonus', 'Welcome credits', STARTING_CREDITS)],
          briefingDate: today(),
          briefingPlays: 0,
        }),
    }),
    { name: 'trendspark-wallet', storage: persistStorage },
  ),
);
