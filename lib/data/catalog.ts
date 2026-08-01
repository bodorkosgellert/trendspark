import type { CreditPack, Niche, Plan } from '@/lib/types';

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

/** One credit unlocks one full playbook. */
export const UNLOCK_COST = 1;

/** Credits every new account starts with, before any purchase. */
export const STARTING_CREDITS = 2;

export const PLANS: Plan[] = [
  {
    id: 'weekly',
    label: 'Weekly',
    price: '€4.99',
    cadence: 'per week',
    perks: [
      'Daily voice briefing, unlimited replays',
      '10 playbook credits every week',
      'Signals 12 hours before free users',
    ],
    includedCredits: 10,
  },
  {
    id: 'annual',
    label: 'Annual',
    price: '€79',
    cadence: 'per year',
    perks: [
      'Everything in Weekly, 70% cheaper',
      '25 playbook credits every month',
      'Early access to new niches',
    ],
    includedCredits: 25,
  },
];

export const CREDIT_PACKS: CreditPack[] = [
  { id: 'pack-3', credits: 3, price: '€2.99', perUnlock: '€1.00 per playbook' },
  { id: 'pack-10', credits: 10, price: '€7.99', perUnlock: '€0.80 per playbook' },
  {
    id: 'pack-30',
    credits: 30,
    price: '€17.99',
    perUnlock: '€0.60 per playbook',
    bestValue: true,
  },
];
