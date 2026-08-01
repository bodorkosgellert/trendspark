import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/store/storage';
import type { NicheId } from '@/lib/types';

interface PrefsState {
  onboarded: boolean;
  niches: NicheId[];
  voiceId: string;
  briefingHour: number;
  notifyOnBreakout: boolean;
  completeOnboarding: (niches: NicheId[]) => void;
  toggleNiche: (niche: NicheId) => void;
  setVoice: (voiceId: string) => void;
  setBriefingHour: (hour: number) => void;
  setNotifyOnBreakout: (value: boolean) => void;
  reset: () => void;
}

export const VOICES = [
  { id: 'analyst', label: 'Analyst', blurb: 'Flat, fast, no filler' },
  { id: 'anchor', label: 'Anchor', blurb: 'Newsroom energy' },
  { id: 'coach', label: 'Coach', blurb: 'Warm and direct' },
] as const;

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      onboarded: false,
      niches: [],
      voiceId: 'analyst',
      briefingHour: 7,
      notifyOnBreakout: true,
      completeOnboarding: (niches) => set({ niches, onboarded: true }),
      toggleNiche: (niche) =>
        set((state) => ({
          niches: state.niches.includes(niche)
            ? state.niches.filter((item) => item !== niche)
            : [...state.niches, niche],
        })),
      setVoice: (voiceId) => set({ voiceId }),
      setBriefingHour: (briefingHour) => set({ briefingHour }),
      setNotifyOnBreakout: (notifyOnBreakout) => set({ notifyOnBreakout }),
      reset: () => set({ onboarded: false, niches: [] }),
    }),
    { name: 'trendspark-prefs', storage: persistStorage },
  ),
);
