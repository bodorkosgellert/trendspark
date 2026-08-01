import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowUpRight, Bot, Check, Zap } from 'lucide-react-native';

import { SectionLabel } from '@/components/SectionLabel';
import { AppText } from '@/components/ui/Text';
import { CREDIT_PACKS, PLANS } from '@/lib/data/catalog';
import { successFeedback, tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import { useWalletStore } from '@/lib/store/useWalletStore';
import { cn } from '@/lib/utils';

function ledgerColor(delta: number): string {
  return delta > 0 ? 'text-up' : 'text-muted';
}

export default function WalletScreen() {
  const credits = useWalletStore((state) => state.credits);
  const plan = useWalletStore((state) => state.plan);
  const ledger = useWalletStore((state) => state.ledger);
  const buyPack = useWalletStore((state) => state.buyPack);

  const activePlan = PLANS.find((item) => item.id === plan);

  return (
    <View className="bg-background flex-1">
      <View className="pt-safe-offset-3 border-border bg-canvas border-b px-5 pb-3">
        <AppText weight="bold" className="text-foreground text-[17px]">
          Credits
        </AppText>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-5 gap-6 pb-safe-offset-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="border-border bg-panel items-center gap-2 rounded-3xl border p-6">
          <View className="flex-row items-end gap-2">
            <Zap color={palette.accent} size={26} />
            <AppText weight="bold" className="text-foreground text-[44px] leading-none">
              {credits}
            </AppText>
          </View>
          <AppText weight="medium" className="text-muted text-sm">
            {credits === 1 ? 'playbook credit' : 'playbook credits'}
          </AppText>
          <AppText className="text-ink-dim mt-1 text-center text-xs">
            {activePlan
              ? `${activePlan.label} plan · ${activePlan.includedCredits} credits refill automatically`
              : 'Free plan · one briefing a day, no auto-refill'}
          </AppText>
        </View>

        {plan === 'free' ? (
          <Pressable
            onPress={() => {
              tapFeedback();
              router.push('/paywall');
            }}
            accessibilityRole="button"
            className="border-accent bg-accent-soft flex-row items-center justify-between rounded-2xl border p-4 active:opacity-80"
          >
            <View className="flex-1 gap-1">
              <AppText weight="semibold" className="text-foreground text-[15px]">
                Get unlimited briefings
              </AppText>
              <AppText className="text-muted text-xs">
                From €4.99 a week, credits included every week.
              </AppText>
            </View>
            <ArrowUpRight color={palette.accent} size={18} />
          </Pressable>
        ) : null}

        <View className="gap-3">
          <SectionLabel hint="One credit = one playbook">Top up</SectionLabel>
          {CREDIT_PACKS.map((pack) => (
            <Pressable
              key={pack.id}
              onPress={() => {
                successFeedback();
                buyPack(pack.id);
              }}
              accessibilityRole="button"
              className={cn(
                'flex-row items-center justify-between rounded-2xl border p-4 active:opacity-80',
                pack.bestValue ? 'border-accent bg-panel' : 'border-border bg-panel',
              )}
            >
              <View className="gap-1">
                <View className="flex-row items-center gap-2">
                  <AppText weight="semibold" className="text-foreground text-[15px]">
                    {pack.credits} credits
                  </AppText>
                  {pack.bestValue ? (
                    <View className="bg-accent-soft rounded-full px-2 py-0.5">
                      <AppText weight="semibold" className="text-up text-[10px]">
                        BEST VALUE
                      </AppText>
                    </View>
                  ) : null}
                </View>
                <AppText className="text-muted text-xs">{pack.perUnlock}</AppText>
              </View>
              <View className="bg-accent rounded-full px-4 py-2">
                <AppText weight="semibold" className="text-accent-foreground text-sm">
                  {pack.price}
                </AppText>
              </View>
            </Pressable>
          ))}
          <AppText className="text-ink-dim text-[11px] leading-4">
            Credit packs are one-off in-app purchases, so a single unlock can cost well under a
            euro. Purchases are simulated in this build.
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
                Pay-per-request signal API for agents
              </AppText>
            </View>
          </View>
          <ArrowUpRight color={palette.inkDim} size={16} />
        </Pressable>

        <View className="gap-3">
          <SectionLabel hint={`${ledger.length} entries`}>Activity</SectionLabel>
          {ledger.map((entry) => (
            <View
              key={entry.id}
              className="border-border bg-panel flex-row items-center justify-between rounded-2xl border px-4 py-3"
            >
              <View className="flex-1 gap-0.5 pr-3">
                <AppText weight="medium" className="text-foreground text-[13px]" numberOfLines={1}>
                  {entry.label}
                </AppText>
                <AppText className="text-ink-dim text-[11px]">
                  {new Date(entry.at).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                  })}
                </AppText>
              </View>
              <AppText weight="semibold" className={cn('text-sm', ledgerColor(entry.delta))}>
                {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
              </AppText>
            </View>
          ))}
        </View>

        <View className="border-border bg-panel flex-row items-start gap-2 rounded-2xl border p-4">
          <Check color={palette.accent} size={15} />
          <AppText className="text-muted flex-1 text-[12px] leading-5">
            Unlocked playbooks never expire and never need a subscription to reopen.
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}
