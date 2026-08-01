import { Pressable, View } from 'react-native';
import { BookOpen, Check, ChevronRight, Eye, MapPin } from 'lucide-react-native';

import { MomentumBadge } from '@/components/MomentumBadge';
import { Sparkline } from '@/components/Sparkline';
import { TagRow } from '@/components/TagRow';
import { AppText } from '@/components/ui/Text';
import { NICHE_LABEL } from '@/lib/data/catalog';
import {
  competitionLabel,
  detectedLabel,
  formatVolume,
  windowLabel,
  windowTone,
} from '@/lib/format';
import { palette } from '@/lib/palette';
import { tagsFor } from '@/lib/tags';
import type { Signal } from '@/lib/types';
import { cn } from '@/lib/utils';

const TONE_CLASS = {
  hot: 'text-hot',
  warning: 'text-hot',
  muted: 'text-ink-dim',
} as const;

interface SignalCardProps {
  signal: Signal;
  /** Whether the user has already read this playbook. Nothing is gated. */
  opened: boolean;
  onPress: () => void;
  onOpenPlaybook: () => void;
  watching?: boolean;
  /** Adds a free track toggle to the card footer. */
  onToggleWatch?: () => void;
}

export function SignalCard({
  signal,
  opened,
  onPress,
  onOpenPlaybook,
  watching = false,
  onToggleWatch,
}: SignalCardProps) {
  const tone = windowTone(signal.peakInDays);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="border-border bg-panel gap-3 rounded-2xl border p-4 active:opacity-80"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <AppText
            weight="semibold"
            className="text-ink-dim text-[10px] uppercase"
            style={{ letterSpacing: 1.2 }}
          >
            {NICHE_LABEL[signal.niche] ?? signal.niche} · {detectedLabel(signal.detectedAt)}
          </AppText>
          <AppText weight="semibold" className="text-foreground text-[17px] leading-6">
            {signal.keyword}
          </AppText>
        </View>
        <MomentumBadge momentum={signal.momentum} />
      </View>

      <View className="flex-row items-center gap-3">
        <AppText weight="medium" className="text-muted text-xs">
          {formatVolume(signal.volume)}/mo
        </AppText>
        <View className="bg-grid h-1 w-1 rounded-full" />
        <AppText weight="medium" className="text-muted text-xs">
          {competitionLabel(signal.competition)}
        </AppText>
        <View className="bg-grid h-1 w-1 rounded-full" />
        <View className="flex-row items-center gap-1">
          <MapPin color={palette.inkDim} size={11} />
          <AppText weight="medium" className="text-muted text-xs">
            {signal.region}
          </AppText>
        </View>
      </View>

      <Sparkline series={signal.series} gradientId={`spark-${signal.id}`} height={40} />

      <TagRow tags={tagsFor(signal)} size="sm" />

      <View className="border-border flex-row items-center justify-between border-t pt-3">
        <AppText weight="semibold" className={cn('text-xs', TONE_CLASS[tone])}>
          {windowLabel(signal.peakInDays)}
        </AppText>

        <View className="flex-row items-center gap-2">
          {onToggleWatch ? (
            <Pressable
              onPress={onToggleWatch}
              accessibilityRole="button"
              accessibilityState={{ selected: watching }}
              accessibilityLabel={
                watching ? `Stop tracking ${signal.keyword}` : `Track ${signal.keyword} over time`
              }
              className={cn(
                'flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 active:opacity-70',
                watching ? 'border-accent bg-accent-soft' : 'border-border bg-panel-raised',
              )}
            >
              <Eye color={watching ? palette.accent : palette.muted} size={12} />
              <AppText
                weight="semibold"
                className={cn('text-xs', watching ? 'text-up' : 'text-muted')}
              >
                {watching ? 'Tracking' : 'Track'}
              </AppText>
            </Pressable>
          ) : null}

          <Pressable
            onPress={onOpenPlaybook}
            accessibilityRole="button"
            accessibilityLabel={`Open the playbook for ${signal.keyword}`}
            className={cn(
              'flex-row items-center gap-1.5 rounded-full px-3 py-1.5 active:opacity-80',
              opened ? 'border-border bg-panel-raised border' : 'bg-accent',
            )}
          >
            {opened ? (
              <Check color={palette.accent} size={12} />
            ) : (
              <BookOpen color={palette.accentInk} size={12} />
            )}
            <AppText
              weight="semibold"
              className={cn('text-xs', opened ? 'text-up' : 'text-accent-foreground')}
            >
              {opened ? 'Read again' : 'Playbook'}
            </AppText>
            {opened ? <ChevronRight color={palette.accent} size={12} /> : null}
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
