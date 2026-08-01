import { countryNameOf, findCity } from '@/lib/data/cities';
import { hashId, mulberry32 } from '@/lib/random';
import type { CityDef, Market, MarketLens, MarketScope, Region, Signal } from '@/lib/types';
import { buildHistory } from '@/lib/watch';

export const GLOBAL_MARKET: Market = {
  id: 'global',
  scope: 'global',
  label: 'Global',
  short: 'Global',
  geo: '',
  geoLevel: 'world',
  geoName: 'Worldwide',
  countryCode: '',
};

export function cityMarket(city: CityDef): Market {
  return {
    id: `city:${city.id}`,
    scope: 'city',
    label: city.name,
    short: city.name,
    geo: city.geo,
    geoLevel: city.geoLevel,
    geoName: city.geoName ?? city.name,
    countryCode: city.countryCode,
    city,
  };
}

export function countryMarket(code: string): Market | null {
  if (code.length === 0) return null;
  const label = countryNameOf(code);
  return {
    id: `country:${code}`,
    scope: 'country',
    label,
    short: code,
    geo: code,
    geoLevel: 'country',
    geoName: label,
    countryCode: code,
  };
}

/**
 * Resolves the chosen city and width into the lens the whole app reads through.
 * A custom city has no country, so the country width silently collapses to the
 * city rather than showing an empty tab.
 */
export function buildLens(city: CityDef, scope: MarketScope): MarketLens {
  const cityView = cityMarket(city);
  const country = countryMarket(city.countryCode);
  const resolved: MarketScope = scope === 'country' && !country ? 'city' : scope;

  const active =
    resolved === 'city' ? cityView : resolved === 'country' ? (country ?? cityView) : GLOBAL_MARKET;

  return {
    city: cityView,
    country,
    global: GLOBAL_MARKET,
    scope: resolved,
    active,
    local: active.scope === 'global' ? cityView : active,
    markets: country ? [cityView, country, GLOBAL_MARKET] : [cityView, GLOBAL_MARKET],
  };
}

/** Regions in the seeded feed that are a city rather than a country or the world. */
const REGION_CITY: Partial<Record<Region, string>> = { Berlin: 'berlin' };

/**
 * The market a signal was actually observed in. Its curve is the measured one;
 * every other market's curve is derived from it.
 */
export function homeMarket(signal: Signal): Market {
  const cityId = REGION_CITY[signal.region];
  if (cityId) {
    const city = findCity(cityId);
    if (city) return cityMarket(city);
  }
  if (signal.region === 'Germany') return countryMarket('DE') ?? GLOBAL_MARKET;
  return GLOBAL_MARKET;
}

/**
 * How a signal relates to the market it is being read through.
 *
 * - `observed` — measured right here.
 * - `national` — the same observation one width up or down inside its own country.
 * - `follower`  — a worldwide signal reaching this market later.
 * - `template` — measured somewhere else. The demand pattern ports, the wording does not.
 * - `bound` — only exists where it was observed, so it does not port at all.
 */
export type SignalRelation = 'observed' | 'national' | 'follower' | 'template' | 'bound';

export function relationTo(signal: Signal, market: Market): SignalRelation {
  const home = homeMarket(signal);
  if (home.id === market.id) return 'observed';
  if (home.scope === 'global') return 'follower';

  const sameCountry = market.countryCode.length > 0 && market.countryCode === home.countryCode;
  if (home.scope === 'city' && market.scope === 'country' && sameCountry) return 'national';
  if (home.scope === 'country' && market.scope === 'city' && sameCountry) return 'national';

  return signal.portable === false ? 'bound' : 'template';
}

export function isNativeTo(signal: Signal, market: Market): boolean {
  return relationTo(signal, market) === 'observed';
}

/** Trailing window used for every momentum reading, in days. */
const WINDOW = 14;

/** Widest lead or lag the cross-correlation will look for, in days. */
const MAX_LAG = 28;

/** Below this, two markets are called level rather than one leading. */
const IN_STEP_DAYS = 4;

/**
 * How many days a market trails the one the signal was observed in.
 *
 * A signal is detected where it broke first, so every other market is modelled as
 * a follower: its curve today is the observed curve some days back. That is the
 * one direction that needs no forecasting — deriving a market that *leads* the
 * observation would mean inventing future data and drawing it as if measured.
 *
 * Replace this whole function once the pipeline stores one observation series per
 * geo. Nothing else in the app needs to change.
 */
function lagFor(signal: Signal, market: Market): number {
  const relation = relationTo(signal, market);
  if (relation === 'observed') return 0;

  const random = mulberry32(hashId(`${signal.id}:${market.id}`));
  const spread = 7 + Math.floor(random() * 12);
  const mid = Math.max(2, Math.round(spread * (0.28 + random() * 0.3)));
  const home = homeMarket(signal);

  if (relation === 'national') {
    // A city observation reaches its country later; a national one is already
    // level with the cities inside it.
    return home.scope === 'city' ? mid : 0;
  }
  if (home.scope === 'global') {
    // Broke worldwide: a single city picks it up before a whole country does.
    return market.scope === 'city' ? mid : spread;
  }
  if (market.scope === 'global') return spread;

  const sameCountry = market.countryCode.length > 0 && market.countryCode === home.countryCode;
  return sameCountry ? mid : spread + mid;
}

