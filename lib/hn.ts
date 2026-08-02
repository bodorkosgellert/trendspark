/**
 * t₀ probe — when an idea first surfaced in public, from Hacker News.
 *
 * HN's Algolia index is free, needs no key, sends CORS headers and reaches back
 * to 2006, which makes it the only "first mention" source that can be queried
 * straight from the client on both web and native. It answers the one question
 * momentum cannot: how long has this idea existed, and therefore how much of
 * its window is already spent.
 *
 * Three honest limits, all surfaced in the UI rather than buried here:
 * 1. HN is English-speaking and developer-heavy. A German bureaucracy keyword
 *    will have no trace at all, and that absence is information, not a failure.
 * 2. A first mention is the first *indexed* mention, not the invention.
 * 3. Matching is lexical. A renamed idea reads as younger than it is.
 */

const BASE = 'https://hn.algolia.com/api/v1';

/** Algolia caps a page at 1000 hits and pagination at 1000 results. */
const PAGE_MAX = 1000;

/** Roughly HN's first item, as a unix second. Nothing exists before this. */
const HN_EPOCH_SEC = Math.floor(Date.UTC(2006, 9, 1) / 1000);

const MONTH_SEC = 30 * 24 * 60 * 60;
const YEAR_SEC = 365 * 24 * 60 * 60;
const TIMEOUT_MS = 9000;

/** Story and comment matches together: an idea often surfaces in a comment first. */
const TAGS = '(story,comment)';

/**
 * Generic search modifiers that carry no topic. Dropping them is what turns a
 * long-tail search phrase into something HN can actually match.
 */
const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'best',
  'buy',
  'can',
  'cheap',
  'compare',
  'comparison',
  'do',
  'for',
  'free',
  'from',
  'get',
  'guide',
  'how',
  'in',
  'is',
  'it',
  'me',
  'my',
  'near',
  'of',
  'on',
  'online',
  'or',
  'review',
  'reviews',
  'the',
  'tips',
  'to',
  'top',
  'tutorial',
  'vs',
  'with',
  'without',
  'your',
  // German equivalents, same reasoning
  'beste',
  'das',
  'der',
  'die',
  'für',
  'kaufen',
  'mit',
  'ohne',
  'oder',
  'prüfen',
  'tipps',
  'und',
  'vergleich',
  'wie',
]);

export interface HnMention {
  id: string;
  title: string;
  /** Link to the HN item, which always exists, unlike the story url. */
  hnUrl: string;
  createdAt: string;
  ageDays: number;
  points: number;
  isComment: boolean;
}

export interface HnTrace {
  /** The terms actually sent to HN, shown on screen so the count is checkable. */
  query: string;
  searchUrl: string;
  /** All-time matches, stories and comments. */
  total: number;
  /** Matches in the trailing 365 days — whether the idea is still being talked about. */
  lastYear: number;
  /** Oldest indexed match. Null when there are none, or when the lookup failed. */
  first: HnMention | null;
  /** Highest-ranked match, as the one link worth opening. */
  top: HnMention | null;
  /** True when the oldest match sits in a band wider than the true first day. */
  approximate: boolean;
}

interface AlgoliaHit {
  objectID?: string;
  title?: string | null;
  story_title?: string | null;
  points?: number | null;
  created_at?: string | null;
  created_at_i?: number | null;
  comment_text?: string | null;
}

interface AlgoliaResponse {
  hits?: AlgoliaHit[];
  nbHits?: number;
}

function isAlgoliaResponse(data: unknown): data is AlgoliaResponse {
  return typeof data === 'object' && data !== null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const cache = new Map<string, HnTrace>();
const inFlight = new Map<string, Promise<HnTrace | null>>();

/** Distinctive terms of a search phrase, at most three, in original order. */
export function hnQuery(keyword: string): string {
  const cleaned = keyword.toLowerCase().replace(/[^0-9a-z\u00c0-\u024f\s-]+/g, ' ');
  const tokens = cleaned
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token) && !/^\d{4}$/.test(token));
  const chosen = tokens.length > 0 ? tokens : cleaned.split(/\s+/).filter(Boolean);
  return chosen.slice(0, 3).join(' ');
}

export function hnSearchUrl(query: string): string {
  return `https://hn.algolia.com/?dateRange=all&page=0&prefix=false&query=${encodeURIComponent(
    query,
  )}&sort=byPopularity&type=all`;
}

