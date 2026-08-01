import { Pressable, View } from 'react-native';
import { ChevronRight, Check, Lock, MapPin } from 'lucide-react-native';

import { MomentumBadge } from '@/components/MomentumBadge';
import { Sparkline } from '@/components/Sparkline';
import { AppText } from '@/components/ui/Text';
import { NICHE_LABEL, UNLOCK_COST } from '@/lib/data/catalog';
import {
  competitionLabel,
  detectedLabel,
  formatVolume,
  windowLabel,
  windowTone,
} from '@/lib/format';
import { palette } from '@/lib/palette';
import type { Signal } from '@/lib/types';
import { cn } from '@/lib/utils';

const TONE_CLASS = {
  hot: 'text-hot',
  warning: 'text-hot',
  muted: 'text-ink-dim',
} as const;

interface SignalCardProps {
  signal: Signal;
  unlocked: boolean;
  onPress: () => void;
  onUnlock: () => void;
}

export function SignalCard({ signal, unlocked, onPress, onUnlock }: SignalCardProps) {
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

      <View className="border-border flex-row items-center justify-between border-t pt-3">
        <AppText weight="semibold" className={cn('text-xs', TONE_CLASS[tone])}>
          {windowLabel(signal.peakInDays)}
        </AppText>

        {unlocked ? (
          <View className="flex-row items-center gap-1">
            <Check color={palette.accent} size={14} />
            <AppText weight="semibold" className="text-up text-xs">
              Playbook ready
            </AppText>
            <ChevronRight color={palette.accent} size={14} />
          </View>
        ) : (
          <Pressable
            onPress={onUnlock}
            accessibilityRole="button"
            accessibilityLabel={`Unlock playbook for ${signal.keyword}`}
            className="bg-accent flex-row items-center gap-1.5 rounded-full px-3 py-1.5 active:opacity-80"
          >
            <Lock color={palette.accentInk} size={12} />
            <AppText weight="semibold" className="text-accent-foreground text-xs">
              Unlock · {UNLOCK_COST} credit
            </AppText>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
