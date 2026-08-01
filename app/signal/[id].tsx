import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  Copy,
  Eye,
  Flag,
  Heart,
  Sparkles,
  Target,
  ThumbsDown,
} from 'lucide-react-native';

import { MomentumBadge } from '@/components/MomentumBadge';
import { SectionLabel } from '@/components/SectionLabel';
import { SourceLinks } from '@/components/SourceLinks';
import { TagRow } from '@/components/TagRow';
import { TrendTimeline } from '@/components/TrendTimeline';
import { AppText } from '@/components/ui/Text';
import { archiveFor, flaggedLabel, stageLabel } from '@/lib/archive';
import { NICHE_LABEL } from '@/lib/data/catalog';
import { getSignalById } from '@/lib/data/signals';
import { competitionLabel, detectedLabel, formatVolume, playKindLabel } from '@/lib/format';
import { successFeedback, tapFeedback } from '@/lib/haptics';
import { isModelConfigured, regeneratePlaybook } from '@/lib/openai';
import { palette } from '@/lib/palette';
import { shareText } from '@/lib/share';
import { useSignalStore, watchEntry } from '@/lib/store/useSignalStore';
import { useSupportStore } from '@/lib/store/useSupportStore';
import { tagsFor } from '@/lib/tags';
import type { Playbook, Signal, WatchEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  buildHistory,
  rangeLabel,
  signedPct,
  STATUS_TEXT_CLASS,
  statusLabel,
  TIMELINE_RANGES,
  trackedLabel,
  watchStats,
} from '@/lib/watch';

type Tab = 'signal' | 'playbook' | 'pitch';

const TABS: { id: Tab; label: string }[] = [
  { id: 'signal', label: 'Signal' },
  { id: 'playbook', label: 'Playbook' },
  { id: 'pitch', label: 'First move' },
];

function isTab(value: string | undefined): value is Tab {
  return value === 'signal' || value === 'playbook' || value === 'pitch';
}