async function request(
  path: 'search' | 'search_by_date',
  params: Record<string, string>,
): Promise<AlgoliaResponse | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const query = new URLSearchParams({ tags: TAGS, ...params }).toString();
    const response = await fetch(`${BASE}/${path}?${query}`, { signal: controller.signal });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return isAlgoliaResponse(data) ? data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function countMatches(query: string, numericFilters?: string): Promise<number | null> {
  const response = await request('search', {
    query,
    hitsPerPage: '0',
    ...(numericFilters ? { numericFilters } : {}),
  });
  if (!response || typeof response.nbHits !== 'number') return null;
  return response.nbHits;
}

function toMention(hit: AlgoliaHit): HnMention | null {
  const id = hit.objectID;
  const created = hit.created_at;
  if (!id || !created) return null;
  const comment = !hit.title && Boolean(hit.comment_text);
  const title = hit.title ?? hit.story_title ?? 'Comment thread';
  return {
    id,
    title,
    hnUrl: `https://news.ycombinator.com/item?id=${id}`,
    createdAt: created,
    ageDays: Math.max(0, Math.floor((Date.now() - new Date(created).getTime()) / DAY_MS)),
    points: typeof hit.points === 'number' ? hit.points : 0,
    isComment: comment,
  };
}

function lastHit(response: AlgoliaResponse | null): AlgoliaHit | null {
  const hits = response?.hits;
  if (!hits || hits.length === 0) return null;
  return hits[hits.length - 1];
}

/**
 * Oldest indexed match.
 *
 * Algolia cannot sort ascending by date, so there are two routes. Under 1000
 * matches, one descending page contains everything and the last hit is the
 * oldest — a single request. Above that, bisect the time axis on
 * `created_at_i` until the earliest match is pinned to a band under a month
 * wide (about eight probes over twenty years), then read the oldest hit inside
 * that band.
 */
async function oldestMatch(
  query: string,
  total: number,
): Promise<{ hit: AlgoliaHit | null; approximate: boolean }> {
  if (total <= PAGE_MAX) {
    const response = await request('search_by_date', {
      query,
      hitsPerPage: String(PAGE_MAX),
    });
    return { hit: lastHit(response), approximate: false };
  }

  let empty = HN_EPOCH_SEC; // known to have nothing before it
  let found = Math.floor(Date.now() / 1000); // known to have something before it

  while (found - empty > MONTH_SEC) {
    const mid = Math.floor((empty + found) / 2);
    const count = await countMatches(query, `created_at_i<${mid}`);
    if (count === null) return { hit: null, approximate: true };
    if (count > 0) found = mid;
    else empty = mid;
  }

  const response = await request('search_by_date', {
    query,
    hitsPerPage: String(PAGE_MAX),
    numericFilters: `created_at_i<${found}`,
  });
  const hit = lastHit(response);
  const band = response?.nbHits ?? 0;
  return { hit, approximate: band > PAGE_MAX };
}

async function topMatch(query: string): Promise<AlgoliaHit | null> {
  const response = await request('search', { query, hitsPerPage: '1' });
  const hits = response?.hits;
  return hits && hits.length > 0 ? hits[0] : null;
}

async function load(keyword: string): Promise<HnTrace | null> {
  const query = hnQuery(keyword);
  const searchUrl = hnSearchUrl(query);
  const total = await countMatches(query);

  if (total === null) return null;

  if (total === 0) {
    return { query, searchUrl, total: 0, lastYear: 0, first: null, top: null, approximate: false };
  }

  const sinceYear = Math.floor((Date.now() - YEAR_SEC * 1000) / 1000);
  const [lastYear, oldest, top] = await Promise.all([
    countMatches(query, `created_at_i>${sinceYear}`),
    oldestMatch(query, total),
    topMatch(query),
  ]);

  return {
    query,
    searchUrl,
    total,
    lastYear: lastYear ?? 0,
    first: oldest.hit ? toMention(oldest.hit) : null,
    top: top ? toMention(top) : null,
    approximate: oldest.approximate,
  };
}

/**
 * Cached per keyword for the session. Returns null only when HN could not be
 * reached — an empty trace is a result, and a different thing entirely.
 */
export function fetchHnTrace(keyword: string): Promise<HnTrace | null> {
  const cached = cache.get(keyword);
  if (cached) return Promise.resolve(cached);

  const pending = inFlight.get(keyword);
  if (pending) return pending;

  const pendingRequest = load(keyword)
    .then((trace) => {
      if (trace) cache.set(keyword, trace);
      return trace;
    })
    .finally(() => {
      inFlight.delete(keyword);
    });

  inFlight.set(keyword, pendingRequest);
  return pendingRequest;
}

/** Drops the cached trace so a failed or stale lookup can be retried. */
export function clearHnTrace(keyword: string): void {
  cache.delete(keyword);
}
