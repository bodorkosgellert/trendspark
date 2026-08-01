import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Eye, Radar } from 'lucide-react-native';

import { CreditPill } from '@/components/CreditPill';
import { SectionLabel } from '@/components/SectionLabel';
import { SignalCard } from '@/components/SignalCard';
import { AppText } from '@/components/ui/Text';
import { WatchRow } from '@/components/WatchRow';
import { SIGNALS } from '@/lib/data/signals';
import { successFeedback, tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import { useSignalStore } from '@/lib/store/useSignalStore';
import type { Signal, WatchEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

type Mode = 'unlocked' | 'watching';

const MODES: { id: Mode; label: string }[] = [
  { id: 'unlocked', label: 'Unlocked' },
  { id: 'watching', label: 'Watching' },
];

interface WatchItem {
  signal: Signal;
  entry: WatchEntry;
}

export default function PlaysScreen() {
  const unlockedIds = useSignalStore((state) => state.unlockedIds);
  const watched = useSignalStore((state) => state.watched);
  const unlock = useSignalStore((state) => state.unlock);
  const toggleWatch = useSignalStore((state) => state.toggleWatch);
  const [mode, setMode] = useState<Mode>('unlocked');

  const unlockedItems = useMemo(
    () =>
      unlockedIds
        .map((id) => SIGNALS.find((signal) => signal.id === id))
        .filter((signal): signal is Signal => Boolean(signal)),
    [unlockedIds],
  );

  const watchItems = useMemo(
    () =>
      watched
        .map((entry) => {
          const signal = SIGNALS.find((item) => item.id === entry.signalId);
          return signal ? { signal, entry } : null;
        })
        .filter((item): item is WatchItem => Boolean(item)),
    [watched],
  );

  const count = mode === 'unlocked' ? unlockedItems.length : watchItems.length;
  const isEmpty = count === 0;

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
        <AppText weight="bold" className="text-foreground text-[17px]">
          My plays
        </AppText>
        <CreditPill onPress={() => router.push('/paywall')} />
      </View>

      <View className="border-border bg-canvas flex-row gap-2 border-b px-5 py-3">
        {MODES.map((item) => {
          const active = mode === item.id;
          const badge = item.id === 'unlocked' ? unlockedItems.length : watchItems.length;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                tapFeedback();
                setMode(item.id);
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
                {item.label} · {badge}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-5 gap-3 pb-safe-offset-8"
        showsVerticalScrollIndicator={false}
      >
        {isEmpty ? (
          <View className="items-center gap-3 py-20">
            <View className="bg-panel h-12 w-12 items-center justify-center rounded-2xl">
              {mode === 'unlocked' ? (
                <Radar color={palette.inkDim} size={22} />
              ) : (
                <Eye color={palette.inkDim} size={22} />
              )}
            </View>
            <AppText weight="semibold" className="text-foreground">
              {mode === 'unlocked' ? 'No playbooks yet' : 'Nothing tracked yet'}
            </AppText>
            <AppText className="text-muted max-w-72 text-center text-sm">
              {mode === 'unlocked'
                ? 'Unlock a signal on the radar and it stays here for good.'
                : 'Tap Track on any signal to follow it day by day. Free, no credit — you see whether it keeps climbing before you commit.'}
            </AppText>
            <Pressable
              onPress={() => router.push('/(tabs)')}
              accessibilityRole="button"
              className="bg-accent mt-1 rounded-full px-4 py-2.5 active:opacity-80"
            >
              <AppText weight="semibold" className="text-accent-foreground text-sm">
                Open the radar
              </AppText>
            </Pressable>
          </View>
        ) : mode === 'unlocked' ? (
          <>
            <SectionLabel hint={`${unlockedItems.length} total`}>Yours forever</SectionLabel>
            {unlockedItems.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                unlocked
                onPress={() => {
                  tapFeedback();
                  router.push({ pathname: '/signal/[id]', params: { id: signal.id } });
                }}
                onUnlock={() => handleUnlock(signal)}
              />
            ))}
          </>
        ) : (
          <>
            <SectionLabel hint={`${watchItems.length} tracked`}>Watchlist</SectionLabel>
            {watchItems.map(({ signal, entry }) => (
              <WatchRow
                key={signal.id}
                signal={signal}
                entry={entry}
                unlocked={unlockedIds.includes(signal.id)}
                onPress={() => {
                  tapFeedback();
                  router.push({ pathname: '/signal/[id]', params: { id: signal.id } });
                }}
                onUnlock={() => handleUnlock(signal)}
                onStop={() => {
                  tapFeedback();
                  toggleWatch(signal.id, signal.momentum);
                }}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
