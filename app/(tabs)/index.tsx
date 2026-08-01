import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Redirect, router } from 'expo-router';
import { Heart, Radar as RadarIcon, X } from 'lucide-react-native';

import { BriefingHero } from '@/components/BriefingHero';
import { SectionLabel } from '@/components/SectionLabel';
import { SignalCard } from '@/components/SignalCard';
import { SupportPill } from '@/components/SupportPill';
import { AppText } from '@/components/ui/Text';
import { buildBriefing } from '@/lib/briefing';
import { rankByHeat, scopeSignals } from '@/lib/feed';
import { tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import { usePrefsStore } from '@/lib/store/usePrefsStore';
import { isWatched, useSignalStore } from '@/lib/store/useSignalStore';
import { shouldAsk, useSupportStore } from '@/lib/store/useSupportStore';
import type { Signal } from '@/lib/types';
import { cn } from '@/lib/utils';

type Filter = 'hot' | 'open' | 'closing';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'hot', label: 'Hottest' },
  { id: 'open', label: 'Low competition' },
  { id: 'closing', label: 'Closing soon' },
];

function openSignal(signal: Signal) {
  tapFeedback();
  router.push({ pathname: '/signal/[id]', params: { id: signal.id } });
}

function openPlaybook(signal: Signal) {
  tapFeedback();
  router.push({ pathname: '/signal/[id]', params: { id: signal.id, tab: 'playbook' } });
}

export default function RadarScreen() {
  const onboarded = usePrefsStore((state) => state.onboarded);
  const niches = usePrefsStore((state) => state.niches);
  const openedIds = useSignalStore((state) => state.openedIds);
  const dismissedIds = useSignalStore((state) => state.dismissedIds);
  const watched = useSignalStore((state) => state.watched);
  const toggleWatch = useSignalStore((state) => state.toggleWatch);
  const briefingPlays = useSupportStore((state) => state.usage.briefing);
  const contributedCents = useSupportStore((state) => state.contributedCents);
  const eventsSincePrompt = useSupportStore((state) => state.eventsSincePrompt);
  const lastPromptAt = useSupportStore((state) => state.lastPromptAt);
  const markPromptSeen = useSupportStore((state) => state.markPromptSeen);

  const [filter, setFilter] = useState<Filter>('hot');

  const scoped = useMemo(() => scopeSignals(niches, dismissedIds), [dismissedIds, niches]);

  const feed = useMemo(() => {
    if (filter === 'open') {
      return rankByHeat(scoped.filter((signal) => signal.competition !== 'high'));
    }
    if (filter === 'closing') {
      return [...scoped]
        .filter((signal) => signal.peakInDays <= 14)
        .sort((a, b) => a.peakInDays - b.peakInDays);
    }
    return rankByHeat(scoped);
  }, [scoped, filter]);

  const top = useMemo(() => rankByHeat(scoped).slice(0, 3), [scoped]);

  const script = useMemo(() => buildBriefing(top), [top]);

  if (!onboarded) {
    return <Redirect href="/onboarding" />;
  }

  const asking = shouldAsk(eventsSincePrompt, lastPromptAt);

  return (
    <View className="bg-background flex-1">
      <View className="pt-safe-offset-3 border-border bg-canvas flex-row items-center justify-between border-b px-5 pb-3">
        <View className="flex-row items-center gap-2">
          <RadarIcon color={palette.accent} size={18} />
          <AppText weight="bold" className="text-foreground text-[17px]">
            TrendSpark
          </AppText>
        </View>
        <SupportPill onPress={() => router.push('/contribute')} />
      </View>

      <FlashList
        data={feed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="gap-5 pb-4">
            <BriefingHero
              script={script}
              signals={top}
              playCount={briefingPlays}
              onPress={() => {
                tapFeedback();
                router.push('/briefing');
              }}
            />

            {asking ? (
              <View className="border-accent bg-accent-soft flex-row items-start gap-3 rounded-2xl border p-4">
                <Heart color={palette.accent} size={16} />
                <View className="flex-1 gap-1">
                  <AppText weight="semibold" className="text-foreground text-[14px]">
                    {contributedCents > 0
                      ? 'You have been using this a fair bit again.'
                      : 'You have used a few playbooks now.'}
                  </AppText>
                  <AppText className="text-muted text-[12px] leading-5">
                    Nothing is locked and nothing will be. If any of it was worth something, you
                    decide how much.
                  </AppText>
                  <Pressable
                    onPress={() => {
                      tapFeedback();
                      router.push('/contribute');
                    }}
                    accessibilityRole="button"
                    className="bg-accent mt-2 self-start rounded-full px-3.5 py-2 active:opacity-80"
                  >
                    <AppText weight="semibold" className="text-accent-foreground text-xs">
                      Decide what it was worth
                    </AppText>
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => {
                    tapFeedback();
                    markPromptSeen();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Not now"
                  className="h-7 w-7 items-center justify-center rounded-full active:opacity-70"
                >
                  <X color={palette.inkDim} size={14} />
                </Pressable>
              </View>
            ) : null}

            <View className="flex-row gap-2">
              {FILTERS.map((item) => {
                const active = filter === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      tapFeedback();
                      setFilter(item.id);
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

            <SectionLabel hint={`${feed.length} live`}>Signals</SectionLabel>
          </View>
        }
        renderItem={({ item }) => (
          <SignalCard
            signal={item}
            opened={openedIds.includes(item.id)}
            watching={isWatched(watched, item.id)}
            onToggleWatch={() => {
              tapFeedback();
              toggleWatch(item.id, item.momentum);
            }}
            onPress={() => openSignal(item)}
            onOpenPlaybook={() => openPlaybook(item)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center gap-2 py-16">
            <AppText weight="semibold" className="text-foreground">
              Nothing rising here yet
            </AppText>
            <AppText className="text-muted text-center text-sm">
              Try another filter, or add more areas in the You tab.
            </AppText>
          </View>
        }
      />
    </View>
  );
}
