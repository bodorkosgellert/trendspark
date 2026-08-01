import type { ContributionTier, MonthlyTier, Niche, OutcomeStage, UsageKind } from '@/lib/types';

export const NICHES: Niche[] = [
  { id: 'ai-tools', label: 'AI & tools', blurb: 'Model launches, integrations, wrappers' },
  { id: 'creator', label: 'Creator economy', blurb: 'Short form, newsletters, UGC' },
  { id: 'fitness', label: 'Fitness', blurb: 'Supplements, gear, protocols' },
  { id: 'finance', label: 'Money', blurb: 'Investing, payments, side income' },
  { id: 'gaming', label: 'Gaming', blurb: 'Releases, mods, hardware' },
  { id: 'home', label: 'Home & energy', blurb: 'DIY, appliances, regulations' },
  { id: 'pets', label: 'Pets', blurb: 'Health, gear, subscriptions' },
  { id: 'food', label: 'Food', blurb: 'Recipes, kits, diets' },
  { id: 'travel', label: 'Travel', blurb: 'Routes, visas, nomad life' },
  { id: 'wellness', label: 'Wellness', blurb: 'Sleep, skin, longevity' },
];

export const NICHE_LABEL: Record<string, string> = Object.fromEntries(
  NICHES.map((niche) => [niche.id, niche.label]),
);

/**
 * Marginal cost of serving one action, in euro cents.
 *
 * Only the voice briefing costs real money per use — speech synthesis is billed
 * per character. Playbook generation is a fraction of a cent, and the demand
 * feed itself is a fixed monthly cost shared by everyone, not a per-user cost.
 * These numbers are shown to the user verbatim on the Support tab.
 */
export const RUN_COST_CENTS: Record<UsageKind, number> = {
  briefing: 7.6,
  playbook: 0.1,
  regenerate: 0.2,
  copy: 0,
};

/** What the whole 20-keyword demand feed costs to refresh for a month. */
export const FEED_COST_MONTHLY_CENTS = 3600;

/**
 * The amounts a contribution can be.
 *
 * A free-text "type any amount" box is impossible inside an app: Apple sells
 * from a fixed ladder of price points and Google Play requires declared prices,
 * so pay-what-you-want has to be a ladder of separate consumable products. This
 * is that ladder, and the UI says so.
 */
export const CONTRIBUTION_TIERS: ContributionTier[] = [
  { id: 'skip', cents: 0, price: 'Not this time' },
  { id: 'c-99', cents: 99, price: '€0.99' },
  { id: 'c-199', cents: 199, price: '€1.99' },
  { id: 'c-299', cents: 299, price: '€2.99' },
  { id: 'c-499', cents: 499, price: '€4.99' },
  { id: 'c-799', cents: 799, price: '€7.99' },
  { id: 'c-1199', cents: 1199, price: '€11.99' },
  { id: 'c-1999', cents: 1999, price: '€19.99' },
  { id: 'c-2999', cents: 2999, price: '€29.99' },
  { id: 'c-4999', cents: 4999, price: '€49.99' },
];

/** Where the amount dial starts, before the user moves it. */
export const DEFAULT_TIER_INDEX = 3;

export const MONTHLY_TIERS: MonthlyTier[] = [
  {
    id: 'keep-1',
    cents: 199,
    price: '€1.99',
    label: 'Covers me',
    blurb: 'Pays for my own briefings and a slice of the feed.',
  },
  {
    id: 'keep-2',
    cents: 499,
    price: '€4.99',
    label: 'Covers a few of us',
    blurb: 'Pays for my usage and four people who never pay.',
  },
  {
    id: 'keep-3',
    cents: 999,
    price: '€9.99',
    label: 'Keeps it growing',
    blurb: 'Funds new niches and a wider keyword grid.',
  },
];

/** Self-reported outcome steps offered in share-of-outcome mode, in euro cents. */
export const OUTCOME_STEPS_CENTS = [
  0, 2500, 5000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000,
];

/** Fractions of a self-reported outcome the user can choose to pass back. */
export const SHARE_FRACTIONS = [0.01, 0.02, 0.03, 0.05, 0.1] as const;

/**
 * The rungs of getting somewhere with a signal, in order.
 *
 * Shipping is deliberately a stage of its own: most plays reach it and stop, and
 * a ledger that only counted money would show an empty screen to someone who did
 * the work and did not sell anything yet.
 */
export const OUTCOME_STAGES: { id: OutcomeStage; label: string; blurb: string }[] = [
  { id: 'shipped', label: 'Shipped it', blurb: 'The thing exists. No money in yet.' },
  { id: 'first-money', label: 'First money in', blurb: 'Someone paid for it at least once.' },
  { id: 'repeating', label: 'It keeps paying', blurb: 'Repeat revenue, not a one-off.' },
];

/** Quick amounts on the result sheet. The field itself accepts any number. */
export const REVENUE_PRESETS_CENTS = [2500, 10_000, 50_000, 200_000];

/** Value moments before the app mentions paying again. */
export const PROMPT_AFTER_EVENTS = 5;

/** The closest rung on the ladder to a freely chosen amount. */
export function nearestTierIndex(cents: number): number {
  let best = 0;
  let bestGap = Number.POSITIVE_INFINITY;
  CONTRIBUTION_TIERS.forEach((tier, index) => {
    const gap = Math.abs(tier.cents - cents);
    if (gap < bestGap) {
      bestGap = gap;
      best = index;
    }
  });
  return best;
}

/**
 * Share of an in-app payment that reaches the developer on the small-business
 * rate. Shown to the user so the cost of paying inside the app is not hidden.
 */
export const STORE_NET_SHARE = 0.85;
