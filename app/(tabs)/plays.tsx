import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Bookmark, Radar } from 'lucide-react-native';

import { CreditPill } from '@/components/CreditPill';
import { SectionLabel } from '@/components/SectionLabel';
import { SignalCard } from '@/components/SignalCard';
import { AppText } from '@/components/ui/Text';
import { SIGNALS } from '@/lib/data/signals';
import { successFeedback, tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import { useSignalStore } from '@/lib/store/useSignalStore';
import type { Signal } from '@/lib/types';
import { cn } from '@/lib/utils';

type Mode = 'unlocked' | 'saved';

export default function PlaysScreen() {
  const unlockedIds = useSignalStore((state) => state.unlockedIds);
  const savedIds = useSignalStore((state) => state.savedIds);
  const unlock = useSignalStore((state) => state.unlock);
  const [mode, setMode] = useState<Mode>('unlocked');

  const ids = mode === 'unlocked' ? unlockedIds : savedIds;
  const items = useMemo(
    () =>
      ids
        .map((id) => SIGNALS.find((signal) => signal.id === id))
        .filter((signal): signal is Signal => Boolean(signal)),
    [ids],
  );

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
        {(['unlocked', 'saved'] as Mode[]).map((item) => {
          const active = mode === item;
          const count = item === 'unlocked' ? unlockedIds.length : savedIds.length;
          return (
            <Pressable
              key={item}
              onPress={() => {
                tapFeedback();
                setMode(item);
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
                className={cn('text-xs capitalize', active ? 'text-up' : 'text-muted')}
              >
                {item} · {count}
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
        {items.length === 0 ? (
          <View className="items-center gap-3 py-20">
            <View className="bg-panel h-12 w-12 items-center justify-center rounded-2xl">
              {mode === 'unlocked' ? (
                <Radar color={palette.inkDim} size={22} />
              ) : (
                <Bookmark color={palette.inkDim} size={22} />
              )}
            </View>
            <AppText weight="semibold" className="text-foreground">
              {mode === 'unlocked' ? 'No playbooks yet' : 'Nothing saved yet'}
            </AppText>
            <AppText className="text-muted max-w-72 text-center text-sm">
              {mode === 'unlocked'
                ? 'Unlock a signal on the radar and it stays here for good.'
                : 'Bookmark signals you want to come back to before the window closes.'}
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
        ) : (
          <>
            <SectionLabel hint={`${items.length} total`}>
              {mode === 'unlocked' ? 'Yours forever' : 'Watching'}
            </SectionLabel>
            {items.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                unlocked={unlockedIds.includes(signal.id)}
                onPress={() => {
                  tapFeedback();
                  router.push({ pathname: '/signal/[id]', params: { id: signal.id } });
                }}
                onUnlock={() => handleUnlock(signal)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
