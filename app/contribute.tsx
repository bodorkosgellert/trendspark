import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Info, X } from 'lucide-react-native';

import { AmountDial } from '@/components/AmountDial';
import { SectionLabel } from '@/components/SectionLabel';
import { AppText } from '@/components/ui/Text';
import {
  CONTRIBUTION_TIERS,
  DEFAULT_TIER_INDEX,
  FEED_COST_MONTHLY_CENTS,
  nearestTierIndex,
  OUTCOME_STEPS_CENTS,
  SHARE_FRACTIONS,
  STORE_NET_SHARE,
} from '@/lib/data/catalog';
import { euro } from '@/lib/format';
import { successFeedback, tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import { useSignalStore } from '@/lib/store/useSignalStore';
import { runCostCents, useSupportStore, valueMoments } from '@/lib/store/useSupportStore';
import { cn } from '@/lib/utils';

type Mode = 'flat' | 'share';

const MODES: { id: Mode; label: string }[] = [
  { id: 'flat', label: 'Pick an amount' },
  { id: 'share', label: 'Share of an outcome' },
];

export default function ContributeScreen() {
  const usage = useSupportStore((state) => state.usage);
  const contribute = useSupportStore((state) => state.contribute);
  const markPromptSeen = useSupportStore((state) => state.markPromptSeen);
  const watchedCount = useSignalStore((state) => state.watched.length);

  const [mode, setMode] = useState<Mode>('flat');
  const [index, setIndex] = useState(DEFAULT_TIER_INDEX);
  const [outcomeStep, setOutcomeStep] = useState(2);
  const [fraction, setFraction] = useState<number>(0.03);

  const cost = runCostCents(usage);
  const moments = valueMoments(usage);

  const outcomeCents = OUTCOME_STEPS_CENTS[outcomeStep] ?? 0;
  const rawShareCents = Math.round(outcomeCents * fraction);
  const shareIndex = nearestTierIndex(rawShareCents);

  const activeIndex = mode === 'flat' ? index : shareIndex;
  const tier = CONTRIBUTION_TIERS[activeIndex];
  const zero = tier.cents === 0;

  const confirm = () => {
    if (zero) {
      tapFeedback();
      markPromptSeen();
      router.back();
      return;
    }
    successFeedback();
    contribute(
      tier.cents,
      mode === 'share'
        ? `${Math.round(fraction * 100)}% of ${euro(outcomeCents)}`
        : 'Pay what it was worth',
      mode,
    );
    router.back();
  };

  return (
    <View className="bg-background flex-1">
      <View className="pt-safe-offset-3 flex-row items-center justify-between px-5 pb-2">
        <View className="flex-1" />
        <Pressable
          onPress={() => {
            markPromptSeen();
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="border-border bg-panel h-9 w-9 items-center justify-center rounded-full border active:opacity-70"
        >
          <X color={palette.muted} size={16} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-6 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <AppText weight="bold" className="text-foreground text-[27px] leading-9">
            You decide what this was worth.
          </AppText>
          <AppText className="text-muted text-[14px] leading-6">
            Nothing in TrendSpark is locked and nothing here changes that. Paying is a judgement you
            make after the fact, and zero is a real answer.
          </AppText>
        </View>

        <View className="border-border bg-panel gap-3 rounded-2xl border p-4">
          <SectionLabel hint={`${moments} value moments`}>What you have used</SectionLabel>
          <View className="flex-row gap-3">
            <Stat label="Playbooks" value={String(usage.playbook)} />
            <Stat label="Briefings" value={String(usage.briefing)} />
            <Stat label="Tracked" value={String(watchedCount)} />
          </View>
          <View className="bg-border h-px" />
          <AppText className="text-muted text-[12px] leading-5">
            Serving all of that cost {euro(cost)} in speech synthesis and model calls. The demand
            feed behind it costs {euro(FEED_COST_MONTHLY_CENTS)} a month to refresh, whether one
            person uses it or a hundred thousand do.
          </AppText>
        </View>

        <View className="flex-row gap-2">
          {MODES.map((item) => {
            const active = mode === item.id;
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
                  'flex-1 items-center rounded-full border py-2.5 active:opacity-70',
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

        {mode === 'flat' ? (
          <AmountDial
            index={index}
            onChange={setIndex}
            caption={
              zero
                ? 'Closes without paying. Nothing gets taken away.'
                : `About ${euro(Math.round(tier.cents * STORE_NET_SHARE))} of this reaches the developer after store fees.`
            }
          />
        ) : (
          <View className="gap-4">
            <View className="border-border bg-panel gap-4 rounded-3xl border p-5">
              <View className="items-center gap-1">
                <AppText weight="bold" className="text-foreground text-[34px] leading-none">
                  {tier.price}
                </AppText>
                <AppText className="text-ink-dim text-center text-[12px] leading-5">
                  {Math.round(fraction * 100)}% of {euro(outcomeCents)} is {euro(rawShareCents)},
                  charged at the nearest available price.
                </AppText>
              </View>

              <View className="gap-2">
                <SectionLabel>What it made you</SectionLabel>
                <View className="flex-row flex-wrap gap-2">
                  {OUTCOME_STEPS_CENTS.map((step, stepIndex) => {
                    const active = stepIndex === outcomeStep;
                    return (
                      <Pressable
                        key={step}
                        onPress={() => {
                          tapFeedback();
                          setOutcomeStep(stepIndex);
                        }}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        className={cn(
                          'rounded-full border px-3 py-1.5 active:opacity-70',
                          active ? 'border-accent bg-accent-soft' : 'border-border bg-panel-raised',
                        )}
                      >
                        <AppText
                          weight="semibold"
                          className={cn('text-[12px]', active ? 'text-up' : 'text-muted')}
                        >
                          {step === 0 ? 'Nothing yet' : euro(step)}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="gap-2">
                <SectionLabel>Share you want to pass back</SectionLabel>
                <View className="flex-row gap-2">
                  {SHARE_FRACTIONS.map((option) => {
                    const active = fraction === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => {
                          tapFeedback();
                          setFraction(option);
                        }}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        className={cn(
                          'flex-1 items-center rounded-full border py-2 active:opacity-70',
                          active ? 'border-accent bg-accent-soft' : 'border-border bg-panel-raised',
                        )}
                      >
                        <AppText
                          weight="semibold"
                          className={cn('text-[12px]', active ? 'text-up' : 'text-muted')}
                        >
                          {Math.round(option * 100)}%
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <View className="border-border bg-panel flex-row items-start gap-2 rounded-2xl border p-4">
              <Info color={palette.hot} size={15} />
              <AppText className="text-muted flex-1 text-[12px] leading-5">
                The outcome is whatever you say it is. TrendSpark cannot see your revenue and never
                asks for access to it, so this is a fairness dial, not a commission — and it is why
                the app can never bill you for a result it did not witness.
              </AppText>
            </View>
          </View>
        )}

        <View className="border-border bg-panel gap-2 rounded-2xl border p-4">
          <SectionLabel>Why the amounts are fixed</SectionLabel>
          <AppText className="text-muted text-[12px] leading-5">
            A free-text amount is not possible inside an app. Apple sells from a fixed ladder of
            price points and Google Play requires declared prices, so every rung above is a separate
            one-off product. Both stores also take 15 to 30% of anything paid in-app.
          </AppText>
        </View>
      </ScrollView>

      <View className="pb-safe-offset-4 border-border bg-canvas gap-3 border-t px-5 pt-4">
        <Pressable
          onPress={confirm}
          accessibilityRole="button"
          className={cn(
            'items-center rounded-2xl py-4 active:opacity-80',
            zero ? 'border-border bg-panel border' : 'bg-accent',
          )}
        >
          <AppText
            weight="semibold"
            className={cn('text-[15px]', zero ? 'text-muted' : 'text-accent-foreground')}
          >
            {zero ? 'Not this time' : `Pay ${tier.price}`}
          </AppText>
        </Pressable>
        <AppText className="text-ink-dim text-center text-[11px] leading-4">
          Nothing unlocks and nothing locks. Payments are simulated in this build.
        </AppText>
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="border-border bg-panel-raised flex-1 gap-1 rounded-xl border p-3">
      <AppText
        weight="semibold"
        className="text-ink-dim text-[9px] uppercase"
        style={{ letterSpacing: 1 }}
      >
        {label}
      </AppText>
      <AppText weight="bold" className="text-foreground text-[17px]">
        {value}
      </AppText>
    </View>
  );
}