export default function SignalDetailScreen() {
  const { id, tab: tabParam } = useLocalSearchParams<{ id: string; tab?: string }>();
  const signal = useMemo(() => getSignalById(id), [id]);

  const watched = useSignalStore((state) => state.watched);
  const open = useSignalStore((state) => state.open);
  const toggleWatch = useSignalStore((state) => state.toggleWatch);
  const worthIt = useSupportStore((state) => state.worthIt);
  const notWorthIt = useSupportStore((state) => state.notWorthIt);
  const rate = useSupportStore((state) => state.rate);
  const record = useSupportStore((state) => state.record);

  const [tab, setTab] = useState<Tab>(isTab(tabParam) ? tabParam : 'signal');
  const [override, setOverride] = useState<Playbook | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (signal) open(signal.id);
  }, [signal, open]);

  if (!signal) {
    return (
      <View className="bg-background flex-1 items-center justify-center gap-3 px-6">
        <AppText weight="semibold" className="text-foreground">
          Signal not found
        </AppText>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <AppText weight="semibold" className="text-up">
            Go back
          </AppText>
        </Pressable>
      </View>
    );
  }

  const entry = watchEntry(watched, signal.id);
  const play = override ?? signal.play;
  const helped = worthIt.includes(signal.id);
  const missed = notWorthIt.includes(signal.id);

  const handleRegenerate = async () => {
    if (!isModelConfigured()) return;
    setRegenerating(true);
    record('regenerate');
    const next = await regeneratePlaybook(signal);
    if (next) setOverride(next);
    setRegenerating(false);
  };

  const handleShare = async () => {
    const result = await shareText(play.firstPost, signal.keyword);
    if (result !== 'failed') {
      successFeedback();
      record('copy');
      setShared(true);
      setTimeout(() => setShared(false), 1600);
    }
  };

  return (
    <View className="bg-background flex-1">
      <View className="pt-safe-offset-3 border-border bg-canvas flex-row items-center justify-between border-b px-5 pb-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          className="border-border bg-panel h-9 w-9 items-center justify-center rounded-full border active:opacity-70"
        >
          <ChevronLeft color={palette.muted} size={18} />
        </Pressable>
        <AppText
          weight="semibold"
          className="text-ink-dim text-[11px] uppercase"
          style={{ letterSpacing: 1.2 }}
        >
          {NICHE_LABEL[signal.niche] ?? signal.niche}
        </AppText>
        <Pressable
          onPress={() => {
            tapFeedback();
            toggleWatch(signal.id, signal.momentum);
          }}
          accessibilityRole="button"
          accessibilityState={{ selected: Boolean(entry) }}
          accessibilityLabel={entry ? 'Stop tracking this keyword' : 'Track this keyword over time'}
          className={cn(
            'h-9 w-9 items-center justify-center rounded-full border active:opacity-70',
            entry ? 'border-accent bg-accent-soft' : 'border-border bg-panel',
          )}
        >
          <Eye color={entry ? palette.accent : palette.muted} size={16} />
        </Pressable>
      </View>

      <View className="border-border bg-canvas flex-row gap-2 border-b px-5 py-3">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                tapFeedback();
                setTab(item.id);
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

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-5 gap-5 pb-safe-offset-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <AppText weight="bold" className="text-foreground text-[26px] leading-8">
            {signal.keyword}
          </AppText>
          <View className="flex-row items-center gap-2">
            <MomentumBadge momentum={signal.momentum} size="lg" />
            <View className="border-border bg-panel rounded-full border px-3 py-1.5">
              <AppText weight="medium" className="text-muted text-xs">
                {signal.region}
              </AppText>
            </View>
            <View className="border-border bg-panel rounded-full border px-3 py-1.5">
              <AppText weight="medium" className="text-muted text-xs">
                {detectedLabel(signal.detectedAt)}
              </AppText>
            </View>
          </View>
          <TagRow
            tags={tagsFor(signal)}
            onPress={(item) => {
              tapFeedback();
              router.push({ pathname: '/history', params: { tag: item.id } });
            }}
          />
        </View>

        {tab === 'signal' ? (
          <SignalTab
            signal={signal}
            entry={entry}
            onToggleWatch={() => {
              tapFeedback();
              toggleWatch(signal.id, signal.momentum);
            }}
          />
        ) : tab === 'playbook' ? (
          <PlaybookTab
            play={play}
            regenerating={regenerating}
            onRegenerate={handleRegenerate}
            regenerateAvailable={isModelConfigured()}
          />
        ) : (
          <PitchTab play={play} shared={shared} onShare={handleShare} />
        )}
      </ScrollView>

      <View className="pb-safe-offset-4 border-border bg-canvas gap-2 border-t px-5 pt-4">
        {helped ? (
          <>
            <Pressable
              onPress={() => {
                tapFeedback();
                router.push('/contribute');
              }}
              accessibilityRole="button"
              className="bg-accent flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-80"
            >
              <Heart color={palette.accentInk} size={16} />
              <AppText weight="semibold" className="text-accent-foreground text-[15px]">
                Decide what this was worth
              </AppText>
            </Pressable>
            <AppText className="text-ink-dim text-center text-[11px]">
              You set the amount, including nothing. Nothing gets taken away either way.
            </AppText>
          </>
        ) : missed ? (
          <>
            <View className="border-border bg-panel flex-row items-start gap-2 rounded-2xl border p-4">
              <ThumbsDown color={palette.down} size={15} />
              <AppText className="text-muted flex-1 text-[12px] leading-5">
                Noted. Signals people find useless should stop being pushed at the top of the radar,
                and this is the only honest way to learn that.
              </AppText>
            </View>
            <Pressable
              onPress={() => {
                tapFeedback();
                rate(signal.id, true);
              }}
              accessibilityRole="button"
              className="items-center py-1 active:opacity-70"
            >
              <AppText weight="medium" className="text-muted text-[12px]">
                Actually, it did help
              </AppText>
            </Pressable>
          </>
        ) : (
          <>
            <AppText weight="semibold" className="text-foreground text-center text-[13px]">
              Did this playbook actually help?
            </AppText>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => {
                  tapFeedback();
                  rate(signal.id, false);
                }}
                accessibilityRole="button"
                className="border-border bg-panel flex-1 flex-row items-center justify-center gap-2 rounded-2xl border py-3.5 active:opacity-70"
              >
                <ThumbsDown color={palette.muted} size={15} />
                <AppText weight="semibold" className="text-muted text-[14px]">
                  Not really
                </AppText>
              </Pressable>
              <Pressable
                onPress={() => {
                  successFeedback();
                  rate(signal.id, true);
                }}
                accessibilityRole="button"
                className="bg-accent flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3.5 active:opacity-80"
              >
                <Heart color={palette.accentInk} size={15} />
                <AppText weight="semibold" className="text-accent-foreground text-[14px]">
                  It helped
                </AppText>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

function StatCell({ label, value, tone }: { label: string; value: string; tone?: 'hot' | 'up' }) {
  return (
    <View className="border-border bg-panel flex-1 gap-1 rounded-2xl border p-3">
      <AppText
        weight="semibold"
        className="text-ink-dim text-[10px] uppercase"
        style={{ letterSpacing: 1 }}
      >
        {label}
      </AppText>
      <AppText
        weight="semibold"
        className={cn(
          'text-[15px]',
          tone === 'hot' ? 'text-hot' : tone === 'up' ? 'text-up' : 'text-foreground',
        )}
      >
        {value}
      </AppText>
    </View>
  );
}

function SignalTab({
  signal,
  entry,
  onToggleWatch,
}: {
  signal: Signal;
  entry: WatchEntry | undefined;
  onToggleWatch: () => void;
}) {
  const decay = Math.min(1, Math.max(0.08, 1 - signal.peakInDays / 30));
  const archive = useMemo(() => archiveFor(signal.id), [signal.id]);
  const [range, setRange] = useState<number>(archive && archive.flaggedDaysAgo > 24 ? 90 : 30);
  const history = useMemo(() => buildHistory(signal), [signal]);
  const stats = useMemo(
    () => (entry ? watchStats(signal, entry.startedAt, history) : null),
    [entry, signal, history],
  );

  const markerIndex = stats?.startIndex ?? archive?.flaggedIndex;
  const markerLabel = stats ? 'Tracking started' : 'Breakout';

  return (
    <View className="gap-5">
      <View className="border-border bg-panel gap-3 rounded-2xl border p-4">
        <View className="flex-row items-center justify-between">
          <SectionLabel>Interest over time</SectionLabel>
          <View className="flex-row gap-1.5">
            {TIMELINE_RANGES.map((option) => {
              const active = range === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    tapFeedback();
                    setRange(option);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Show last ${option} days`}
                  className={cn(
                    'rounded-full border px-2.5 py-1 active:opacity-70',
                    active ? 'border-accent bg-accent-soft' : 'border-border bg-panel-raised',
                  )}
                >
                  <AppText
                    weight="semibold"
                    className={cn('text-[11px]', active ? 'text-up' : 'text-muted')}
                  >
                    {rangeLabel(option)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
        <TrendTimeline
          history={history}
          range={range}
          markerIndex={markerIndex}
          markerLabel={markerLabel}
          height={132}
          gradientId={`detail-${signal.id}`}
        />
      </View>

      {archive ? (
        <View className="border-border bg-panel gap-2 rounded-2xl border p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Flag color={palette.hot} size={14} />
              <SectionLabel>First flagged</SectionLabel>
            </View>
            <AppText weight="semibold" className="text-muted text-[11px]">
              {stageLabel(archive.stage)}
            </AppText>
          </View>
          <AppText className="text-muted text-[13px] leading-5">
            {flaggedLabel(archive.flaggedDaysAgo)} at an interest index of{' '}
            {Math.round(archive.valueThen)}. It now sits at {Math.round(archive.valueNow)} —{' '}
            {signedPct(archive.changePct)} since the radar first called it.
          </AppText>
          <Pressable
            onPress={() => {
              tapFeedback();
              router.push('/history');
            }}
            accessibilityRole="button"
            className="self-start active:opacity-70"
          >
            <AppText weight="semibold" className="text-up text-[12px]">
              See what else broke out around then
            </AppText>
          </Pressable>
        </View>
      ) : null}

      {stats ? (
        <View className="border-accent bg-accent-soft gap-3 rounded-2xl border p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Eye color={palette.accent} size={14} />
              <AppText
                weight="semibold"
                className="text-up text-[10px] uppercase"
                style={{ letterSpacing: 1.2 }}
              >
                {trackedLabel(stats.daysWatched)}
              </AppText>
            </View>
            <AppText weight="semibold" className={cn('text-xs', STATUS_TEXT_CLASS[stats.status])}>
              {statusLabel(stats.status)}
            </AppText>
          </View>
          <View className="flex-row gap-3">
            <StatCell
              label="Since you started"
              value={signedPct(stats.changePct)}
              tone={stats.changePct >= 0 ? 'up' : undefined}
            />
            <StatCell label="Peak while watching" value={String(Math.round(stats.peakValue))} />
            <StatCell
              label="Window left"
              value={stats.daysLeft === 0 ? 'Closed' : `${stats.daysLeft}d`}
              tone="hot"
            />
          </View>
          <AppText className="text-muted text-[13px] leading-5">{stats.verdict}</AppText>
        </View>
      ) : (
        <Pressable
          onPress={onToggleWatch}
          accessibilityRole="button"
          className="border-border bg-panel flex-row items-center justify-between gap-3 rounded-2xl border p-4 active:opacity-80"
        >
          <View className="flex-1 gap-1">
            <AppText weight="semibold" className="text-foreground text-[15px]">
              Track this keyword
            </AppText>
            <AppText className="text-muted text-[13px] leading-5">
              Follow it day by day and see whether it keeps climbing before you spend a weekend on
              it.
            </AppText>
          </View>
          <View className="border-accent bg-accent-soft h-10 w-10 items-center justify-center rounded-full border">
            <Eye color={palette.accent} size={17} />
          </View>
        </Pressable>
      )}

      <View className="flex-row gap-3">
        <StatCell label="Searches" value={`${formatVolume(signal.volume)}/mo`} />
        <StatCell
          label="Competition"
          value={competitionLabel(signal.competition).replace(' competition', '')}
          tone={signal.competition === 'low' ? 'up' : undefined}
        />
        <StatCell label="Window" value={`${signal.peakInDays}d`} tone="hot" />
      </View>

      <View className="border-border bg-panel gap-3 rounded-2xl border p-4">
        <SectionLabel>Why now</SectionLabel>
        <AppText className="text-muted text-[14px] leading-6">{signal.why}</AppText>
      </View>

      <View className="border-border bg-panel gap-3 rounded-2xl border p-4">
        <SectionLabel hint={`${signal.peakInDays} days left`}>Projected decay</SectionLabel>
        <View className="bg-grid h-2 overflow-hidden rounded-full">
          <View
            className="bg-hot h-full rounded-full"
            style={{ width: `${Math.round(decay * 100)}%` }}
          />
        </View>
        <AppText className="text-muted text-xs">
          Interest is projected to peak in about {signal.peakInDays} days and flatten after that.
          Acting inside the window is most of the value here.
        </AppText>
      </View>

      <SourceLinks signal={signal} />
    </View>
  );
}

function PlaybookTab({
  play,
  regenerating,
  onRegenerate,
  regenerateAvailable,
}: {
  play: Playbook;
  regenerating: boolean;
  onRegenerate: () => void;
  regenerateAvailable: boolean;
}) {
  return (
    <View className="gap-5">
      <View className="border-accent bg-accent-soft gap-3 rounded-2xl border p-4">
        <View className="flex-row items-center gap-2">
          <Target color={palette.accent} size={14} />
          <AppText
            weight="semibold"
            className="text-up text-[10px] uppercase"
            style={{ letterSpacing: 1.2 }}
          >
            {playKindLabel(play.kind)}
          </AppText>
        </View>
        <AppText weight="semibold" className="text-foreground text-[18px] leading-7">
          {play.headline}
        </AppText>
        <AppText className="text-muted text-[13px] leading-5">For: {play.audience}</AppText>
      </View>

      <View className="gap-3">
        <SectionLabel hint={`${play.steps.length} steps`}>Do this</SectionLabel>
        {play.steps.map((step, index) => (
          <View
            key={step.title}
            className="border-border bg-panel flex-row gap-3 rounded-2xl border p-4"
          >
            <View className="bg-panel-raised h-6 w-6 items-center justify-center rounded-full">
              <AppText weight="semibold" className="text-up text-xs">
                {index + 1}
              </AppText>
            </View>
            <View className="flex-1 gap-1">
              <AppText weight="semibold" className="text-foreground text-[14px]">
                {step.title}
              </AppText>
              <AppText className="text-muted text-[13px] leading-5">{step.detail}</AppText>
            </View>
          </View>
        ))}
      </View>

      <View className="gap-3">
        <SectionLabel>Angles that work</SectionLabel>
        {play.angles.map((angle) => (
          <View
            key={angle}
            className="border-border bg-panel flex-row gap-2 rounded-2xl border p-4"
          >
            <AppText className="text-up">—</AppText>
            <AppText className="text-foreground flex-1 text-[14px] leading-6">{angle}</AppText>
          </View>
        ))}
      </View>

      <View className="border-border bg-panel gap-2 rounded-2xl border p-4">
        <SectionLabel>Money</SectionLabel>
        <AppText weight="semibold" className="text-foreground text-[15px]">
          {play.monetization.model}
        </AppText>
        <AppText weight="semibold" className="text-up text-[15px]">
          {play.monetization.estimate}
        </AppText>
        <AppText className="text-muted text-[13px] leading-5">{play.monetization.note}</AppText>
      </View>

      {regenerateAvailable ? (
        <Pressable
          onPress={onRegenerate}
          disabled={regenerating}
          accessibilityRole="button"
          className={cn(
            'border-border bg-panel flex-row items-center justify-center gap-2 rounded-2xl border py-3.5 active:opacity-70',
            regenerating && 'opacity-60',
          )}
        >
          <Sparkles color={palette.accent} size={15} />
          <AppText weight="semibold" className="text-foreground text-[14px]">
            {regenerating ? 'Rewriting the playbook...' : 'Regenerate with a different angle'}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

function PitchTab({
  play,
  shared,
  onShare,
}: {
  play: Playbook;
  shared: boolean;
  onShare: () => void;
}) {
  return (
    <View className="gap-5">
      <View className="border-border bg-panel gap-3 rounded-2xl border p-4">
        <SectionLabel hint="Ready to publish">Your first post</SectionLabel>
        <AppText className="text-foreground text-[15px] leading-7">{play.firstPost}</AppText>
      </View>

      <Pressable
        onPress={onShare}
        accessibilityRole="button"
        className="bg-accent flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-80"
      >
        {shared ? (
          <Check color={palette.accentInk} size={16} />
        ) : (
          <Copy color={palette.accentInk} size={16} />
        )}
        <AppText weight="semibold" className="text-accent-foreground text-[15px]">
          {shared ? 'Copied' : 'Copy or share it'}
        </AppText>
      </Pressable>

      <View className="gap-3">
        <SectionLabel hint="Target these">Keywords</SectionLabel>
        {play.keywords.map((keyword) => (
          <View
            key={keyword}
            className="border-border bg-panel flex-row items-center justify-between rounded-2xl border px-4 py-3"
          >
            <AppText className="text-foreground flex-1 text-[14px]">{keyword}</AppText>
            <ArrowLeft
              color={palette.inkDim}
              size={14}
              style={{ transform: [{ rotate: '135deg' }] }}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
