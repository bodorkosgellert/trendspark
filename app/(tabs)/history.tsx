import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { History, RotateCcw } from 'lucide-react-native';

import { ArchiveCard } from '@/components/ArchiveCard';
import { SectionLabel } from '@/components/SectionLabel';
import { SupportPill } from '@/components/SupportPill';
import { TagRow } from '@/components/TagRow';
import { AppText } from '@/components/ui/Text';
import { buildArchive, PERIODS, type PeriodId, periodOf, stillClimbingCount } from '@/lib/archive';
import { tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import { useSignalStore } from '@/lib/store/useSignalStore';
import { allTags, hasTag, type Tag } from '@/lib/tags';
import { cn } from '@/lib/utils';

type PeriodFilter = PeriodId | 'all';

const PERIOD_FILTERS: { id: PeriodFilter; label: string }[] = [
  { id: 'all', label: 'All time' },
  ...PERIODS.map((period) => ({ id: period.id, label: period.label })),
];

export default function HistoryScreen() {
  const { tag: tagParam } = useLocalSearchParams<{ tag?: string }>();
  const openedIds = useSignalStore((state) => state.openedIds);

  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [tagIds, setTagIds] = useState<string[]>([]);

  useEffect(() => {
    if (tagParam) setTagIds([tagParam]);
  }, [tagParam]);

  const entries = useMemo(() => buildArchive(), []);
  const tags = useMemo(() => allTags(), []);

  const filtered = useMemo(
    () =>
      entries.filter((entry) => {
        const inPeriod = period === 'all' || periodOf(entry.flaggedDaysAgo) === period;
        if (!inPeriod) return false;
        if (tagIds.length === 0) return true;
        return tagIds.some((id) => hasTag(entry.signal, id));
      }),
    [entries, period, tagIds],
  );

  const climbing = stillClimbingCount(filtered);
  const filtersOn = period !== 'all' || tagIds.length > 0;

  const toggleTag = (tag: Tag) => {
    tapFeedback();
    setTagIds((current) =>
      current.includes(tag.id) ? current.filter((id) => id !== tag.id) : [...current, tag.id],
    );
  };

  return (
    <View className="bg-background flex-1">
      <View className="pt-safe-offset-3 border-border bg-canvas flex-row items-center justify-between border-b px-5 pb-3">
        <View className="flex-row items-center gap-2">
          <History color={palette.accent} size={17} />
          <AppText weight="bold" className="text-foreground text-[17px]">
            History
          </AppText>
        </View>
        <SupportPill onPress={() => router.push('/contribute')} />
      </View>

      <FlashList
        data={filtered}
        keyExtractor={(item) => item.signal.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="gap-5 pb-4">
            <View className="border-border bg-panel gap-2 rounded-2xl border p-4">
              <AppText weight="semibold" className="text-foreground text-[17px] leading-7">
                {climbing} of {filtered.length}{' '}
                {filtered.length === 1 ? 'signal is' : 'signals are'} still well above where the
                radar flagged them.
              </AppText>
              <AppText className="text-muted text-[13px] leading-5">
                Every signal here was flagged on a date. Tap one to see the curve with a marker at
                the day it broke out, so you can judge whether waiting would have been better than
                acting.
              </AppText>
              <AppText className="text-ink-dim text-[11px] leading-4">
                This view has survivorship bias by construction: signals that decayed leave the live
                feed, so what remains looks better than the true hit rate. Curves before the tracked
                window are reconstructed from each signal&apos;s stored shape until the pipeline
                keeps real daily observations.
              </AppText>
            </View>

            <View className="gap-2">
              <SectionLabel hint={`${entries.length} flagged`}>When it broke out</SectionLabel>
              <View className="flex-row flex-wrap gap-2">
                {PERIOD_FILTERS.map((item) => {
                  const active = period === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        tapFeedback();
                        setPeriod(item.id);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      className={cn(
                        'rounded-full border px-3 py-2 active:opacity-70',
                        active ? 'border-accent bg-accent-soft' : 'border-border bg-panel',
                      )}
                    >
                      <AppText
                        weight="semibold"
                        className={cn('text-xs', active ? 'text-up' : 'text-muted')}
                      >
                        {item.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="gap-2">
              <SectionLabel hint={tagIds.length > 0 ? 'Any of these' : `${tags.length} tags`}>
                Tags
              </SectionLabel>
              <TagRow tags={tags} activeIds={tagIds} onPress={toggleTag} />
            </View>

            {filtersOn ? (
              <Pressable
                onPress={() => {
                  tapFeedback();
                  setPeriod('all');
                  setTagIds([]);
                }}
                accessibilityRole="button"
                className="border-border bg-panel flex-row items-center justify-center gap-2 rounded-full border py-2.5 active:opacity-70"
              >
                <RotateCcw color={palette.muted} size={13} />
                <AppText weight="medium" className="text-muted text-xs">
                  Clear filters
                </AppText>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <ArchiveCard
            entry={item}
            opened={openedIds.includes(item.signal.id)}
            activeTagIds={tagIds}
            onPress={() => {
              tapFeedback();
              router.push({ pathname: '/signal/[id]', params: { id: item.signal.id } });
            }}
            onTagPress={toggleTag}
          />
        )}
        ListEmptyComponent={
          <View className="items-center gap-2 py-16">
            <AppText weight="semibold" className="text-foreground">
              Nothing matches those filters
            </AppText>
            <AppText className="text-muted max-w-72 text-center text-sm">
              Try a wider period, or clear the tags to see all flagged signals.
            </AppText>
          </View>
        }
      />
    </View>
  );
}
