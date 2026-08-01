import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Bookmark,
  Check,
  ChevronLeft,
  Copy,
  Lock,
  Sparkles,
  Target,
} from 'lucide-react-native';

import { MomentumBadge } from '@/components/MomentumBadge';
import { SectionLabel } from '@/components/SectionLabel';
import { Sparkline } from '@/components/Sparkline';
import { AppText } from '@/components/ui/Text';
import { NICHE_LABEL, UNLOCK_COST } from '@/lib/data/catalog';
import { getSignalById } from '@/lib/data/signals';
import { competitionLabel, detectedLabel, formatVolume, playKindLabel } from '@/lib/format';
import { successFeedback, tapFeedback } from '@/lib/haptics';
import { isModelConfigured, regeneratePlaybook } from '@/lib/openai';
import { palette } from '@/lib/palette';
import { shareText } from '@/lib/share';
import { useSignalStore } from '@/lib/store/useSignalStore';
import type { Playbook } from '@/lib/types';
import { cn } from '@/lib/utils';

type Tab = 'signal' | 'playbook' | 'pitch';

const TABS: { id: Tab; label: string }[] = [
  { id: 'signal', label: 'Signal' },
  { id: 'playbook', label: 'Playbook' },
  { id: 'pitch', label: 'First move' },
];

export default function SignalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const signal = useMemo(() => getSignalById(id), [id]);

  const unlockedIds = useSignalStore((state) => state.unlockedIds);
  const savedIds = useSignalStore((state) => state.savedIds);
  const unlock = useSignalStore((state) => state.unlock);
  const toggleSaved = useSignalStore((state) => state.toggleSaved);

  const [tab, setTab] = useState<Tab>('signal');
  const [override, setOverride] = useState<Playbook | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [shared, setShared] = useState(false);

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

  const unlocked = unlockedIds.includes(signal.id);
  const saved = savedIds.includes(signal.id);
  const play = override ?? signal.play;

  const handleUnlock = () => {
    const result = unlock(signal.id, signal.keyword);
    if (result === 'insufficient') {
      router.push('/paywall');
      return;
    }
    successFeedback();
    setTab('playbook');
  };

  const handleRegenerate = async () => {
    if (!isModelConfigured()) return;
    setRegenerating(true);
    const next = await regeneratePlaybook(signal);
    if (next) setOverride(next);
    setRegenerating(false);
  };

  const handleShare = async () => {
    const result = await shareText(play.firstPost, signal.keyword);
    if (result !== 'failed') {
      successFeedback();
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
            toggleSaved(signal.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove from saved' : 'Save signal'}
          className={cn(
            'h-9 w-9 items-center justify-center rounded-full border active:opacity-70',
            saved ? 'border-accent bg-accent-soft' : 'border-border bg-panel',
          )}
        >
          <Bookmark
            color={saved ? palette.accent : palette.muted}
            size={16}
            fill={saved ? palette.accent : 'transparent'}
          />
        </Pressable>
      </View>

      <View className="border-border bg-canvas flex-row gap-2 border-b px-5 py-3">
        {TABS.map((item) => {
          const active = tab === item.id;
          const gated = item.id !== 'signal' && !unlocked;
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
                'flex-row items-center gap-1.5 rounded-full border px-3 py-2 active:opacity-70',
                active ? 'border-accent bg-accent-soft' : 'border-border bg-panel',
              )}
            >
              {gated ? <Lock color={active ? palette.accent : palette.inkDim} size={11} /> : null}
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
        </View>

        {tab === 'signal' ? (
          <SignalTab signal={signal} />
        ) : unlocked ? (
          tab === 'playbook' ? (
            <PlaybookTab
              play={play}
              regenerating={regenerating}
              onRegenerate={handleRegenerate}
              regenerateAvailable={isModelConfigured()}
            />
          ) : (
            <PitchTab play={play} shared={shared} onShare={handleShare} />
          )
        ) : (
          <LockedPanel keyword={signal.keyword} steps={signal.play.steps.length} />
        )}
      </ScrollView>

      {!unlocked ? (
        <View className="pb-safe-offset-4 border-border bg-canvas gap-2 border-t px-5 pt-4">
          <Pressable
            onPress={handleUnlock}
            accessibilityRole="button"
            className="bg-accent flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-80"
          >
            <Lock color={palette.accentInk} size={16} />
            <AppText weight="semibold" className="text-accent-foreground text-[15px]">
              Unlock playbook · {UNLOCK_COST} credit
            </AppText>
          </Pressable>
          <AppText className="text-ink-dim text-center text-[11px]">
            One credit, yours forever. Signal data stays free.
          </AppText>
        </View>
      ) : null}
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

function SignalTab({ signal }: { signal: NonNullable<ReturnType<typeof getSignalById>> }) {
  const decay = Math.min(1, Math.max(0.08, 1 - signal.peakInDays / 30));

  return (
    <View className="gap-5">
      <View className="border-border bg-panel gap-3 rounded-2xl border p-4">
        <SectionLabel hint="Last 14 days">Interest</SectionLabel>
        <Sparkline series={signal.series} height={120} gradientId={`detail-${signal.id}`} />
      </View>

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

      <View className="gap-3">
        <SectionLabel>Sources</SectionLabel>
        <View className="flex-row flex-wrap gap-2">
          {signal.sources.map((source) => (
            <View key={source} className="border-border bg-panel rounded-full border px-3 py-1.5">
              <AppText weight="medium" className="text-muted text-xs">
                {source}
              </AppText>
            </View>
          ))}
        </View>
      </View>
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

function LockedPanel({ keyword, steps }: { keyword: string; steps: number }) {
  return (
    <View className="border-border bg-panel gap-4 rounded-2xl border p-5">
      <View className="bg-panel-raised h-10 w-10 items-center justify-center rounded-2xl">
        <Lock color={palette.accent} size={18} />
      </View>
      <AppText weight="semibold" className="text-foreground text-[17px] leading-6">
        The playbook for {keyword}
      </AppText>
      <View className="gap-2">
        {[
          `${steps} concrete steps, in order`,
          'Three angles that already work in this niche',
          'What to charge and a realistic first-month range',
          'A first post written for you',
        ].map((item) => (
          <View key={item} className="flex-row items-center gap-2">
            <Check color={palette.accent} size={14} />
            <AppText className="text-muted flex-1 text-[13px]">{item}</AppText>
          </View>
        ))}
      </View>
      <View className="border-border bg-canvas gap-2 rounded-xl border p-3">
        <AppText weight="medium" className="text-ink-dim text-[12px] leading-5">
          Locked lines look like this: &quot;Do not lead with the affiliate link, place it after the
          honest limitations section, because...&quot;
        </AppText>
      </View>
    </View>
  );
}
