import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { ArrowUpRight, Clock3, ExternalLink, Info } from 'lucide-react-native';

import { SectionLabel } from '@/components/SectionLabel';
import { TrendTimeline } from '@/components/TrendTimeline';
import { AppText } from '@/components/ui/Text';
import { marketTrendsUrl, openExternal } from '@/lib/explore';
import { tapFeedback } from '@/lib/haptics';
import {
  compareToGlobal,
  geoNote,
  measuredIn,
  TIMING_TEXT_CLASS,
  transferNote,
} from '@/lib/markets';
import { palette } from '@/lib/palette';
import type { Market, MarketLens, Signal } from '@/lib/types';
import { cn } from '@/lib/utils';
import { signedPct } from '@/lib/watch';

interface MarketCompareProps {
  signal: Signal;
  /** The lens the feed is currently read through. */
  lens: MarketLens;
  range?: number;
}

/**
 * Local demand against worldwide demand for the same keyword, on one scale.
 *
 * The point of the panel is timing rather than size: whether a keyword broke here
 * first — in which case the global curve is a forecast — or broke abroad first, in
 * which case the play is to localise something already proven. The day count is
 * measured off the two curves drawn here, so the number and the picture agree.
 */
export function MarketCompare({ signal, lens, range = 90 }: MarketCompareProps) {
  const comparison = useMemo(() => compareToGlobal(signal, lens), [signal, lens]);
  const transfer = transferNote(signal, lens.active);
  const targets: Market[] = [comparison.localMarket, lens.global];

  const open = (target: Market) => {
    tapFeedback();
    void openExternal(marketTrendsUrl(signal.keyword, target));
  };

  return (
    <View className="border-border bg-panel gap-4 rounded-2xl border p-4">
      <SectionLabel hint={`${range}d`}>{`${comparison.localLabel} vs global`}</SectionLabel>

      <TrendTimeline
        history={comparison.localSeries}
        compare={comparison.globalSeries}
        range={range}
        height={124}
        gradientId={`markets-${signal.id}`}
        color={palette.accent}
        compareColor={palette.inkDim}
      />

      <View className="flex-row gap-3">
        <Legend
          label={comparison.localLabel}
          momentum={comparison.localMomentum}
          color={palette.accent}
          solid
        />
        <Legend
          label="Global"
          momentum={comparison.globalMomentum}
          color={palette.inkDim}
          solid={false}
        />
      </View>

      <View className="border-border gap-1.5 border-t pt-3">
        <View className="flex-row items-center gap-2">
          <Clock3
            color={comparison.kind === 'global-first' ? palette.hot : palette.accent}
            size={14}
          />
          <AppText
            weight="semibold"
            className={cn('flex-1 text-[14px]', TIMING_TEXT_CLASS[comparison.kind])}
          >
            {comparison.headline}
          </AppText>
        </View>
        <AppText className="text-muted text-[12px] leading-5">{comparison.detail}</AppText>
      </View>

      {transfer ? (
        <View className="border-border bg-panel-raised flex-row items-start gap-2.5 rounded-xl border p-3">
          <Info color={palette.hot} size={14} />
          <AppText className="text-muted flex-1 text-[12px] leading-5">{transfer}</AppText>
        </View>
      ) : null}

      <View className="flex-row gap-2">
        {targets.map((target) => (
          <Pressable
            key={target.id}
            onPress={() => open(target)}
            accessibilityRole="link"
            accessibilityLabel={`Open ${target.label} on Google Trends`}
            className="border-border bg-panel-raised flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border py-2.5 active:opacity-70"
          >
            <AppText weight="semibold" className="text-muted text-[12px]" numberOfLines={1}>
              {`${target.label} at source`}
            </AppText>
            <ExternalLink color={palette.inkDim} size={12} />
          </Pressable>
        ))}
      </View>

      <AppText className="text-ink-dim text-[11px] leading-4">
        {`Measured in ${measuredIn(signal)}. The other market is reconstructed from the same curve, offset by the lag between them, until the pipeline stores one observation series per region. ${geoNote(comparison.localMarket)}`}
      </AppText>
    </View>
  );
}

function Legend({
  label,
  momentum,
  color,
  solid,
}: {
  label: string;
  momentum: number;
  color: string;
  solid: boolean;
}) {
  return (
    <View className="flex-1 gap-1">
      <View className="flex-row items-center gap-2">
        <View
          style={{ backgroundColor: color, height: 2, width: 14, opacity: solid ? 1 : 0.7 }}
          className={cn(!solid && 'rounded-full')}
        />
        <AppText weight="medium" className="text-muted text-[11px]" numberOfLines={1}>
          {label}
        </AppText>
      </View>
      <View className="flex-row items-center gap-1">
        {momentum > 0 ? <ArrowUpRight color={color} size={12} /> : null}
        <AppText weight="semibold" className="text-foreground text-[15px]">
          {signedPct(momentum)}
        </AppText>
      </View>
    </View>
  );
}
