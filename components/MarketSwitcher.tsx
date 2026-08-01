import { Pressable, View } from 'react-native';
import { Globe, MapPin, Search } from 'lucide-react-native';

import { AppText } from '@/components/ui/Text';
import { tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import type { Market, MarketLens, MarketScope } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MarketSwitcherProps {
  lens: MarketLens;
  onScope: (scope: MarketScope) => void;
  /** Opens the city search. Omit to render the widths on their own. */
  onChangeCity?: () => void;
  /** Signals actually measured in each market, keyed by market id. */
  counts?: Record<string, number>;
}

/** A country label is only useful if it fits; otherwise the ISO code has to do. */
function segmentLabel(market: Market): string {
  if (market.scope === 'country') return market.label.length > 12 ? market.short : market.label;
  return market.label;
}

/**
 * The lens the whole feed is read through: the user's city, the country around
 * it, and the world. The city comes first because a city-sized market is the only
 * one a solo builder can realistically win this week, and the global column exists
 * to say whether they are early or late.
 */
export function MarketSwitcher({ lens, onScope, onChangeCity, counts }: MarketSwitcherProps) {
  return (
    <View className="gap-2">
      {onChangeCity ? (
        <Pressable
          onPress={() => {
            tapFeedback();
            onChangeCity();
          }}
          accessibilityRole="button"
          accessibilityLabel={`Change city. Currently ${lens.city.label}`}
          className="border-border bg-panel flex-row items-center gap-2.5 rounded-2xl border px-3.5 py-3 active:opacity-70"
        >
          <MapPin color={palette.accent} size={14} />
          <View className="flex-1">
            <AppText weight="semibold" className="text-foreground text-[14px]" numberOfLines={1}>
              {lens.city.label}
            </AppText>
            <AppText weight="medium" className="text-ink-dim text-[11px]" numberOfLines={1}>
              {lens.city.city?.countryName || 'Custom market'}
            </AppText>
          </View>
          <View className="border-border bg-panel-raised flex-row items-center gap-1.5 rounded-full border px-2.5 py-1.5">
            <Search color={palette.muted} size={11} />
            <AppText weight="semibold" className="text-muted text-[11px]">
              Change
            </AppText>
          </View>
        </Pressable>
      ) : null}

      <View className="border-border bg-panel flex-row gap-1 rounded-2xl border p-1">
        {lens.markets.map((market) => {
          const active = lens.active.id === market.id;
          const Icon = market.scope === 'global' ? Globe : MapPin;
          const observed = counts?.[market.id];

          return (
            <Pressable
              key={market.id}
              onPress={() => {
                tapFeedback();
                onScope(market.scope);
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Read the feed at ${market.label} level`}
              className={cn(
                'flex-1 items-center gap-0.5 rounded-xl px-1 py-2.5 active:opacity-70',
                active && 'bg-accent-soft border-accent border',
              )}
            >
              <View className="flex-row items-center gap-1.5">
                <Icon color={active ? palette.accent : palette.inkDim} size={13} />
                <AppText
                  weight="semibold"
                  className={cn('text-[13px]', active ? 'text-up' : 'text-muted')}
                  numberOfLines={1}
                >
                  {segmentLabel(market)}
                </AppText>
              </View>
              {observed !== undefined ? (
                <AppText weight="medium" className="text-ink-dim text-[10px]">
                  {observed === 0 ? 'derived' : `${observed} measured`}
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
