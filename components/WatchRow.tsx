import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { BookOpen, Check, ChevronRight, X } from 'lucide-react-native';

import { TrendTimeline } from '@/components/TrendTimeline';
import { AppText } from '@/components/ui/Text';
import { NICHE_LABEL } from '@/lib/data/catalog';
import { formatVolume } from '@/lib/format';
import { palette } from '@/lib/palette';
import type { Signal, WatchEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  buildHistory,
  signedPct,
  STATUS_TEXT_CLASS,
  statusLabel,
  trackedLabel,
  watchStats,
} from '@/lib/watch';

interface WatchRowProps {
  signal: Signal;
  entry: WatchEntry;
  opened: boolean;
  onPress: () => void;
  onOpenPlaybook: () => void;
  onStop: () => void;
}

export function WatchRow({
  signal,
  entry,
  opened,
  onPress,
  onOpenPlaybook,
  onStop,
}: WatchRowProps) {
  const history = useMemo(() => buildHistory(signal), [signal]);
  const stats = useMemo(
    () => watchStats(signal, entry.startedAt, history),
    [signal, entry.startedAt, history],
  );

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
            {NICHE_LABEL[signal.niche] ?? signal.niche} · {trackedLabel(stats.daysWatched)}
          </AppText>
          <AppText weight="semibold" className="text-foreground text-[17px] leading-6">
            {signal.keyword}
          </AppText>
        </View>
        <Pressable
          onPress={onStop}
          accessibilityRole="button"
          accessibilityLabel={`Stop tracking ${signal.keyword}`}
          className="border-border bg-panel-raised h-7 w-7 items-center justify-center rounded-full border active:opacity-70"
        >
          <X color={palette.inkDim} size={13} />
        </Pressable>
      </View>

      <View className="border-border bg-panel-raised flex-row items-center justify-between rounded-xl border px-3 py-2.5">
        <View className="gap-0.5">
          <AppText
            weight="semibold"
            className="text-ink-dim text-[9px] uppercase"
            style={{ letterSpacing: 1 }}
          >
            Since you started
          </AppText>
          <AppText weight="bold" className={cn('text-[15px]', STATUS_TEXT_CLASS[stats.status])}>
            {signedPct(stats.changePct)} · {statusLabel(stats.status)}
          </AppText>
        </View>
        <View className="items-end gap-0.5">
          <AppText
            weight="semibold"
            className="text-ink-dim text-[9px] uppercase"
            style={{ letterSpacing: 1 }}
          >
            Window
          </AppText>
          <AppText
            weight="bold"
            className={cn('text-[15px]', stats.daysLeft <= 3 ? 'text-hot' : 'text-foreground')}
          >
            {stats.daysLeft === 0 ? 'Closed' : `${stats.daysLeft}d left`}
          </AppText>
        </View>
      </View>

      <TrendTimeline
        history={history}
        range={30}
        markerIndex={stats.startIndex}
        markerLabel="You started here"
        height={72}
        gradientId={`watch-${signal.id}`}
        color={stats.status === 'cooling' ? palette.down : palette.accent}
      />

      <AppText className="text-muted text-[13px] leading-5">{stats.verdict}</AppText>

      <View className="border-border flex-row items-center justify-between border-t pt-3">
        <AppText weight="medium" className="text-muted text-xs">
          {formatVolume(signal.volume)}/mo
        </AppText>

        {opened ? (
          <View className="flex-row items-center gap-1">
            <Check color={palette.accent} size={14} />
            <AppText weight="semibold" className="text-up text-xs">
              Playbook read
            </AppText>
            <ChevronRight color={palette.accent} size={14} />
          </View>
        ) : (
          <Pressable
            onPress={onOpenPlaybook}
            accessibilityRole="button"
            accessibilityLabel={`Open the playbook for ${signal.keyword}`}
            className="bg-accent flex-row items-center gap-1.5 rounded-full px-3 py-1.5 active:opacity-80"
          >
            <BookOpen color={palette.accentInk} size={12} />
            <AppText weight="semibold" className="text-accent-foreground text-xs">
              Playbook
            </AppText>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
