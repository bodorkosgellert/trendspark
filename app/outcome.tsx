import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Info, Trash2, X } from 'lucide-react-native';

import { SectionLabel } from '@/components/SectionLabel';
import { AppText } from '@/components/ui/Text';
import { OUTCOME_STAGES, REVENUE_PRESETS_CENTS } from '@/lib/data/catalog';
import { getSignalById } from '@/lib/data/signals';
import { euro } from '@/lib/format';
import { successFeedback, tapFeedback } from '@/lib/haptics';
import { centsToInput, parseAmountToCents } from '@/lib/outcomes';
import { palette } from '@/lib/palette';
import { outcomeForSignal, useOutcomeStore } from '@/lib/store/useOutcomeStore';
import type { OutcomeStage } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Log what a play actually did.
 *
 * The revenue field is free text on purpose. A contribution has to come off a
 * fixed ladder of store price points, but what the user *earned* is just a
 * number they state, so there is no reason to round it — and the gap between the
 * two is exactly what the contribution screen has to explain.
 */
export default function OutcomeScreen() {
  const { signalId } = useLocalSearchParams<{ signalId: string }>();
  const signal = useMemo(() => getSignalById(signalId), [signalId]);

  const outcomes = useOutcomeStore((state) => state.outcomes);
  const log = useOutcomeStore((state) => state.log);
  const remove = useOutcomeStore((state) => state.remove);

  const existing = signal ? outcomeForSignal(outcomes, signal.id) : undefined;

  const [stage, setStage] = useState<OutcomeStage>(existing?.stage ?? 'shipped');
  const [amount, setAmount] = useState(centsToInput(existing?.revenueCents ?? 0));
  const [note, setNote] = useState(existing?.note ?? '');

  const revenueCents = parseAmountToCents(amount);

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

  const save = (thenContribute: boolean) => {
    successFeedback();
    const id = log({ signalId: signal.id, stage, revenueCents, note: note.trim() });
    if (thenContribute && revenueCents > 0) {
      router.replace({ pathname: '/contribute', params: { outcomeId: id } });
      return;
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="bg-background flex-1"
    >
      <View className="pt-safe-offset-3 flex-row items-center justify-between px-5 pb-2">
        <AppText
          weight="semibold"
          className="text-ink-dim text-[11px] uppercase"
          style={{ letterSpacing: 1.2 }}
        >
          {existing ? 'Update result' : 'Log a result'}
        </AppText>
        <Pressable
          onPress={() => router.back()}
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          <AppText weight="bold" className="text-foreground text-[24px] leading-8">
            {signal.keyword}
          </AppText>
          <AppText className="text-muted text-[13px] leading-6">
            Whatever came out of this play, put it here. It stays on your device and nothing checks
            it — the app cannot see your revenue and never asks for access.
          </AppText>
        </View>

        <View className="gap-3">
          <SectionLabel>How far did it get</SectionLabel>
          {OUTCOME_STAGES.map((item) => {
            const active = stage === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  tapFeedback();
                  setStage(item.id);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                className={cn(
                  'gap-1 rounded-2xl border p-4 active:opacity-80',
                  active ? 'border-accent bg-accent-soft' : 'border-border bg-panel',
                )}
              >
                <AppText
                  weight="semibold"
                  className={cn('text-[14px]', active ? 'text-foreground' : 'text-muted')}
                >
                  {item.label}
                </AppText>
                <AppText className="text-ink-dim text-[12px] leading-5">{item.blurb}</AppText>
              </Pressable>
            );
          })}
        </View>

        <View className="gap-3">
          <SectionLabel hint="Optional">What it made you</SectionLabel>
          <View className="border-border bg-panel flex-row items-center gap-2 rounded-2xl border px-4 py-3">
            <AppText weight="bold" className="text-ink-dim text-[22px]">
              €
            </AppText>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={palette.inkDim}
              accessibilityLabel="Amount this play earned"
              className="text-foreground flex-1 text-[22px]"
              style={{ fontFamily: 'Inter_700Bold' }}
            />
          </View>
          <View className="flex-row gap-2">
            {REVENUE_PRESETS_CENTS.map((preset) => (
              <Pressable
                key={preset}
                onPress={() => {
                  tapFeedback();
                  setAmount(centsToInput(preset));
                }}
                accessibilityRole="button"
                className="border-border bg-panel-raised flex-1 items-center rounded-full border py-2 active:opacity-70"
              >
                <AppText weight="semibold" className="text-muted text-[12px]">
                  {euro(preset)}
                </AppText>
              </Pressable>
            ))}
          </View>
          <AppText className="text-ink-dim text-[11px] leading-4">
            Any number works here — unlike a payment, a reported figure is not a store price point.
            Leave it empty if the thing exists but has not sold.
          </AppText>
        </View>

        <View className="gap-3">
          <SectionLabel hint="Optional">What you actually built</SectionLabel>
          <TextInput
            value={note}
            onChangeText={setNote}
            multiline
            placeholder="A Notion template, 40 sales in the first week…"
            placeholderTextColor={palette.inkDim}
            accessibilityLabel="Note about this result"
            className="border-border bg-panel text-foreground min-h-24 rounded-2xl border p-4 text-[14px]"
            style={{ fontFamily: 'Inter_400Regular', textAlignVertical: 'top' }}
          />
        </View>

        <View className="border-border bg-panel flex-row items-start gap-2 rounded-2xl border p-4">
          <Info color={palette.hot} size={15} />
          <AppText className="text-muted flex-1 text-[12px] leading-5">
            This is a ledger, not an invoice. Logging a result never triggers a charge and never
            obliges you to pay anything — you decide afterwards, and zero stays a real answer.
          </AppText>
        </View>

        {existing ? (
          <Pressable
            onPress={() => {
              tapFeedback();
              remove(existing.id);
              router.back();
            }}
            accessibilityRole="button"
            className="flex-row items-center justify-center gap-2 py-1 active:opacity-70"
          >
            <Trash2 color={palette.down} size={14} />
            <AppText weight="medium" className="text-down text-[12px]">
              Delete this result
            </AppText>
          </Pressable>
        ) : null}
      </ScrollView>

      <View className="pb-safe-offset-4 border-border bg-canvas gap-2 border-t px-5 pt-4">
        <Pressable
          onPress={() => save(revenueCents > 0)}
          accessibilityRole="button"
          className="bg-accent items-center rounded-2xl py-4 active:opacity-80"
        >
          <AppText weight="semibold" className="text-accent-foreground text-[15px]">
            {revenueCents > 0 ? `Save ${euro(revenueCents)} and pass back a share` : 'Save result'}
          </AppText>
        </Pressable>
        {revenueCents > 0 ? (
          <Pressable
            onPress={() => save(false)}
            accessibilityRole="button"
            className="items-center py-1 active:opacity-70"
          >
            <AppText weight="medium" className="text-muted text-[12px]">
              Just save it
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}
