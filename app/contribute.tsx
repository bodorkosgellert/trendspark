import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CreditCard, Info, Trophy, X } from 'lucide-react-native';

import { AmountDial } from '@/components/AmountDial';
import { SectionLabel } from '@/components/SectionLabel';
import { AppText } from '@/components/ui/Text';
import { track } from '@/lib/analytics';
import {
  CONTRIBUTION_TIERS,
  DEFAULT_TIER_INDEX,
  FEED_COST_MONTHLY_CENTS,
  nearestTierIndex,
  OUTCOME_STEPS_CENTS,
  SHARE_FRACTIONS,
  STORE_NET_SHARE,
} from '@/lib/data/catalog';
import { getSignalById } from '@/lib/data/signals';
import { euro } from '@/lib/format';
import { stepFeedback, successFeedback, tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import { isCheckoutConfigured, netAfterCheckoutFees, openCheckout } from '@/lib/polar';
import { useOutcomeStore } from '@/lib/store/useOutcomeStore';
import { usePrefsStore } from '@/lib/store/usePrefsStore';
import { useSignalStore } from '@/lib/store/useSignalStore';
import { runCostCents, useSupportStore, valueMoments } from '@/lib/store/useSupportStore';
import { cn } from '@/lib/utils';

type Mode = 'flat' | 'share';

const MODES: { id: Mode; label: string }[] = [
  { id: 'flat', label: 'Pick an amount' },
  { id: 'share', label: 'Share of an outcome' },
];

export default function ContributeScreen() {
  const { outcomeId, paid } = useLocalSearchParams<{ outcomeId?: string; paid?: string }>();
  const usage = useSupportStore((state) => state.usage);
  const contribute = useSupportStore((state) => state.contribute);
  const markPromptSeen = useSupportStore((state) => state.markPromptSeen);
  const watchedCount = useSignalStore((state) => state.watched.length);
  const outcomes = useOutcomeStore((state) => state.outcomes);
  const passBack = useOutcomeStore((state) => state.passBack);
  const email = usePrefsStore((state) => state.briefingEmail);

  // Arriving from a logged result anchors the share on a number the user already
  // stated, which is the whole reason the ledger exists.
  const outcome = outcomeId ? outcomes.find((item) => item.id === outcomeId) : undefined;
  const outcomeSignal = outcome ? getSignalById(outcome.signalId) : undefined;

  const [mode, setMode] = useState<Mode>(outcome ? 'share' : 'flat');
  const [index, setIndex] = useState(DEFAULT_TIER_INDEX);
  const [outcomeStep, setOutcomeStep] = useState(2);
  const [fraction, setFraction] = useState<number>(0.03);

  const card = isCheckoutConfigured();
  // Set once the hosted checkout has been opened, or when Polar's success URL
  // brings the browser back to /contribute?paid=… Zero means "came back, amount
  // unknown", which is why the confirm step falls back to the selected rung.
  const returnedCents = Number(paid);
  const [awaiting, setAwaiting] = useState<number | null>(
    paid ? (Number.isFinite(returnedCents) && returnedCents > 0 ? returnedCents : 0) : null,
  );

  const cost = runCostCents(usage);
  const moments = valueMoments(usage);

  const outcomeCents = outcome ? outcome.revenueCents : (OUTCOME_STEPS_CENTS[outcomeStep] ?? 0);
  const rawShareCents = Math.round(outcomeCents * fraction);
  const shareIndex = nearestTierIndex(rawShareCents);

  const activeIndex = mode === 'flat' ? index : shareIndex;
  const tier = CONTRIBUTION_TIERS[activeIndex];
  const zero = tier.cents === 0;

  const label =
    mode === 'share'
      ? outcomeSignal
        ? `${Math.round(fraction * 100)}% of ${euro(outcomeCents)} · ${outcomeSignal.keyword}`
        : `${Math.round(fraction * 100)}% of ${euro(outcomeCents)}`
      : 'Pay what it was worth';

  const commit = (cents: number, source: 'flat' | 'share' | 'card') => {
    contribute(cents, label, source);
    if (outcome) passBack(outcome.id, cents);
    track('contribution_confirmed', {
      cents,
      mode,
      rail: source === 'card' ? 'polar' : 'simulated',
      from_outcome: Boolean(outcome),
    });
    router.back();
  };

  const confirm = () => {
    if (zero) {
      tapFeedback();
      track('contribution_skipped', { mode });
      markPromptSeen();
      router.back();
      return;
    }

    if (card) {
      // Real money leaves the app here, so nothing is recorded until the user
      // comes back and says it went through.
      successFeedback();
      track('checkout_opened', { cents: tier.cents, mode });
      setAwaiting(tier.cents);
      void openCheckout(tier.cents, email);
      return;
    }

    successFeedback();
    commit(tier.cents, mode);
  };

  const confirmPaid = () => {
    successFeedback();
    commit(awaiting && awaiting > 0 ? awaiting : tier.cents, 'card');
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
            {outcome && outcomeSignal
              ? 'You said it worked. You decide the share.'
              : 'You decide what this was worth.'}
          </AppText>
          <AppText className="text-muted text-[14px] leading-6">
            {outcome && outcomeSignal
              ? `${outcomeSignal.keyword} made you ${euro(outcome.revenueCents)} by your own account. Pass back whatever fraction of that feels right, including none of it.`
              : 'Nothing in TrendSpark is locked and nothing here changes that. Paying is a judgement you make after the fact, and zero is a real answer.'}
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
                : card
                  ? `About ${euro(netAfterCheckoutFees(tier.cents))} of this reaches the developer after Polar's 4% + 40c.`
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
                {outcome && outcomeSignal ? (
                  <View className="border-border bg-panel-raised gap-2 rounded-2xl border p-4">
                    <View className="flex-row items-center gap-2">
                      <Trophy color={palette.accent} size={15} />
                      <AppText
                        weight="semibold"
                        className="text-foreground flex-1 text-[13px]"
                        numberOfLines={1}
                      >
                        {outcomeSignal.keyword}
                      </AppText>
                      <AppText weight="bold" className="text-foreground text-[15px]">
                        {euro(outcome.revenueCents)}
                      </AppText>
                    </View>
                    <AppText className="text-ink-dim text-[11px] leading-4">
                      {outcome.passedBackCents > 0
                        ? `You have already passed back ${euro(outcome.passedBackCents)} on this one.`
                        : 'Your own figure, from the result you logged.'}
                    </AppText>
                    <Pressable
                      onPress={() => {
                        tapFeedback();
                        router.replace({
                          pathname: '/outcome',
                          params: { signalId: outcome.signalId },
                        });
                      }}
                      accessibilityRole="button"
                      className="active:opacity-70"
                    >
                      <AppText weight="semibold" className="text-up text-[12px]">
                        Change the number
                      </AppText>
                    </Pressable>
                  </View>
                ) : (
                  <View className="flex-row flex-wrap gap-2">
                    {OUTCOME_STEPS_CENTS.map((step, stepIndex) => {
                      const active = stepIndex === outcomeStep;
                      return (
                        <Pressable
                          key={step}
                          onPress={() => {
                            stepFeedback();
                            setOutcomeStep(stepIndex);
                          }}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                          className={cn(
                            'rounded-full border px-3 py-1.5 active:opacity-70',
                            active
                              ? 'border-accent bg-accent-soft'
                              : 'border-border bg-panel-raised',
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
                )}
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
                          stepFeedback();
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
                {outcome
                  ? ' What you pass back is recorded against this play, so the ledger shows the share you have actually paid.'
                  : ' Log a result under My plays › Results and the share gets measured against your own number instead of a rough band.'}
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
          {card ? (
            <AppText className="text-ink-dim text-[11.5px] leading-5">
              On the web that restriction does not apply: the same ladder goes through a Polar
              checkout where you can change the amount before paying, there is no store cut, and
              Polar is the merchant of record so EU VAT and the invoice are handled there.
            </AppText>
          ) : null}
        </View>
      </ScrollView>

      <View className="pb-safe-offset-4 border-border bg-canvas gap-3 border-t px-5 pt-4">
        {awaiting === null ? (
          <>
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
                {zero ? 'Not this time' : card ? `Pay ${tier.price} by card` : `Pay ${tier.price}`}
              </AppText>
            </Pressable>
            <AppText className="text-ink-dim text-center text-[11px] leading-4">
              {card
                ? 'Nothing unlocks and nothing locks. Card payment runs through Polar, outside the app.'
                : 'Nothing unlocks and nothing locks. Payments are simulated in this build.'}
            </AppText>
          </>
        ) : (
          <>
            <View className="border-border bg-panel flex-row items-start gap-2 rounded-2xl border p-4">
              <CreditCard color={palette.hot} size={15} />
              <AppText className="text-muted flex-1 text-[12px] leading-5">
                The checkout opened in your browser
                {awaiting > 0 ? ` for ${euro(awaiting)}` : ''}. Come back when it is done. This app
                has no server, so it cannot ask Polar whether the payment cleared — what gets
                recorded is your word, exactly like a reported outcome.
              </AppText>
            </View>
            <Pressable
              onPress={confirmPaid}
              accessibilityRole="button"
              className="bg-accent items-center rounded-2xl py-4 active:opacity-80"
            >
              <AppText weight="semibold" className="text-accent-foreground text-[15px]">
                It went through
              </AppText>
            </Pressable>
            <Pressable
              onPress={() => {
                tapFeedback();
                setAwaiting(null);
              }}
              accessibilityRole="button"
              className="border-border bg-panel items-center rounded-2xl border py-3 active:opacity-70"
            >
              <AppText weight="medium" className="text-muted text-[13px]">
                It did not — back to the amounts
              </AppText>
            </Pressable>
          </>
        )}
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
