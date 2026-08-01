import { View } from 'react-native';
import { Check } from 'lucide-react-native';

import { AppText } from '@/components/ui/Text';
import { euro } from '@/lib/format';
import type { OutcomeTotals, ProgressStep } from '@/lib/outcomes';
import { palette } from '@/lib/palette';
import { cn } from '@/lib/utils';

interface ProgressLadderProps {
  steps: ProgressStep[];
  totals: OutcomeTotals;
}

/**
 * What the user has actually got out of the app, in order of how hard it is.
 *
 * The reported total sits on top because it is the number the pay-after ask is
 * anchored to — and it is labelled as self-reported every time it is shown, so
 * nobody mistakes it for something TrendSpark measured.
 */
export function ProgressLadder({ steps, totals }: ProgressLadderProps) {
  return (
    <View className="border-border bg-panel gap-5 rounded-3xl border p-5">
      <View className="items-center gap-1">
        <AppText
          weight="semibold"
          className="text-ink-dim text-[10px] uppercase"
          style={{ letterSpacing: 1.2 }}
        >
          You have reported
        </AppText>
        <AppText weight="bold" className="text-foreground text-[38px] leading-none">
          {euro(totals.revenueCents)}
        </AppText>
        <AppText className="text-ink-dim text-center text-[12px] leading-5">
          {totals.logged === 0
            ? 'Log a result once a play does something and it lands here.'
            : totals.sharePct === null
              ? `${totals.logged} ${totals.logged === 1 ? 'result' : 'results'} logged. Your numbers, never verified, never sent anywhere.`
              : `${euro(totals.passedBackCents)} passed back — ${totals.sharePct.toFixed(totals.sharePct < 1 ? 1 : 0)}% of it.`}
        </AppText>
      </View>

      <View className="gap-0">
        {steps.map((step, index) => {
          const reached = step.value > 0;
          const last = index === steps.length - 1;
          return (
            <View key={step.key} className="flex-row gap-3">
              <View className="items-center">
                <View
                  className={cn(
                    'h-7 w-7 items-center justify-center rounded-full border',
                    reached ? 'border-accent bg-accent-soft' : 'border-border bg-panel-raised',
                  )}
                >
                  {reached ? (
                    <Check color={palette.accent} size={13} />
                  ) : (
                    <View className="bg-grid h-1.5 w-1.5 rounded-full" />
                  )}
                </View>
                {last ? null : (
                  <View className={cn('w-px flex-1', reached ? 'bg-accent/40' : 'bg-border')} />
                )}
              </View>
              <View className={cn('flex-1 gap-0.5', last ? 'pb-0' : 'pb-4')}>
                <View className="flex-row items-center justify-between">
                  <AppText
                    weight="semibold"
                    className={cn('text-[14px]', reached ? 'text-foreground' : 'text-muted')}
                  >
                    {step.label}
                  </AppText>
                  <AppText
                    weight="bold"
                    className={cn('text-[15px]', reached ? 'text-up' : 'text-ink-dim')}
                  >
                    {step.value}
                  </AppText>
                </View>
                <AppText className="text-ink-dim text-[11px] leading-4">{step.detail}</AppText>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
