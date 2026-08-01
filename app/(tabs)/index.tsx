import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Redirect, router } from 'expo-router';
import { Radar } from 'lucide-react-native';

import { BriefingHero } from '@/components/BriefingHero';
import { CreditPill } from '@/components/CreditPill';
import { SectionLabel } from '@/components/SectionLabel';
import { SignalCard } from '@/components/SignalCard';
import { AppText } from '@/components/ui/Text';
import { buildBriefing } from '@/lib/briefing';
import { rankByHeat, scopeSignals } from '@/lib/feed';
import { palette } from '@/lib/palette';
import { successFeedback, tapFeedback } from '@/lib/haptics';
import { usePrefsStore } from '@/lib/store/usePrefsStore';
import { useSignalStore } from '@/lib/store/useSignalStore';
import { FREE_BRIEFINGS_PER_DAY, useWalletStore } from '@/lib/store/useWalletStore';
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

export default function RadarScreen() {
  const onboarded = usePrefsStore((state) => state.onboarded);
  const niches = usePrefsStore((state) => state.niches);
  const unlockedIds = useSignalStore((state) => state.unlockedIds);
  const dismissedIds = useSignalStore((state) => state.dismissedIds);
  const unlock = useSignalStore((state) => state.unlock);
  const plan = useWalletStore((state) => state.plan);
  const briefingPlays = useWalletStore((state) => state.briefingPlays);
  const briefingDate = useWalletStore((state) => state.briefingDate);

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

  const isToday = briefingDate === new Date().toISOString().slice(0, 10);
  const playsLeft =
    plan === 'free' ? Math.max(0, FREE_BRIEFINGS_PER_DAY - (isToday ? briefingPlays : 0)) : null;

  const handleUnlock = (signal: Signal) => {
    const result = unlock(signal.id, signal.keyword);
    if (result === 'insufficient') {
      router.push('/paywall');
      return;
    }
    successFeedback();
    router.push({ pathname: '/signal/[id]', params: { id: signal.id } });
  };

  return (
    <View className="bg-background flex-1">
      <View className="pt-safe-offset-3 border-border bg-canvas flex-row items-center justify-between border-b px-5 pb-3">
        <View className="flex-row items-center gap-2">
          <Radar color={palette.accent} size={18} />
          <AppText weight="bold" className="text-foreground text-[17px]">
            TrendSpark
          </AppText>
        </View>
        <CreditPill onPress={() => router.push('/paywall')} />
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
              playsLeft={playsLeft}
              onPress={() => {
                tapFeedback();
                router.push('/briefing');
              }}
            />

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
            unlocked={unlockedIds.includes(item.id)}
            onPress={() => openSignal(item)}
            onUnlock={() => handleUnlock(item)}
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
