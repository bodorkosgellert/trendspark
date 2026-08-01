import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Eye, Plus, Radar, Trophy } from 'lucide-react-native';

import { OutcomeRow } from '@/components/OutcomeRow';
import { ProgressLadder } from '@/components/ProgressLadder';
import { SectionLabel } from '@/components/SectionLabel';
import { SignalCard } from '@/components/SignalCard';
import { SupportPill } from '@/components/SupportPill';
import { AppText } from '@/components/ui/Text';
import { WatchRow } from '@/components/WatchRow';
import { SIGNALS } from '@/lib/data/signals';
import { tapFeedback } from '@/lib/haptics';
import { outcomeTotals, progressSteps, resolveOutcomes } from '@/lib/outcomes';
import { palette } from '@/lib/palette';
import { useOutcomeStore } from '@/lib/store/useOutcomeStore';
import { useSignalStore } from '@/lib/store/useSignalStore';
import type { Signal, WatchEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

type Mode = 'read' | 'watching' | 'results';

const MODES: { id: Mode; label: string }[] = [
  { id: 'read', label: 'Read' },
  { id: 'watching', label: 'Watching' },
  { id: 'results', label: 'Results' },
];

interface WatchItem {
  signal: Signal;
  entry: WatchEntry;
}

function openPlaybook(signal: Signal) {
  tapFeedback();
  router.push({ pathname: '/signal/[id]', params: { id: signal.id, tab: 'playbook' } });
}

function isMode(value: string | undefined): value is Mode {
  return value === 'read' || value === 'watching' || value === 'results';
}

export default function PlaysScreen() {
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const openedIds = useSignalStore((state) => state.openedIds);
  const watched = useSignalStore((state) => state.watched);
  const toggleWatch = useSignalStore((state) => state.toggleWatch);
  const outcomes = useOutcomeStore((state) => state.outcomes);
  const [mode, setMode] = useState<Mode>(isMode(modeParam) ? modeParam : 'read');

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

  const outcomeItems = useMemo(() => resolveOutcomes(outcomes), [outcomes]);
  const totals = useMemo(() => outcomeTotals(outcomes), [outcomes]);
  const steps = useMemo(
    () => progressSteps(watched.length, openedIds.length, outcomes),
    [watched.length, openedIds.length, outcomes],
  );

  const loggedIds = useMemo(() => new Set(outcomes.map((item) => item.signalId)), [outcomes]);
  const loggable = useMemo(
    () => readItems.filter((signal) => !loggedIds.has(signal.id)).slice(0, 8),
    [readItems, loggedIds],
  );

  const count =
    mode === 'read'
      ? readItems.length
      : mode === 'watching'
        ? watchItems.length
        : outcomeItems.length;
  const isEmpty = count === 0 && mode !== 'results';

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
          const badge =
            item.id === 'read'
              ? readItems.length
              : item.id === 'watching'
                ? watchItems.length
                : outcomeItems.length;
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
        ) : mode === 'watching' ? (
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
        ) : (
          <ResultsView
            items={outcomeItems}
            loggable={loggable}
            steps={steps}
            totals={totals}
            onBrowse={() => setMode('read')}
          />
        )}
      </ScrollView>
    </View>
  );
}

function openOutcome(signalId: string) {
  tapFeedback();
  router.push({ pathname: '/outcome', params: { signalId } });
}

function ResultsView({
  items,
  loggable,
  steps,
  totals,
  onBrowse,
}: {
  items: ReturnType<typeof resolveOutcomes>;
  loggable: Signal[];
  steps: ReturnType<typeof progressSteps>;
  totals: ReturnType<typeof outcomeTotals>;
  onBrowse: () => void;
}) {
  return (
    <>
      <ProgressLadder steps={steps} totals={totals} />

      {items.length > 0 ? (
        <View className="gap-3 pt-2">
          <SectionLabel hint={`${items.length} logged`}>What came of it</SectionLabel>
          {items.map(({ signal, outcome }) => (
            <OutcomeRow
              key={outcome.id}
              signal={signal}
              outcome={outcome}
              onPress={() => {
                tapFeedback();
                router.push({ pathname: '/signal/[id]', params: { id: signal.id } });
              }}
              onEdit={() => openOutcome(signal.id)}
              onPassBack={() => {
                tapFeedback();
                router.push({ pathname: '/contribute', params: { outcomeId: outcome.id } });
              }}
            />
          ))}
        </View>
      ) : (
        <View className="border-border bg-panel items-center gap-3 rounded-2xl border p-6">
          <View className="bg-panel-raised h-11 w-11 items-center justify-center rounded-2xl">
            <Trophy color={palette.inkDim} size={20} />
          </View>
          <AppText weight="semibold" className="text-foreground text-center text-[15px]">
            Nothing logged yet
          </AppText>
          <AppText className="text-muted max-w-72 text-center text-[13px] leading-5">
            When a play ships or earns anything, record it here. That number is what any later
            contribution is measured against — and it is the only revenue figure the app will ever
            have, because it comes from you.
          </AppText>
        </View>
      )}

      {loggable.length > 0 ? (
        <View className="gap-3 pt-2">
          <SectionLabel hint="Tap to record">Log a result for</SectionLabel>
          <View className="flex-row flex-wrap gap-2">
            {loggable.map((signal) => (
              <Pressable
                key={signal.id}
                onPress={() => openOutcome(signal.id)}
                accessibilityRole="button"
                className="border-border bg-panel flex-row items-center gap-1.5 rounded-full border px-3 py-2 active:opacity-70"
              >
                <Plus color={palette.accent} size={13} />
                <AppText weight="medium" className="text-muted max-w-52 text-[12px]">
                  {signal.keyword}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <Pressable
          onPress={() => {
            tapFeedback();
            onBrowse();
          }}
          accessibilityRole="button"
          className="border-border bg-panel items-center rounded-2xl border py-3.5 active:opacity-70"
        >
          <AppText weight="semibold" className="text-muted text-[13px]">
            Pick a playbook to log against
          </AppText>
        </Pressable>
      )}
    </>
  );
}
