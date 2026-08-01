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

/** Where a signal was observed. Kept as a label because it is shown verbatim. */
export type Region = 'Berlin' | 'Germany' | 'Europe' | 'Global';

/** How precise a Google Trends geo code is for a given place. */
export type GeoLevel = 'city' | 'region' | 'country' | 'world';

/** A city the user can read the feed through. */
export interface CityDef {
  id: string;
  name: string;
  /** Alternate spellings, so "Munich" finds "München". */
  aliases?: string[];
  countryName: string;
  /** ISO alpha-2. Empty for a city the catalog does not know. */
  countryCode: string;
  /** Google Trends geo code. Empty string means worldwide. */
  geo: string;
  geoLevel: GeoLevel;
  /** Name of that Trends region when it is not the city itself, e.g. "Bavaria". */
  geoName?: string;
  /** True for a city typed by the user that has no Trends region. */
  custom?: boolean;
}

/** The three widths the feed can be read at, coarsest last. */
export type MarketScope = 'city' | 'country' | 'global';

/** One resolved market: a city, its country, or the world. */
export interface Market {
  /** Stable key used for caching and for deriving curves: `city:berlin`, `country:DE`, `global`. */
  id: string;
  scope: MarketScope;
  label: string;
  short: string;
  geo: string;
  geoLevel: GeoLevel;
  /** What that geo code actually covers, for the disclosure line. */
  geoName: string;
  countryCode: string;
  city?: CityDef;
}

/**
 * The full lens: the chosen city, its country, the world, and which of the three
 * the feed is currently read through. Passed around as one object so a screen can
 * never show a momentum figure for one market next to a comparison for another.
 */
export interface MarketLens {
  city: Market;
  /** Null when the city is a custom entry with no known country. */
  country: Market | null;
  global: Market;
  scope: MarketScope;
  /** The market the feed, ranking and briefing are read through. */
  active: Market;
  /** The non-global side of every comparison. */
  local: Market;
  markets: Market[];
}

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
  /** The market this signal broke in. Its series is the observed one. */
  region: Region;
  /** ISO timestamp for when the spike was first detected. */
  detectedAt: string;
  /** Days left before interest is projected to peak and decay. */
  peakInDays: number;
  /** 14 normalised interest points, oldest first. */
  series: number[];
  /**
   * False when the keyword only exists in the place it was observed — a specific
   * club door, a single city's voucher scheme. Everything else is treated as a
   * template another city can copy, which is what the market lens says on screen.
   */
  portable?: boolean;
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

/** How far a user got with a signal. Ordered and cumulative. */
export type OutcomeStage = 'shipped' | 'first-money' | 'repeating';

/**
 * A self-reported result for one signal.
 *
 * TrendSpark never connects to a payment processor and never verifies these
 * numbers — the whole point is that the user states what a play made them and
 * then decides, in their own time, what share of it to pass back. Unlike a
 * contribution the revenue figure is free text, because it is not a price.
 */
export interface Outcome {
  id: string;
  signalId: string;
  stage: OutcomeStage;
  /** What the user says it made, in euro cents. Zero is valid for 'shipped'. */
  revenueCents: number;
  note: string;
  at: string;
  updatedAt: string;
  /** How much of this outcome the user has already passed back. */
  passedBackCents: number;
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
