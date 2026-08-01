import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Eye, Radar } from 'lucide-react-native';

import { SectionLabel } from '@/components/SectionLabel';
import { SignalCard } from '@/components/SignalCard';
import { SupportPill } from '@/components/SupportPill';
import { AppText } from '@/components/ui/Text';
import { WatchRow } from '@/components/WatchRow';
import { SIGNALS } from '@/lib/data/signals';
import { tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import { useSignalStore } from '@/lib/store/useSignalStore';
import type { Signal, WatchEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

type Mode = 'read' | 'watching';

const MODES: { id: Mode; label: string }[] = [
  { id: 'read', label: 'Read' },
  { id: 'watching', label: 'Watching' },
];

interface WatchItem {
  signal: Signal;
  entry: WatchEntry;
}

function openPlaybook(signal: Signal) {
  tapFeedback();
  router.push({ pathname: '/signal/[id]', params: { id: signal.id, tab: 'playbook' } });
}

export default function PlaysScreen() {
  const openedIds = useSignalStore((state) => state.openedIds);
  const watched = useSignalStore((state) => state.watched);
  const toggleWatch = useSignalStore((state) => state.toggleWatch);
  const [mode, setMode] = useState<Mode>('read');

  const readItems = useMemo(
    () =>
      openedIds
        .map((id) => SIGNALS.find((signal) => signal.id === id))
        .filter((signal): signal is Signal => Boolean(signal)),
    [openedIds],
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

  const count = mode === 'read' ? readItems.length : watchItems.length;
  const isEmpty = count === 0;

  return (
    <View className="bg-background flex-1">
      <View className="pt-safe-offset-3 border-border bg-canvas flex-row items-center justify-between border-b px-5 pb-3">
        <AppText weight="bold" className="text-foreground text-[17px]">
          My plays
        </AppText>
        <SupportPill onPress={() => router.push('/contribute')} />
      </View>

      <View className="border-border bg-canvas flex-row gap-2 border-b px-5 py-3">
        {MODES.map((item) => {
          const active = mode === item.id;
          const badge = item.id === 'read' ? readItems.length : watchItems.length;
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
              {mode === 'read' ? (
                <Radar color={palette.inkDim} size={22} />
              ) : (
                <Eye color={palette.inkDim} size={22} />
              )}
            </View>
            <AppText weight="semibold" className="text-foreground">
              {mode === 'read' ? 'No playbooks read yet' : 'Nothing tracked yet'}
            </AppText>
            <AppText className="text-muted max-w-72 text-center text-sm">
              {mode === 'read'
                ? 'Open any signal on the radar. Every playbook is readable straight away — this list just remembers where you have been.'
                : 'Tap Track on any signal to follow it day by day and see whether it keeps climbing before you commit a weekend to it.'}
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
        ) : mode === 'read' ? (
          <>
            <SectionLabel hint={`${readItems.length} total`}>Playbooks you have read</SectionLabel>
            {readItems.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                opened
                onPress={() => {
                  tapFeedback();
                  router.push({ pathname: '/signal/[id]', params: { id: signal.id } });
                }}
                onOpenPlaybook={() => openPlaybook(signal)}
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
                opened={openedIds.includes(signal.id)}
                onPress={() => {
                  tapFeedback();
                  router.push({ pathname: '/signal/[id]', params: { id: signal.id } });
                }}
                onOpenPlaybook={() => openPlaybook(signal)}
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
