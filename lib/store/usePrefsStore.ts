import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_CITY, resolveCity } from '@/lib/data/cities';
import { persistStorage } from '@/lib/store/storage';
import type { CityDef, MarketScope, NicheId } from '@/lib/types';

interface LegacyPrefsState {
  onboarded?: boolean;
  niches?: NicheId[];
  voiceId?: string;
  briefingHour?: number;
  notifyOnBreakout?: boolean;
  /** v2 stored one of 'berlin' | 'germany' | 'global'. */
  market?: string;
}

const RECENT_LIMIT = 6;

interface PrefsState {
  onboarded: boolean;
  niches: NicheId[];
  /** The city the feed is read for. Typed by the user, Berlin to start with. */
  city: CityDef;
  /** Whether the feed reads at city, country or worldwide width. */
  marketScope: MarketScope;
  /** Cities the user has switched to before, newest first. */
  recentCities: CityDef[];
  setCity: (city: CityDef) => void;
  setMarketScope: (scope: MarketScope) => void;
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

/** Maps the old three-way lens onto a city plus a width. */
function scopeFromLegacy(market: string | undefined): MarketScope {
  if (market === 'germany') return 'country';
  if (market === 'global') return 'global';
  return 'city';
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      onboarded: false,
      niches: [],
      city: DEFAULT_CITY,
      marketScope: 'city',
      recentCities: [],
      setCity: (city) =>
        set((state) => ({
          city,
          // A custom city has no country, so the country width cannot stay selected.
          marketScope:
            state.marketScope === 'country' && city.countryCode.length === 0
              ? 'city'
              : state.marketScope,
          recentCities: [
            state.city,
            ...state.recentCities.filter((entry) => entry.id !== state.city.id),
          ]
            .filter((entry) => entry.id !== city.id)
            .slice(0, RECENT_LIMIT),
        })),
      setMarketScope: (marketScope) => set({ marketScope }),
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
      reset: () =>
        set({
          onboarded: false,
          niches: [],
          city: DEFAULT_CITY,
          marketScope: 'city',
          recentCities: [],
        }),
    }),
    {
      name: 'trendspark-prefs',
      storage: persistStorage,
      version: 3,
      migrate: (persisted, version) => {
        const legacy = (persisted ?? {}) as LegacyPrefsState;
        if (version >= 3) return persisted;
        return {
          ...legacy,
          city: DEFAULT_CITY,
          marketScope: scopeFromLegacy(legacy.market),
          recentCities: [],
        };
      },
      onRehydrateStorage: () => (state) => {
        // Catalog fixes (a corrected geo code, a new alias) should reach state
        // that was stored before them.
        if (state?.city) state.city = resolveCity(state.city);
      },
    },
  ),
);
