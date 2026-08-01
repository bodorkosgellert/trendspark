import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/store/storage';
import { useSupportStore } from '@/lib/store/useSupportStore';
import type { WatchEntry } from '@/lib/types';

interface SignalState {
  /** Playbooks the user has actually read. Nothing is gated — this is a history. */
  openedIds: string[];
  watched: WatchEntry[];
  dismissedIds: string[];
  /** Records a first read and its serving cost. Returns true when newly opened. */
  open: (signalId: string) => boolean;
  /** Adds or removes a keyword from the watchlist. Returns true when now watching. */
  toggleWatch: (signalId: string, momentum: number) => boolean;
  dismiss: (signalId: string) => void;
  restore: () => void;
  reset: () => void;
}

interface LegacySignalState {
  unlockedIds?: string[];
  openedIds?: string[];
  savedIds?: string[];
  watched?: WatchEntry[];
  dismissedIds?: string[];
}

export const useSignalStore = create<SignalState>()(
  persist(
    (set, get) => ({
      openedIds: [],
      watched: [],
      dismissedIds: [],
      open: (signalId) => {
        if (get().openedIds.includes(signalId)) return false;
        set((state) => ({ openedIds: [signalId, ...state.openedIds] }));
        useSupportStore.getState().record('playbook');
        return true;
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
      reset: () => set({ openedIds: [], watched: [], dismissedIds: [] }),
    }),
    {
      name: 'trendspark-signals',
      storage: persistStorage,
      version: 3,
      migrate: (persisted, version) => {
        if (version >= 3) return persisted;
        const legacy = (persisted ?? {}) as LegacySignalState;
        const startedAt = new Date().toISOString();
        return {
          dismissedIds: legacy.dismissedIds ?? [],
          openedIds: legacy.openedIds ?? legacy.unlockedIds ?? [],
          watched:
            legacy.watched ??
            (legacy.savedIds ?? []).map((signalId) => ({
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