/**
 * Derives a follower market's curve from the observed one: the same shape, later,
 * with a slightly different amplitude and a little noise so it reads as a
 * separate measurement rather than a translated copy.
 */
function follow(base: number[], lag: number, seed: number): number[] {
  const random = mulberry32(seed);
  const amp = 0.84 + random() * 0.2;
  const floor = Math.max(1, Math.min(...base) * (0.78 + random() * 0.34));

  return base.map((_, index) => {
    const source = base[Math.max(0, index - lag)] ?? base[0];
    const damped = floor + (source - floor) * amp;
    const noise = (random() - 0.5) * Math.max(1.4, damped * 0.07);
    return Math.max(1, Math.round((damped + noise) * 10) / 10);
  });
}

const seriesCache = new Map<string, number[]>();

/** Daily interest for one signal in one market, oldest first. */
export function marketSeries(signal: Signal, market: Market): number[] {
  const key = `${signal.id}:${market.id}`;
  const cached = seriesCache.get(key);
  if (cached) return cached;

  const base = buildHistory(signal);
  const lag = lagFor(signal, market);
  const series = lag === 0 && isNativeTo(signal, market) ? base : follow(base, lag, hashId(key));

  seriesCache.set(key, series);
  return series;
}

function rise(series: number[]): number {
  if (series.length < 6) return 0;
  const win = series.slice(-WINDOW);
  const start = Math.max(1, (win[0] + win[1] + win[2]) / 3);
  const end = (win[win.length - 1] + win[win.length - 2]) / 2;
  return end / start - 1;
}

/**
 * The percentage rise this signal shows in a given market. The market it was
 * observed in returns the measured figure untouched; the others are scaled by the
 * ratio of their curves, so a market that has not caught up yet reads lower.
 */
export function marketMomentum(signal: Signal, market: Market): number {
  const home = homeMarket(signal);
  if (home.id === market.id) return signal.momentum;

  const homeRise = rise(marketSeries(signal, home));
  const otherRise = rise(marketSeries(signal, market));
  if (homeRise <= 0.02) return Math.round(otherRise * 100);

  const scaled = signal.momentum * (otherRise / homeRise);
  return Math.round(Math.max(-40, Math.min(signal.momentum * 1.08, scaled)));
}

function correlationAt(local: number[], global: number[], lag: number): number {
  let n = 0;
  let sumA = 0;
  let sumB = 0;

  for (let index = 0; index < local.length; index += 1) {
    const other = index - lag;
    if (other < 0 || other >= global.length) continue;
    sumA += local[index];
    sumB += global[other];
    n += 1;
  }
  if (n < 24) return -1;

  const meanA = sumA / n;
  const meanB = sumB / n;
  let cov = 0;
  let varA = 0;
  let varB = 0;

  for (let index = 0; index < local.length; index += 1) {
    const other = index - lag;
    if (other < 0 || other >= global.length) continue;
    const da = local[index] - meanA;
    const db = global[other] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }

  const denominator = Math.sqrt(varA * varB);
  return denominator === 0 ? -1 : cov / denominator;
}

/**
 * Days the local curve is ahead of the global one, found by sliding the two
 * series against each other and keeping the best-correlating offset. Positive
 * means local first. This reads the curves the chart draws, so the number and
 * the picture can never disagree.
 */
export function leadDaysBetween(local: number[], global: number[]): number {
  let bestLag = 0;
  let bestScore = -Infinity;

  for (let lag = -MAX_LAG; lag <= MAX_LAG; lag += 1) {
    const score = correlationAt(local, global, lag);
    if (score > bestScore + 1e-9) {
      bestScore = score;
      bestLag = lag;
    }
  }

  return -bestLag;
}

export type TimingKind = 'local-first' | 'global-first' | 'in-step';

export interface MarketComparison {
  localMarket: Market;
  localLabel: string;
  localSeries: number[];
  globalSeries: number[];
  localMomentum: number;
  globalMomentum: number;
  /** Positive: the local market moved first. Negative: global did. */
  leadDays: number;
  kind: TimingKind;
  headline: string;
  detail: string;
}

