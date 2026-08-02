import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ExternalLink, Swords, X } from 'lucide-react-native';

import { Favicon } from '@/components/Favicon';
import { SectionLabel } from '@/components/SectionLabel';
import { AppText } from '@/components/ui/Text';
import {
  CONCENTRATION_STATS,
  CROWD_CASES,
  CROWD_RULE,
  SURVIVAL_NOTE,
  SURVIVAL_STATS,
  WINNER_BY_CLASS,
  type CrowdCase,
  type CrowdStat,
  type Source,
} from '@/lib/crowding';
import { WINDOW_CLASSES, WINDOW_ORDER, WINDOW_TEXT_CLASS } from '@/lib/emergence';
import { openExternal } from '@/lib/explore';
import { tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import { cn } from '@/lib/utils';

function SourceRow({ source }: { source: Source }) {
  return (
    <Pressable
      onPress={() => {
        tapFeedback();
        void openExternal(source.url);
      }}
      accessibilityRole="link"
      accessibilityLabel={`Open the source at ${source.label}`}
      className="flex-row items-center gap-2 active:opacity-70"
    >
      <Favicon url={source.url} label={source.label} size={13} />
      <AppText weight="medium" className="text-ink-dim flex-1 text-[11px]">
        {source.label}
      </AppText>
      <ExternalLink color={palette.inkDim} size={12} />
    </Pressable>
  );
}

function CaseCard({ item }: { item: CrowdCase }) {
  const cls = WINDOW_CLASSES[item.windowClass];
  return (
    <View className="border-border bg-panel gap-3 rounded-2xl border p-4">
      <View className="gap-1">
        <View className="flex-row items-start justify-between gap-3">
          <AppText weight="semibold" className="text-foreground flex-1 text-[14px] leading-5">
            {item.title}
          </AppText>
          <AppText className="text-ink-dim text-[11px]">{item.year}</AppText>
        </View>
        <AppText weight="medium" className={cn('text-[11px]', WINDOW_TEXT_CLASS[cls.tone])}>
          {cls.label}
        </AppText>
      </View>

      <View className="border-border bg-canvas gap-2 rounded-xl border p-3">
        <View className="gap-0.5">
          <AppText
            weight="semibold"
            className="text-ink-dim text-[10px] uppercase"
            style={{ letterSpacing: 1 }}
          >
            First
          </AppText>
          <AppText className="text-muted text-[12px] leading-5">{item.first}</AppText>
        </View>
        <View className="bg-border h-px" />
        <View className="gap-0.5">
          <AppText
            weight="semibold"
            className="text-ink-dim text-[10px] uppercase"
            style={{ letterSpacing: 1 }}
          >
            Kept it
          </AppText>
          <AppText className="text-up text-[12px] leading-5">{item.won}</AppText>
        </View>
      </View>

      <AppText className="text-muted text-[12px] leading-5">{item.detail}</AppText>
      <AppText weight="medium" className="text-foreground text-[12px] leading-5">
        {item.lesson}
      </AppText>
      <SourceRow source={item.source} />
    </View>
  );
}

function StatCard({ item }: { item: CrowdStat }) {
  return (
    <View className="border-border bg-panel gap-2 rounded-2xl border p-4">
      <View className="flex-row items-end gap-2">
        <AppText weight="bold" className="text-foreground text-[22px]">
          {item.value}
        </AppText>
        <AppText weight="medium" className="text-muted flex-1 pb-1 text-[12px] leading-4">
          {item.label}
        </AppText>
      </View>
      <AppText className="text-muted text-[12px] leading-5">{item.note}</AppText>
      <SourceRow source={item.source} />
    </View>
  );
}

/**
 * The competitive half of the window model, in one place.
 *
 * Reached from any signal and from You. Everything on this screen is either a
 * documented case or a published third-party estimate with a link, for the same
 * reason History states its survivorship bias out loud: the product's only real
 * asset is that a sceptical reader can check the claim. Nothing here predicts
 * what a specific signal will earn, and it must not start to.
 */
export default function CrowdingScreen() {
  const { case: caseId } = useLocalSearchParams<{ case?: string }>();

  const cases = useMemo(() => {
    if (!caseId) return CROWD_CASES;
    const first = CROWD_CASES.find((item) => item.id === caseId);
    if (!first) return CROWD_CASES;
    return [first, ...CROWD_CASES.filter((item) => item.id !== caseId)];
  }, [caseId]);

  return (
    <View className="bg-background flex-1">
      <View className="pt-safe-offset-3 border-border bg-canvas flex-row items-center justify-between border-b px-5 pb-3">
        <AppText weight="semibold" className="text-foreground text-[15px]">
          Who wins a window
        </AppText>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="border-border bg-panel h-9 w-9 items-center justify-center rounded-full border active:opacity-70"
        >
          <X color={palette.muted} size={16} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-5 gap-6 pb-safe-offset-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <View className="bg-accent-soft h-11 w-11 items-center justify-center rounded-2xl">
            <Swords color={palette.accent} size={22} />
          </View>
          <AppText weight="bold" className="text-foreground text-[24px] leading-8">
            {CROWD_RULE.headline}
          </AppText>
          <AppText className="text-muted text-[14px] leading-6">{CROWD_RULE.body}</AppText>
          <View className="border-border bg-panel rounded-2xl border p-4">
            <AppText className="text-foreground text-[13px] leading-6">
              {CROWD_RULE.closing}
            </AppText>
          </View>
        </View>

        <View className="gap-3">
          <SectionLabel hint={`${CROWD_CASES.length} cases`}>What actually happened</SectionLabel>
          {cases.map((item) => (
            <CaseCard key={item.id} item={item} />
          ))}
        </View>

        <View className="gap-3">
          <SectionLabel>How many turn up, by window</SectionLabel>
          <View className="border-border bg-panel gap-3 rounded-2xl border p-4">
            {WINDOW_ORDER.map((id, index) => {
              const cls = WINDOW_CLASSES[id];
              return (
                <View key={id} className="gap-1.5">
                  {index > 0 ? <View className="bg-border mb-1.5 h-px" /> : null}
                  <View className="flex-row items-center justify-between gap-3">
                    <AppText
                      weight="semibold"
                      className={cn('text-[13px]', WINDOW_TEXT_CLASS[cls.tone])}
                    >
                      {cls.label}
                    </AppText>
                    <AppText className="text-ink-dim text-[11px]">{cls.lagLabel} to peak</AppText>
                  </View>
                  <AppText weight="medium" className="text-foreground text-[12px] leading-5">
                    {cls.entrants}
                  </AppText>
                  <AppText className="text-muted text-[12px] leading-5">
                    {WINNER_BY_CLASS[id]}
                  </AppText>
                </View>
              );
            })}
          </View>
          <AppText className="text-ink-dim text-[11px] leading-4">
            Entrant counts are read off cases, not counted from a register. Treat them as the order
            of magnitude to expect, and check the actual number yourself with a store search and a
            look at who already ranks.
          </AppText>
        </View>

        <View className="gap-3">
          <SectionLabel>Where the revenue ends up</SectionLabel>
          {CONCENTRATION_STATS.map((item) => (
            <StatCard key={item.id} item={item} />
          ))}
        </View>

        <View className="gap-3">
          <SectionLabel>Does the startup survival curve apply to apps?</SectionLabel>
          {SURVIVAL_NOTE.map((paragraph) => (
            <AppText key={paragraph.slice(0, 24)} className="text-muted text-[13px] leading-6">
              {paragraph}
            </AppText>
          ))}
          {SURVIVAL_STATS.map((item) => (
            <StatCard key={item.id} item={item} />
          ))}
        </View>

        <AppText className="text-ink-dim text-[10px] leading-4">
          Every figure on this screen is a third-party estimate or a reported case, linked at
          source, and every one is an average across a whole market. None of it is a measurement of
          this app, a track record, or a prediction of what any signal here will earn you.
        </AppText>
      </ScrollView>
    </View>
  );
}
