import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { UNLOCK_COST } from '@/lib/data/catalog';
import { persistStorage } from '@/lib/store/storage';
import { useWalletStore } from '@/lib/store/useWalletStore';
import type { WatchEntry } from '@/lib/types';

export type UnlockResult = 'unlocked' | 'already' | 'insufficient';

interface SignalState {
  unlockedIds: string[];
  watched: WatchEntry[];
  dismissedIds: string[];
  unlock: (signalId: string, keyword: string) => UnlockResult;
  /** Adds or removes a keyword from the watchlist. Returns true when now watching. */
  toggleWatch: (signalId: string, momentum: number) => boolean;
  dismiss: (signalId: string) => void;
  restore: () => void;
  reset: () => void;
}

interface LegacySignalState {
  unlockedIds?: string[];
  savedIds?: string[];
  dismissedIds?: string[];
}

export const useSignalStore = create<SignalState>()(
  persist(
    (set, get) => ({
      unlockedIds: [],
      watched: [],
      dismissedIds: [],
      unlock: (signalId, keyword) => {
        if (get().unlockedIds.includes(signalId)) return 'already';
        const paid = useWalletStore.getState().spend(UNLOCK_COST, `Unlocked "${keyword}"`);
        if (!paid) return 'insufficient';
        set((state) => ({ unlockedIds: [signalId, ...state.unlockedIds] }));
        return 'unlocked';
      },
      toggleWatch: (signalId, momentum) => {
        const existing = get().watched.some((entry) => entry.signalId === signalId);
        if (existing) {
          set((state) => ({
            watched: state.watched.filter((entry) => entry.signalId !== signalId),
          }));
          return false;
        }
        set((state) => ({
          watched: [
            { signalId, startedAt: new Date().toISOString(), startMomentum: momentum },
            ...state.watched,
          ],
        }));
        return true;
      },
      dismiss: (signalId) =>
        set((state) => ({
          dismissedIds: state.dismissedIds.includes(signalId)
            ? state.dismissedIds
            : [signalId, ...state.dismissedIds],
        })),
      restore: () => set({ dismissedIds: [] }),
      reset: () => set({ unlockedIds: [], watched: [], dismissedIds: [] }),
    }),
    {
      name: 'trendspark-signals',
      storage: persistStorage,
      version: 2,
      migrate: (persisted, version) => {
        if (version >= 2) return persisted;
        const legacy = (persisted ?? {}) as LegacySignalState;
        const startedAt = new Date().toISOString();
        return {
          ...legacy,
          watched: (legacy.savedIds ?? []).map((signalId) => ({
            signalId,
            startedAt,
            startMomentum: 0,
          })),
        };
      },
    },
  ),
);

export function isWatched(watched: WatchEntry[], signalId: string): boolean {
  return watched.some((entry) => entry.signalId === signalId);
}

export function watchEntry(watched: WatchEntry[], signalId: string): WatchEntry | undefined {
  return watched.find((entry) => entry.signalId === signalId);
}