/** The chosen city (or its country) against the world, on one scale. */
export function compareToGlobal(signal: Signal, lens: MarketLens): MarketComparison {
  const localMarket = lens.local;
  const localSeries = marketSeries(signal, localMarket);
  const globalSeries = marketSeries(signal, lens.global);
  const leadDays = leadDaysBetween(localSeries, globalSeries);
  const days = Math.abs(leadDays);

  const kind: TimingKind =
    days < IN_STEP_DAYS ? 'in-step' : leadDays > 0 ? 'local-first' : 'global-first';

  return {
    localMarket,
    localLabel: localMarket.label,
    localSeries,
    globalSeries,
    localMomentum: marketMomentum(signal, localMarket),
    globalMomentum: marketMomentum(signal, lens.global),
    leadDays,
    kind,
    headline: headlineFor(kind, localMarket.label, days),
    detail: detailFor(kind, localMarket.label),
  };
}

function headlineFor(kind: TimingKind, localLabel: string, days: number): string {
  if (kind === 'local-first') return `${localLabel} is ${days} days ahead of the global curve`;
  if (kind === 'global-first') return `Global moved ${days} days before ${localLabel}`;
  return `${localLabel} and Global are moving in step`;
}

function detailFor(kind: TimingKind, localLabel: string): string {
  if (kind === 'local-first') {
    return `It broke here first, so the global curve is your forecast rather than your competition. Ship for ${localLabel} now and you are early everywhere else.`;
  }
  if (kind === 'global-first') {
    return `Demand is already proven abroad and has not landed here yet. The import play: rebuild what works, in the local language, before anyone local bothers.`;
  }
  return `No timing edge either way. This one is won on being specific and shipping fast, not on being early.`;
}

/** Compact card-sized version of the timing verdict. */
export function timingLabel(comparison: MarketComparison): string {
  const days = Math.abs(comparison.leadDays);
  if (comparison.kind === 'local-first') return `${days}d ahead of global`;
  if (comparison.kind === 'global-first') return `${days}d behind global`;
  return 'Level with global';
}

export const TIMING_TEXT_CLASS: Record<TimingKind, string> = {
  'local-first': 'text-up',
  'global-first': 'text-hot',
  'in-step': 'text-muted',
};

export interface RelationBadge {
  label: string;
  /** accent = measured here. muted = borrowed from somewhere else. */
  tone: 'accent' | 'muted';
}

/** The one-word status a card shows for a signal under the current market. */
export function relationBadge(signal: Signal, market: Market): RelationBadge | null {
  const relation = relationTo(signal, market);
  const home = homeMarket(signal);

  if (relation === 'observed') {
    return market.scope === 'global' ? null : { label: 'Local', tone: 'accent' };
  }
  if (relation === 'template') return { label: `From ${home.label}`, tone: 'muted' };
  if (relation === 'bound') return { label: `${home.label} only`, tone: 'muted' };
  return null;
}

/**
 * What the user needs to know before acting on a signal measured somewhere else.
 * Said out loud because the seeded playbooks are written for the city they were
 * observed in, down to the language of the first post.
 */
export function transferNote(signal: Signal, market: Market): string | null {
  const relation = relationTo(signal, market);
  if (relation !== 'template' && relation !== 'bound') return null;

  const home = homeMarket(signal);
  if (relation === 'bound') {
    return `This one only exists in ${home.label}. It is listed so you can see how it scores, not because it ports to ${market.label}.`;
  }
  return `Measured in ${home.label}, not in ${market.label}. Treat it as a template: the same demand pattern with ${market.label}'s own terms, and the playbook copy rewritten for them.`;
}

/** Which side of a comparison was measured rather than reconstructed. */
export function measuredIn(signal: Signal): string {
  return homeMarket(signal).label;
}

/**
 * How the geo code maps to the place, stated plainly. Google Trends does not
 * report every city: Berlin is a federal state so a city code exists, Munich is
 * only reportable as Bavaria, and some countries have no finer breakdown at all.
 */
export function geoNote(market: Market): string {
  if (market.scope === 'global') return 'Worldwide interest, no region filter.';
  if (market.geoLevel === 'world') {
    return `Google Trends has no region for “${market.label}”, so the curve here is modelled and source links open worldwide.`;
  }
  if (market.geoLevel === 'city') {
    return `Google Trends reports ${market.label} directly, as ${market.geo}.`;
  }
  if (market.geoLevel === 'region') {
    return `${market.label} is reported by Google Trends as ${market.geoName} (${market.geo}) — the closest region it breaks out.`;
  }
  return `Google Trends has no sub-region for ${market.label}, so it reads at country level (${market.geo}).`;
}

/** Header line under the switcher: what this market is and what was measured in it. */
export function marketBlurb(market: Market, observed: number): string {
  if (market.scope === 'global') {
    return 'Worldwide interest. Biggest prize, hardest room.';
  }
  if (market.scope === 'country') {
    return observed > 0
      ? `${observed} signals measured nationally. More volume than the city, far less competition than English.`
      : `Nothing measured at national level here yet — you are reading the global set through a ${market.label} lens.`;
  }
  if (observed > 0) {
    return `${observed} signals measured in ${market.label}. City-level demand: small market, thin competition, fast to test.`;
  }
  return `No signals measured in ${market.label} yet. You are reading the global set through a ${market.label} lens, with plays from other cities marked as templates.`;
}
