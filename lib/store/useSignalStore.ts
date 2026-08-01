import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { UNLOCK_COST } from '@/lib/data/catalog';
import { persistStorage } from '@/lib/store/storage';
import { useWalletStore } from '@/lib/store/useWalletStore';

export type UnlockResult = 'unlocked' | 'already' | 'insufficient';

interface SignalState {
  unlockedIds: string[];
  savedIds: string[];
  dismissedIds: string[];
  unlock: (signalId: string, keyword: string) => UnlockResult;
  toggleSaved: (signalId: string) => void;
  dismiss: (signalId: string) => void;
  restore: () => void;
  reset: () => void;
}

export const useSignalStore = create<SignalState>()(
  persist(
    (set, get) => ({
      unlockedIds: [],
      savedIds: [],
      dismissedIds: [],
      unlock: (signalId, keyword) => {
        if (get().unlockedIds.includes(signalId)) return 'already';
        const paid = useWalletStore.getState().spend(UNLOCK_COST, `Unlocked "${keyword}"`);
        if (!paid) return 'insufficient';
        set((state) => ({ unlockedIds: [signalId, ...state.unlockedIds] }));
        return 'unlocked';
      },
      toggleSaved: (signalId) =>
        set((state) => ({
          savedIds: state.savedIds.includes(signalId)
            ? state.savedIds.filter((id) => id !== signalId)
            : [signalId, ...state.savedIds],
        })),
      dismiss: (signalId) =>
        set((state) => ({
          dismissedIds: state.dismissedIds.includes(signalId)
            ? state.dismissedIds
            : [signalId, ...state.dismissedIds],
        })),
      restore: () => set({ dismissedIds: [] }),
      reset: () => set({ unlockedIds: [], savedIds: [], dismissedIds: [] }),
    }),
    { name: 'trendspark-signals', storage: persistStorage },
  ),
);
