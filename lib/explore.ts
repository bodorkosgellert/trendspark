import { Linking } from 'react-native';

import type { Market, Region, Signal } from '@/lib/types';

/** Google Trends geo codes for the regions the seeded feed uses. */
const GEO: Record<Region, string> = {
  Berlin: 'DE-BE',
  Germany: 'DE',
  Europe: '',
  Global: '',
};

export interface ExploreLink {
  id: string;
  label: string;
  hint: string;
  url: string;
}

function q(value: string): string {
  return encodeURIComponent(value);
}

export function trendsUrl(keyword: string, region: Region = 'Global', months = 3): string {
  const geo = GEO[region] ?? '';
  const range = `today ${months}-m`;
  return `https://trends.google.com/trends/explore?q=${q(keyword)}&date=${q(range)}${
    geo ? `&geo=${geo}` : ''
  }`;
}

/**
 * The same curve at source, for one market. A city Trends cannot break out falls
 * back to the coarsest code it does report, which is why `geoNote` exists.
 */
export function marketTrendsUrl(keyword: string, market: Market, months = 3): string {
  const geo = market.geo;
  const range = `today ${months}-m`;
  return `https://trends.google.com/trends/explore?q=${q(keyword)}&date=${q(range)}${
    geo ? `&geo=${geo}` : ''
  }`;
}

/**
 * The places a user can check a signal for themselves. Verifying the claim is
 * free and encouraged — the app charges for the plan derived from it, not for
 * the number, so hiding the primary sources would be the wrong trade.
 */
export function exploreLinks(signal: Signal): ExploreLink[] {
  const { keyword, region } = signal;
  return [
    {
      id: 'trends',
      label: 'Google Trends',
      hint: 'The interest curve behind the percentage',
      url: trendsUrl(keyword, region),
    },
    {
      id: 'search',
      label: 'Google results',
      hint: 'See who already ranks, and how thin it is',
      url: `https://www.google.com/search?q=${q(keyword)}`,
    },
    {
      id: 'reddit',
      label: 'Reddit',
      hint: 'People describing the problem in their own words',
      url: `https://www.reddit.com/search/?q=${q(keyword)}&sort=new`,
    },
    {
      id: 'youtube',
      label: 'YouTube',
      hint: 'View counts tell you if the demand converts',
      url: `https://www.youtube.com/results?search_query=${q(keyword)}`,
    },
    {
      id: 'appstore',
      label: 'App Store',
      hint: 'Check nobody shipped the obvious thing yet',
      url: `https://apps.apple.com/us/search?term=${q(keyword)}`,
    },
  ];
}

/** Maps a cited source back to a page the user can actually open. */
export function sourceUrl(source: string, keyword: string): string | null {
  const name = source.toLowerCase();

  if (name.startsWith('r/')) {
    return `https://www.reddit.com/${source}/search/?q=${q(keyword)}&restrict_sr=1&sort=new`;
  }
  if (name.includes('google trends')) {
    const region: Region = name.includes('berlin')
      ? 'Berlin'
      : name.includes('germany')
        ? 'Germany'
        : 'Global';
    return trendsUrl(keyword, region);
  }
  if (
    name.includes('berlin.de') ||
    name.includes('service portal') ||
    name.includes('jugendamt') ||
    name.includes('mietspiegel')
  ) {
    return `https://www.berlin.de/suche/?q=${q(keyword)}`;
  }
  if (name.includes('hacker news')) return `https://hn.algolia.com/?q=${q(keyword)}`;
  if (name.includes('github')) return `https://github.com/search?q=${q(keyword)}&type=repositories`;
  if (name.includes('product hunt')) return `https://www.producthunt.com/search?q=${q(keyword)}`;
  if (name.includes('youtube')) return `https://www.youtube.com/results?search_query=${q(keyword)}`;
  if (name.includes('pinterest')) return `https://www.pinterest.com/search/pins/?q=${q(keyword)}`;
  if (name.includes('amazon')) return `https://www.amazon.de/s?k=${q(keyword)}`;
  if (name.includes('etsy')) return `https://www.etsy.com/search?q=${q(keyword)}`;
  if (name.includes('steam')) return `https://store.steampowered.com/search/?term=${q(keyword)}`;
  if (name.includes('tiktok')) return 'https://ads.tiktok.com/business/creativecenter';
  if (name.startsWith('x ')) return `https://x.com/search?q=${q(keyword)}&f=live`;
  if (name.includes('upwork')) return `https://www.upwork.com/nx/search/jobs/?q=${q(keyword)}`;
  if (name.includes('nomad list')) return 'https://nomadlist.com';
  if (name.includes('notion community')) return `https://www.notion.so/help/search?q=${q(keyword)}`;

  return null;
}

/** Bare hostname of a link, e.g. `reddit.com`. Empty when it is not parseable. */
export function hostOf(url: string): string {
  const match = /^https?:\/\/([^/?#]+)/i.exec(url);
  return match ? match[1].replace(/^www\./i, '') : '';
}

/** Opens a source in the device browser. Never throws at the call site. */ export async function openExternal(
  url: string,
): Promise<boolean> {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
