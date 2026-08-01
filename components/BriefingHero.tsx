import { Pressable, View } from 'react-native';
import { Headphones, Play } from 'lucide-react-native';

import { Waveform } from '@/components/Waveform';
import { AppText } from '@/components/ui/Text';
import { LinearGradient } from '@/components/ui/primitives/LinearGradient';
import { formatClock, type BriefingScript } from '@/lib/briefing';
import { palette } from '@/lib/palette';
import type { Signal } from '@/lib/types';

interface BriefingHeroProps {
  script: BriefingScript;
  signals: Signal[];
  /** How many briefings this user has played, shown as a running total. */
  playCount: number;
  onPress: () => void;
}

export function BriefingHero({ script, signals, playCount, onPress }: BriefingHeroProps) {
  const closing = signals.filter((signal) => signal.peakInDays <= 7).length;

  const summary =
    closing > 0
      ? `${signals.length} signals moved. ${closing} ${closing === 1 ? 'window is' : 'windows are'} closing this week.`
      : `${signals.length} signals moved enough to matter since yesterday.`;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="active:opacity-90">
      <LinearGradient
        colors={['rgba(169,239,75,0.14)', 'rgba(169,239,75,0.02)', palette.panel]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="border-border gap-4 overflow-hidden rounded-3xl border p-5"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Headphones color={palette.accent} size={14} />
            <AppText
              weight="semibold"
              className="text-up text-[10px] uppercase"
              style={{ letterSpacing: 1.4 }}
            >
              Today&apos;s briefing
            </AppText>
          </View>
          <AppText weight="semibold" className="text-muted text-xs">
            {formatClock(script.durationMs)}
          </AppText>
        </View>

        <AppText weight="semibold" className="text-foreground text-[21px] leading-7">
          {summary}
        </AppText>

        <View className="flex-row items-center gap-4">
          <View className="bg-accent h-12 w-12 items-center justify-center rounded-full">
            <Play color={palette.accentInk} size={20} fill={palette.accentInk} />
          </View>
          <View className="flex-1">
            <Waveform active={false} height={32} />
          </View>
        </View>

        <View className="border-border flex-row items-center justify-between border-t pt-3">
          <AppText weight="medium" className="text-ink-dim flex-1 text-xs" numberOfLines={1}>
            {signals
              .slice(0, 3)
              .map((signal) => signal.keyword)
              .join('  ·  ')}
          </AppText>
          {playCount > 0 ? (
            <AppText weight="semibold" className="text-up ml-3 text-[11px]">
              {playCount === 1 ? '1 played' : `${playCount} played`}
            </AppText>
          ) : (
            <AppText weight="semibold" className="text-up ml-3 text-[11px]">
              Free
            </AppText>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}
