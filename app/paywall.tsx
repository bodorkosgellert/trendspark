import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Check, X, Zap } from 'lucide-react-native';

import { AppText } from '@/components/ui/Text';
import { CREDIT_PACKS, PLANS } from '@/lib/data/catalog';
import { successFeedback, tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import { useWalletStore } from '@/lib/store/useWalletStore';
import type { PlanId } from '@/lib/types';
import { cn } from '@/lib/utils';

type Mode = 'plans' | 'packs';

export default function PaywallScreen() {
  const subscribe = useWalletStore((state) => state.subscribe);
  const buyPack = useWalletStore((state) => state.buyPack);
  const plan = useWalletStore((state) => state.plan);

  const [mode, setMode] = useState<Mode>('plans');
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('weekly');
  const [selectedPack, setSelectedPack] = useState<string>('pack-10');

  const confirm = () => {
    successFeedback();
    if (mode === 'plans') {
      subscribe(selectedPlan);
    } else {
      buyPack(selectedPack);
    }
    router.back();
  };

  return (
    <View className="bg-background flex-1">
      <View className="pt-safe-offset-3 flex-row items-center justify-between px-5 pb-2">
        <View className="flex-1" />
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
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <View className="bg-accent-soft h-11 w-11 items-center justify-center rounded-2xl">
            <Zap color={palette.accent} size={22} />
          </View>
          <AppText weight="bold" className="text-foreground text-[27px] leading-9">
            Act on every window, not just one a day.
          </AppText>
          <AppText className="text-muted text-[14px] leading-6">
            The free plan gives you one briefing a day and two playbooks. A plan keeps credits
            topped up and puts you 12 hours ahead of everyone else.
          </AppText>
        </View>

        <View className="flex-row gap-2">
          {(['plans', 'packs'] as Mode[]).map((item) => {
            const active = mode === item;
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
                  'flex-1 items-center rounded-full border py-2.5 active:opacity-70',
                  active ? 'border-accent bg-accent-soft' : 'border-border bg-panel',
                )}
              >
                <AppText
                  weight="semibold"
                  className={cn('text-xs', active ? 'text-up' : 'text-muted')}
                >
                  {item === 'plans' ? 'Plans' : 'One-off credits'}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {mode === 'plans'
          ? PLANS.map((item) => {
              const active = selectedPlan === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    tapFeedback();
                    setSelectedPlan(item.id);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  className={cn(
                    'gap-3 rounded-2xl border p-5 active:opacity-80',
                    active ? 'border-accent bg-accent-soft' : 'border-border bg-panel',
                  )}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <AppText weight="semibold" className="text-foreground text-[16px]">
                        {item.label}
                      </AppText>
                      {item.id === 'weekly' ? (
                        <View className="bg-panel-raised rounded-full px-2 py-0.5">
                          <AppText weight="semibold" className="text-hot text-[10px]">
                            MOST PICKED
                          </AppText>
                        </View>
                      ) : null}
                      {plan === item.id ? (
                        <View className="bg-accent rounded-full px-2 py-0.5">
                          <AppText weight="semibold" className="text-accent-foreground text-[10px]">
                            ACTIVE
                          </AppText>
                        </View>
                      ) : null}
                    </View>
                    <View className="items-end">
                      <AppText weight="bold" className="text-foreground text-[19px]">
                        {item.price}
                      </AppText>
                      <AppText className="text-ink-dim text-[11px]">{item.cadence}</AppText>
                    </View>
                  </View>
                  <View className="gap-2">
                    {item.perks.map((perk) => (
                      <View key={perk} className="flex-row items-start gap-2">
                        <Check color={palette.accent} size={14} />
                        <AppText className="text-muted flex-1 text-[13px] leading-5">
                          {perk}
                        </AppText>
                      </View>
                    ))}
                  </View>
                </Pressable>
              );
            })
          : CREDIT_PACKS.map((pack) => {
              const active = selectedPack === pack.id;
              return (
                <Pressable
                  key={pack.id}
                  onPress={() => {
                    tapFeedback();
                    setSelectedPack(pack.id);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  className={cn(
                    'flex-row items-center justify-between rounded-2xl border p-5 active:opacity-80',
                    active ? 'border-accent bg-accent-soft' : 'border-border bg-panel',
                  )}
                >
                  <View className="gap-1">
                    <AppText weight="semibold" className="text-foreground text-[16px]">
                      {pack.credits} playbooks
                    </AppText>
                    <AppText className="text-muted text-xs">{pack.perUnlock}</AppText>
                  </View>
                  <AppText weight="bold" className="text-foreground text-[19px]">
                    {pack.price}
                  </AppText>
                </Pressable>
              );
            })}
      </ScrollView>

      <View className="pb-safe-offset-4 border-border bg-canvas gap-3 border-t px-5 pt-4">
        <Pressable
          onPress={confirm}
          accessibilityRole="button"
          className="bg-accent items-center rounded-2xl py-4 active:opacity-80"
        >
          <AppText weight="semibold" className="text-accent-foreground text-[15px]">
            {mode === 'plans' ? 'Start plan' : 'Buy credits'}
          </AppText>
        </Pressable>
        <AppText className="text-ink-dim text-center text-[11px] leading-4">
          Billed through the App Store or Play Store. Cancel any time. Purchases are simulated in
          this build.
        </AppText>
      </View>
    </View>
  );
}
