import { useEffect, useMemo, useRef } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowUpRight, Pause, Play, RotateCcw, X } from 'lucide-react-native';

import { SectionLabel } from '@/components/SectionLabel';
import { Waveform } from '@/components/Waveform';
import { AppText } from '@/components/ui/Text';
import { useBriefingPlayer } from '@/hooks/useBriefingPlayer';
import { useMarketLens } from '@/hooks/useMarketLens';
import { track } from '@/lib/analytics';
import { buildBriefing, formatClock } from '@/lib/briefing';
import { RUN_COST_CENTS } from '@/lib/data/catalog';
import { isVoiceConfigured } from '@/lib/elevenlabs';
import { topSignals } from '@/lib/feed';
import { euro } from '@/lib/format';
import { tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import { usePrefsStore } from '@/lib/store/usePrefsStore';
import { useSignalStore } from '@/lib/store/useSignalStore';
import { useSupportStore } from '@/lib/store/useSupportStore';
import { cn } from '@/lib/utils';

export default function BriefingScreen() {
  const niches = usePrefsStore((state) => state.niches);
  const voiceId = usePrefsStore((state) => state.voiceId);
  const lens = useMarketLens();
  const dismissedIds = useSignalStore((state) => state.dismissedIds);
  const record = useSupportStore((state) => state.record);

  const signals = useMemo(
    () => topSignals(niches, dismissedIds, lens.active),
    [niches, dismissedIds, lens],
  );
  const script = useMemo(() => buildBriefing(signals, lens), [signals, lens]);
  const player = useBriefingPlayer(script, voiceId);

  const playing = player.state === 'playing';
  const activeSignalId = player.activeLine?.signalId ?? null;
  const activeSignal = signals.find((signal) => signal.id === activeSignalId) ?? null;

  const handleToggle = () => {
    if (player.state === 'idle' || player.state === 'done') {
      record('briefing');
      track('briefing_started', {
        signals: signals.length,
        market: lens.active.short,
        voice: voiceId,
        spoken: isVoiceConfigured(),
      });
    }
    tapFeedback();
    player.toggle();
  };

  // Started minus finished is the only honest read on whether the script holds
  // for 60 seconds. Fires once per playthrough, not once per render.
  const finishedRef = useRef(false);
  useEffect(() => {
    if (player.state === 'playing') {
      finishedRef.current = false;
      return;
    }
    if (player.state === 'done' && !finishedRef.current) {
      finishedRef.current = true;
      track('briefing_finished', {
        seconds: Math.round(player.durationMs / 1000),
        market: lens.active.short,
      });
    }
  }, [player.state, player.durationMs, lens.active.short]);

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  return (
    <View className="bg-background flex-1">
      <View className="pt-safe-offset-3 border-border bg-canvas flex-row items-center justify-between border-b px-5 pb-3">
        <View>
          <AppText weight="semibold" className="text-foreground text-[15px]">
            Daily briefing
          </AppText>
          <AppText className="text-ink-dim text-xs">{dateLabel}</AppText>
        </View>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close briefing"
          className="border-border bg-panel h-9 w-9 items-center justify-center rounded-full border active:opacity-70"
        >
          <X color={palette.muted} size={16} />
        </Pressable>
      </View>

      <View className="border-border bg-panel gap-5 border-b px-5 py-6">
        <Waveform active={playing} height={56} />

        <View className="gap-2">
          <View className="bg-grid h-1 overflow-hidden rounded-full">
            <View
              className="bg-accent h-full rounded-full"
              style={{ width: `${Math.round(player.progress * 100)}%` }}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <AppText weight="medium" className="text-ink-dim text-xs">
              {formatClock(player.positionMs)}
            </AppText>
            <AppText weight="medium" className="text-ink-dim text-xs">
              {isVoiceConfigured() ? 'ElevenLabs voice' : 'Transcript mode'}
            </AppText>
            <AppText weight="medium" className="text-ink-dim text-xs">
              {formatClock(player.durationMs)}
            </AppText>
          </View>
        </View>

        <View className="flex-row items-center justify-center gap-6">
          <Pressable
            onPress={() => {
              tapFeedback();
              player.restart();
            }}
            accessibilityRole="button"
            accessibilityLabel="Restart briefing"
            className="border-border h-11 w-11 items-center justify-center rounded-full border active:opacity-70"
          >
            <RotateCcw color={palette.muted} size={18} />
          </Pressable>

          <Pressable
            onPress={handleToggle}
            accessibilityRole="button"
            accessibilityLabel={playing ? 'Pause briefing' : 'Play briefing'}
            className="bg-accent h-16 w-16 items-center justify-center rounded-full active:opacity-80"
          >
            {player.state === 'loading' ? (
              <AppText weight="semibold" className="text-accent-foreground text-[11px]">
                ...
              </AppText>
            ) : playing ? (
              <Pause color={palette.accentInk} size={24} fill={palette.accentInk} />
            ) : (
              <Play color={palette.accentInk} size={24} fill={palette.accentInk} />
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              if (!activeSignal) return;
              tapFeedback();
              router.push({ pathname: '/signal/[id]', params: { id: activeSignal.id } });
            }}
            disabled={!activeSignal}
            accessibilityRole="button"
            accessibilityLabel="Open the signal being read"
            className={cn(
              'border-border h-11 w-11 items-center justify-center rounded-full border active:opacity-70',
              !activeSignal && 'opacity-40',
            )}
          >
            <ArrowUpRight color={palette.muted} size={18} />
          </Pressable>
        </View>

        {player.state === 'done' ? (
          <Pressable
            onPress={() => {
              tapFeedback();
              router.push('/contribute');
            }}
            accessibilityRole="button"
            className="border-accent bg-accent-soft items-center gap-1 rounded-2xl border p-4 active:opacity-80"
          >
            <AppText weight="semibold" className="text-foreground text-[14px]">
              Was that worth anything to you?
            </AppText>
            <AppText className="text-muted text-center text-[12px] leading-5">
              Briefings stay free and unlimited. You decide the amount, and zero is fine.
            </AppText>
          </Pressable>
        ) : (
          <AppText className="text-ink-dim text-center text-[11px]">
            Unlimited briefings, no daily cap. Each one costs about {euro(RUN_COST_CENTS.briefing)}{' '}
            in speech synthesis.
          </AppText>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-5 gap-3 pb-safe-offset-6"
        showsVerticalScrollIndicator={false}
      >
        <SectionLabel hint="Tap a line to jump">Transcript</SectionLabel>
        {script.lines.map((line, index) => {
          const active = index === player.activeIndex && player.state !== 'idle';
          return (
            <Pressable
              key={line.id}
              onPress={() => {
                tapFeedback();
                player.skipTo(index);
              }}
              accessibilityRole="button"
              className={cn(
                'rounded-2xl border p-4 active:opacity-80',
                active ? 'border-accent bg-accent-soft' : 'border-border bg-panel',
              )}
            >
              <AppText
                weight={active ? 'medium' : 'regular'}
                className={cn('text-[14px] leading-6', active ? 'text-foreground' : 'text-muted')}
              >
                {line.text}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
