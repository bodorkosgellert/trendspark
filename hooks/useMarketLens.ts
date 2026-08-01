import { useMemo } from 'react';

import { buildLens } from '@/lib/markets';
import { usePrefsStore } from '@/lib/store/usePrefsStore';
import type { MarketLens } from '@/lib/types';

/**
 * The market lens every screen reads through: the chosen city, its country, the
 * world, and which of the three is active. Built here rather than in a selector
 * so the object identity stays stable between renders.
 */
export function useMarketLens(): MarketLens {
  const city = usePrefsStore((state) => state.city);
  const scope = usePrefsStore((state) => state.marketScope);
  return useMemo(() => buildLens(city, scope), [city, scope]);
}
