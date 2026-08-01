import { Pressable, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { TagRow } from '@/components/TagRow';
import { TrendTimeline } from '@/components/TrendTimeline';
import { AppText } from '@/components/ui/Text';
import { type ArchiveEntry, flaggedLabel, STAGE_TEXT_CLASS, stageLabel } from '@/lib/archive';
import { NICHE_LABEL } from '@/lib/data/catalog';
import { formatVolume, windowLabel } from '@/lib/format';
import { palette } from '@/lib/palette';
import { tagsFor, type Tag } from '@/lib/tags';
import { cn } from '@/lib/utils';
import { signedPct } from '@/lib/watch';

interface ArchiveCardProps {
  entry: ArchiveEntry;
  opened: boolean;
  activeTagIds: string[];
  onPress: () => void;
  onTagPress: (tag: Tag) => void;
}

/** One past breakout: when it was flagged, and what the curve did after that. */
export function ArchiveCard({
  entry,
  opened,
  activeTagIds,
  onPress,
  onTagPress,
}: ArchiveCardProps) {
  const { signal, changePct, valueThen, valueNow } = entry;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${signal.keyword}, ${flaggedLabel(entry.flaggedDaysAgo)}`}
      className="border-border bg-panel gap-3 rounded-2xl border p-4 active:opacity-80"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <AppText
            weight="semibold"
            className="text-ink-dim text-[10px] uppercase"
            style={{ letterSpacing: 1.2 }}
          >
            {NICHE_LABEL[signal.niche] ?? signal.niche} · {flaggedLabel(entry.flaggedDaysAgo)}
          </AppText>
          <AppText weight="semibold" className="text-foreground text-[16px] leading-6">
            {signal.keyword}
          </AppText>
        </View>
        <AppText weight="semibold" className={cn('text-[11px]', STAGE_TEXT_CLASS[entry.stage])}>
          {stageLabel(entry.stage)}
        </AppText>
      </View>

      <View className="border-border bg-panel-raised flex-row items-center justify-between rounded-xl border px-3 py-2.5">
        <View className="gap-0.5">
          <AppText
            weight="semibold"
            className="text-ink-dim text-[9px] uppercase"
            style={{ letterSpacing: 1 }}
          >
            Interest then → now
          </AppText>
          <AppText weight="bold" className="text-foreground text-[15px]">
            {Math.round(valueThen)} → {Math.round(valueNow)}
          </AppText>
        </View>
        <View className="items-end gap-0.5">
          <AppText
            weight="semibold"
            className="text-ink-dim text-[9px] uppercase"
            style={{ letterSpacing: 1 }}
          >
            Since flagged
          </AppText>
          <AppText
            weight="bold"
            className={cn('text-[15px]', changePct >= 0 ? 'text-up' : 'text-down')}
          >
            {signedPct(changePct)}
          </AppText>
        </View>
      </View>

      <TrendTimeline
        history={entry.history}
        range={Math.max(21, entry.flaggedDaysAgo + 10)}
        markerIndex={entry.flaggedIndex}
        markerLabel="Flagged here"
        height={70}
        gradientId={`archive-${signal.id}`}
        color={changePct >= 0 ? palette.accent : palette.down}
      />

      <TagRow tags={tagsFor(signal)} activeIds={activeTagIds} onPress={onTagPress} size="sm" />

      <View className="border-border flex-row items-center justify-between border-t pt-3">
        <AppText weight="medium" className="text-muted text-xs">
          {formatVolume(signal.volume)}/mo · {windowLabel(signal.peakInDays)}
        </AppText>
        <View className="flex-row items-center gap-1">
          <AppText weight="semibold" className="text-up text-xs">
            {opened ? 'Playbook read' : 'Open playbook'}
          </AppText>
          <ChevronRight color={palette.accent} size={14} />
        </View>
      </View>
    </Pressable>
  );
}
