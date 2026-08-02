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
  /** v3 onwards: the typed city lens. */
  city?: CityDef;
  marketScope?: MarketScope;
  recentCities?: CityDef[];
  /** v4 onwards. */
  density?: 'compact' | 'cards';
}

/** How tightly the radar feed is packed. */
export type FeedDensity = 'compact' | 'cards';

/**
 * Whether the user has allowed usage analytics. `null` means not asked yet, and
 * nothing is sent in that state — counting second-day returns needs a persistent
 * identifier, and storing one needs consent (§25 TDDDG).
 */
export type AnalyticsConsent = 'granted' | 'denied' | null;

const RECENT_LIMIT = 6;

/** Enough day stamps to see a habit form without keeping a year of history. */
const ACTIVE_DAYS_LIMIT = 120;

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
  /** Radar rows vs full cards. Rows first: more signals per screen. */
  density: FeedDensity;
  setDensity: (density: FeedDensity) => void;
  voiceId: string;
  briefingHour: number;
  notifyOnBreakout: boolean;
  analyticsConsent: AnalyticsConsent;
  setAnalyticsConsent: (consent: AnalyticsConsent) => void;
  /** ISO dates (YYYY-MM-DD) the app was opened on, newest first. */
  activeDays: string[];
  noteActiveDay: (day: string) => void;
  /** Address the user left for the briefing list, or null. */
  briefingEmail: string | null;
  setBriefingEmail: (email: string | null) => void;
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
      density: 'compact',
      setDensity: (density) => set({ density }),
      voiceId: 'analyst',
      briefingHour: 7,
      notifyOnBreakout: true,
      analyticsConsent: null,
      setAnalyticsConsent: (analyticsConsent) => set({ analyticsConsent }),
      activeDays: [],
      noteActiveDay: (day) =>
        set((state) =>
          state.activeDays.includes(day)
            ? state
            : { activeDays: [day, ...state.activeDays].slice(0, ACTIVE_DAYS_LIMIT) },
        ),
      briefingEmail: null,
      setBriefingEmail: (briefingEmail) => set({ briefingEmail }),
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
      version: 5,
      migrate: (persisted, version) => {
        const legacy = (persisted ?? {}) as LegacyPrefsState;

        const base: LegacyPrefsState =
          version >= 4
            ? legacy
            : version === 3
              ? { ...legacy, density: 'compact' }
              : {
                  ...legacy,
                  city: DEFAULT_CITY,
                  marketScope: scopeFromLegacy(legacy.market),
                  recentCities: [],
                  density: 'compact',
                };

        // v5 adds analytics consent, day stamps and the mailing-list address.
        // Consent starts unset on purpose: an upgrade cannot imply permission.
        return { ...base, analyticsConsent: null, activeDays: [], briefingEmail: null };
      },
      onRehydrateStorage: () => (state) => {
        // Catalog fixes (a corrected geo code, a new alias) should reach state
        // that was stored before them.
        if (state?.city) state.city = resolveCity(state.city);
      },
    },
  ),
);
