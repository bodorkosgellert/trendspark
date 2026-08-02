import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowUpRight, Bot, Check, Heart, Trophy, Unlock } from 'lucide-react-native';

import { SectionLabel } from '@/components/SectionLabel';
import { AppText } from '@/components/ui/Text';
import { FEED_COST_MONTHLY_CENTS, MONTHLY_TIERS } from '@/lib/data/catalog';
import { euro } from '@/lib/format';
import { successFeedback, tapFeedback } from '@/lib/haptics';
import { outcomeTotals } from '@/lib/outcomes';
import { palette } from '@/lib/palette';
import { useOutcomeStore } from '@/lib/store/useOutcomeStore';
import { useSignalStore } from '@/lib/store/useSignalStore';
import { runCostCents, useSupportStore } from '@/lib/store/useSupportStore';
import { cn } from '@/lib/utils';

export default function SupportScreen() {
  const contributedCents = useSupportStore((state) => state.contributedCents);
  const contributions = useSupportStore((state) => state.contributions);
  const usage = useSupportStore((state) => state.usage);
  const monthlyTierId = useSupportStore((state) => state.monthlyTierId);
  const setMonthly = useSupportStore((state) => state.setMonthly);
  const openedCount = useSignalStore((state) => state.openedIds.length);
  const watchedCount = useSignalStore((state) => state.watched.length);
  const outcomes = useOutcomeStore((state) => state.outcomes);

  const cost = runCostCents(usage);
  const covered = cost > 0 ? Math.min(100, Math.round((contributedCents / cost) * 100)) : null;
  const results = outcomeTotals(outcomes);

  return (
    <View className="bg-background flex-1">
      <View className="pt-safe-offset-3 border-border bg-canvas border-b px-5 pb-3">
        <AppText weight="bold" className="text-foreground text-[17px]">
          Support
        </AppText>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-5 gap-6 pb-safe-offset-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="border-border bg-panel items-center gap-2 rounded-3xl border p-6">
          <View className="flex-row items-end gap-2">
            {contributedCents > 0 ? (
              <Heart color={palette.accent} size={24} fill={palette.accent} />
            ) : (
              <Unlock color={palette.accent} size={24} />
            )}
            <AppText weight="bold" className="text-foreground text-[40px] leading-none">
              {euro(contributedCents)}
            </AppText>
          </View>
          <AppText weight="medium" className="text-muted text-sm">
            contributed so far
          </AppText>
          <AppText className="text-ink-dim mt-1 text-center text-xs leading-5">
            {contributedCents > 0
              ? covered !== null && covered >= 100
                ? 'That covers everything your account has cost, and some of someone else’s.'
                : `That covers about ${covered ?? 0}% of what your usage cost to serve.`
              : 'Zero is a legitimate answer. Everything stays open either way.'}
          </AppText>
        </View>

        <Pressable
          onPress={() => {
            tapFeedback();
            router.push('/contribute');
          }}
          accessibilityRole="button"
          className="border-accent bg-accent-soft flex-row items-center justify-between rounded-2xl border p-4 active:opacity-80"
        >
          <View className="flex-1 gap-1">
            <AppText weight="semibold" className="text-foreground text-[15px]">
              Decide what it was worth
            </AppText>
            <AppText className="text-muted text-xs">
              Pick an amount, or pass back a share of what it made you.
            </AppText>
          </View>
          <ArrowUpRight color={palette.accent} size={18} />
        </Pressable>

        <Pressable
          onPress={() => {
            tapFeedback();
            router.push({ pathname: '/(tabs)/plays', params: { mode: 'results' } });
          }}
          accessibilityRole="button"
          className="border-border bg-panel gap-3 rounded-2xl border p-4 active:opacity-80"
        >
          <View className="flex-row items-center gap-2">
            <Trophy color={palette.accent} size={15} />
            <AppText weight="semibold" className="text-foreground flex-1 text-[15px]">
              What it made you
            </AppText>
            <ArrowUpRight color={palette.inkDim} size={16} />
          </View>
          {results.logged === 0 ? (
            <AppText className="text-muted text-[12px] leading-5">
              Nothing logged yet. When a play ships or earns, record it — then you can pass back a
              share of your own number instead of guessing an amount.
            </AppText>
          ) : (
            <>
              <View className="flex-row gap-3">
                <MiniStat label="Reported" value={euro(results.revenueCents)} />
                <MiniStat label="Passed back" value={euro(results.passedBackCents)} />
                <MiniStat
                  label="Share paid"
                  value={
                    results.sharePct === null
                      ? '—'
                      : `${results.sharePct.toFixed(results.sharePct < 1 ? 1 : 0)}%`
                  }
                />
              </View>
              <AppText className="text-ink-dim text-[11px] leading-4">
                Self-reported across {results.logged} {results.logged === 1 ? 'play' : 'plays'}.
                TrendSpark never verifies these figures and they never leave your device.
              </AppText>
            </>
          )}
        </Pressable>

        <View className="gap-3">
          <SectionLabel hint="Nothing is gated">What you have used</SectionLabel>
          <View className="flex-row gap-3">
            <Stat label="Playbooks read" value={String(openedCount)} />
            <Stat label="Briefings played" value={String(usage.briefing)} />
            <Stat label="Keywords tracked" value={String(watchedCount)} />
          </View>
        </View>

        <View className="border-border bg-panel gap-3 rounded-2xl border p-4">
          <SectionLabel>What that cost</SectionLabel>
          <View className="flex-row items-center justify-between">
            <AppText className="text-muted text-[13px]">Your usage, all time</AppText>
            <AppText weight="semibold" className="text-foreground text-[13px]">
              {euro(cost)}
            </AppText>
          </View>
          <View className="bg-border h-px" />
          <View className="flex-row items-center justify-between">
            <AppText className="text-muted text-[13px]">Shared demand feed, monthly</AppText>
            <AppText weight="semibold" className="text-foreground text-[13px]">
              {euro(FEED_COST_MONTHLY_CENTS)}
            </AppText>
          </View>
          <AppText className="text-ink-dim text-[11px] leading-4">
            The feed costs the same whatever the user count, so a small number of people paying
            covers everyone. Only the voice briefing has a real per-use cost — speech synthesis is
            billed per character.
          </AppText>
        </View>

        <View className="gap-3">
          <SectionLabel hint="Unlocks nothing extra">Keep it running</SectionLabel>
          {MONTHLY_TIERS.map((tier) => {
            const active = monthlyTierId === tier.id;
            return (
              <Pressable
                key={tier.id}
                onPress={() => {
                  successFeedback();
                  setMonthly(active ? null : tier.id);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                className={cn(
                  'flex-row items-center justify-between gap-3 rounded-2xl border p-4 active:opacity-80',
                  active ? 'border-accent bg-accent-soft' : 'border-border bg-panel',
                )}
              >
                <View className="flex-1 gap-1">
                  <View className="flex-row items-center gap-2">
                    <AppText weight="semibold" className="text-foreground text-[15px]">
                      {tier.label}
                    </AppText>
                    {active ? (
                      <View className="bg-accent rounded-full px-2 py-0.5">
                        <AppText weight="semibold" className="text-accent-foreground text-[10px]">
                          ACTIVE
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                  <AppText className="text-muted text-xs leading-5">{tier.blurb}</AppText>
                </View>
                <AppText weight="bold" className="text-foreground text-[17px]">
                  {tier.price}
                </AppText>
              </Pressable>
            );
          })}
          <AppText className="text-ink-dim text-[11px] leading-4">
            A monthly amount buys no extra access, no earlier signals and no bigger allowance. It
            only keeps the feed alive. Tap an active tier to stop it.
          </AppText>
        </View>

        <Pressable
          onPress={() => {
            tapFeedback();
            router.push('/agent');
          }}
          accessibilityRole="button"
          className="border-border bg-panel flex-row items-center justify-between rounded-2xl border p-4 active:opacity-80"
        >
          <View className="flex-1 flex-row items-center gap-3">
            <View className="bg-panel-raised h-9 w-9 items-center justify-center rounded-xl">
              <Bot color={palette.accent} size={17} />
            </View>
            <View className="flex-1 gap-0.5">
              <AppText weight="semibold" className="text-foreground text-[14px]">
                Machine access
              </AppText>
              <AppText className="text-muted text-xs">
                Per-request signal API for agents — the one metered lane, specified, not yet served
              </AppText>
            </View>
          </View>
          <ArrowUpRight color={palette.inkDim} size={16} />
        </Pressable>

        {contributions.length > 0 ? (
          <View className="gap-3">
            <SectionLabel hint={`${contributions.length} entries`}>Your contributions</SectionLabel>
            {contributions.map((item) => (
              <View
                key={item.id}
                className="border-border bg-panel flex-row items-center justify-between rounded-2xl border px-4 py-3"
              >
                <View className="flex-1 gap-0.5 pr-3">
                  <AppText
                    weight="medium"
                    className="text-foreground text-[13px]"
                    numberOfLines={1}
                  >
                    {item.label}
                  </AppText>
                  <AppText className="text-ink-dim text-[11px]">
                    {new Date(item.at).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </AppText>
                </View>
                <AppText weight="semibold" className="text-up text-sm">
                  {euro(item.cents)}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}

        <View className="border-border bg-panel flex-row items-start gap-2 rounded-2xl border p-4">
          <Check color={palette.accent} size={15} />
          <AppText className="text-muted flex-1 text-[12px] leading-5">
            Every playbook, briefing and timeline is open on every account, forever. Paying changes
            nothing about what you can see — it only decides whether this keeps existing.
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="border-border bg-panel-raised flex-1 gap-1 rounded-xl border p-3">
      <AppText
        weight="semibold"
        className="text-ink-dim text-[9px] uppercase"
        style={{ letterSpacing: 0.8 }}
        numberOfLines={1}
      >
        {label}
      </AppText>
      <AppText weight="bold" className="text-foreground text-[15px]" numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="border-border bg-panel flex-1 gap-1 rounded-2xl border p-3">
      <AppText
        weight="semibold"
        className="text-ink-dim text-[10px] uppercase"
        style={{ letterSpacing: 1 }}
      >
        {label}
      </AppText>
      <AppText weight="bold" className="text-foreground text-[20px]">
        {value}
      </AppText>
    </View>
  );
}
