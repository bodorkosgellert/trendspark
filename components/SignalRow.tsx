import { Pressable, View } from 'react-native';
import { Eye } from 'lucide-react-native';

import { CurveThumb, type CurveTone } from '@/components/CurveThumb';
import { AppText } from '@/components/ui/Text';
import { NICHE_LABEL } from '@/lib/data/catalog';
import { competitionShort, formatVolume, windowShort } from '@/lib/format';
import { marketMomentum, marketSeries, relationBadge } from '@/lib/markets';
import { palette } from '@/lib/palette';
import type { MarketLens, Signal } from '@/lib/types';
import { cn } from '@/lib/utils';
import { signedPct } from '@/lib/watch';

interface SignalRowProps {
  signal: Signal;
  /** Read through one market lens, exactly as the full card does. */
  lens?: MarketLens;
  opened: boolean;
  watching?: boolean;
  onPress: () => void;
  onToggleWatch?: () => void;
}

function toneFor(momentum: number, peakInDays: number): CurveTone {
  if (momentum < 0) return 'down';
  return peakInDays <= 7 ? 'hot' : 'up';
}

const TONE_TEXT: Record<CurveTone, string> = {
  up: 'text-up',
  hot: 'text-hot',
  down: 'text-down',
};

/**
 * Dense list row: curve tile, keyword, one metadata line.
 *
 * The same signal as `SignalCard` with the chart, tags and buttons stripped out.
 * Density is the point — a screen that shows eight signals reads as a radar, one
 * that shows two reads as a magazine. An opened signal dims like a visited link.
 */
export function SignalRow({
  signal,
  lens,
  opened,
  watching = false,
  onPress,
  onToggleWatch,
}: SignalRowProps) {
  const momentum = lens ? marketMomentum(signal, lens.active) : signal.momentum;
  const series = lens ? marketSeries(signal, lens.active) : signal.series;
  const badge = lens ? relationBadge(signal, lens.active) : null;
  const tone = toneFor(momentum, signal.peakInDays);
  const place = badge?.label ?? (lens ? lens.active.short : signal.region);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${signal.keyword}, ${signedPct(momentum)} in ${place}`}
      className="flex-row items-center gap-3 py-2.5 active:opacity-70"
    >
      <CurveThumb series={series} tone={tone} gradientId={`thumb-${signal.id}`} />

      <View className="flex-1 gap-1">
        <AppText
          weight="semibold"
          numberOfLines={1}
          className={cn('text-[14px]', opened ? 'text-muted' : 'text-foreground')}
        >
          {signal.keyword}
        </AppText>
        <AppText numberOfLines={1} className="text-ink-dim text-[11px]">
          {(NICHE_LABEL[signal.niche] ?? signal.niche).toLowerCase()}
          {' · '}
          <AppText className={badge?.tone === 'accent' ? 'text-up' : 'text-ink-dim'}>
            {place}
          </AppText>
          {` · ${windowShort(signal.peakInDays)} · ${formatVolume(signal.volume)}/mo · ${competitionShort(signal.competition)}`}
        </AppText>
      </View>

      <AppText weight="bold" className={cn('text-[13px]', TONE_TEXT[tone])}>
        {signedPct(momentum)}
      </AppText>

      {onToggleWatch ? (
        <Pressable
          onPress={onToggleWatch}
          accessibilityRole="button"
          accessibilityState={{ selected: watching }}
          accessibilityLabel={
            watching ? `Stop tracking ${signal.keyword}` : `Track ${signal.keyword} over time`
          }
          hitSlop={6}
          className={cn(
            'h-8 w-8 items-center justify-center rounded-full border active:opacity-70',
            watching ? 'border-accent bg-accent-soft' : 'border-border bg-panel',
          )}
        >
          <Eye color={watching ? palette.accent : palette.inkDim} size={13} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}
