export type NicheId =
  | 'ai-tools'
  | 'creator'
  | 'fitness'
  | 'finance'
  | 'gaming'
  | 'home'
  | 'pets'
  | 'food'
  | 'travel'
  | 'wellness';

export interface Niche {
  id: NicheId;
  label: string;
  blurb: string;
}

export type Competition = 'low' | 'medium' | 'high';

export type PlayKind = 'content' | 'product' | 'affiliate' | 'local';

export interface PlaybookStep {
  title: string;
  detail: string;
}

export interface Monetization {
  model: string;
  estimate: string;
  note: string;
}

export interface Playbook {
  kind: PlayKind;
  headline: string;
  audience: string;
  steps: PlaybookStep[];
  angles: string[];
  monetization: Monetization;
  firstPost: string;
  keywords: string[];
}

export interface Signal {
  id: string;
  keyword: string;
  niche: NicheId;
  /** Percentage rise in interest over the tracked window. */
  momentum: number;
  /** Estimated monthly searches. */
  volume: number;
  competition: Competition;
  region: string;
  /** ISO timestamp for when the spike was first detected. */
  detectedAt: string;
  /** Days left before interest is projected to peak and decay. */
  peakInDays: number;
  /** 14 normalised interest points, oldest first. */
  series: number[];
  why: string;
  sources: string[];
  play: Playbook;
}

/** A keyword the user put on their watchlist, with the moment tracking began. */
export interface WatchEntry {
  signalId: string;
  startedAt: string;
  /** Momentum reading at the moment tracking began, for a since-then comparison. */
  startMomentum: number;
}

/** Things a user does that cost something to serve. */
export type UsageKind = 'briefing' | 'playbook' | 'regenerate' | 'copy';

export type Usage = Record<UsageKind, number>;

/**
 * One rung on the contribution ladder. Stores only sell from a fixed set of
 * price points, so "pay what you want" is a ladder rather than a text field.
 */
export interface ContributionTier {
  id: string;
  cents: number;
  price: string;
}

export interface MonthlyTier {
  id: string;
  cents: number;
  price: string;
  label: string;
  blurb: string;
}

export type ContributionSource = 'flat' | 'share' | 'monthly';

export interface Contribution {
  id: string;
  cents: number;
  label: string;
  source: ContributionSource;
  at: string;
}
