import { Pressable, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

import { AppText } from '@/components/ui/Text';
import { CONTRIBUTION_TIERS } from '@/lib/data/catalog';
import { tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import { cn } from '@/lib/utils';

/** Quick jumps on the ladder, by tier id. */
const PRESET_IDS = ['c-99', 'c-299', 'c-799', 'c-1999'];

interface AmountDialProps {
  index: number;
  onChange: (index: number) => void;
  caption: string;
}

/**
 * The amount picker.
 *
 * It steps along a fixed ladder rather than accepting free text because that is
 * the only shape a store allows: Apple sells from a set of declared price points
 * and Google Play requires declared prices, so every rung here is one consumable
 * product. Zero is a real rung, otherwise this would not be pay-what-you-want.
 */
export function AmountDial({ index, onChange, caption }: AmountDialProps) {
  const max = CONTRIBUTION_TIERS.length - 1;
  const tier = CONTRIBUTION_TIERS[Math.min(max, Math.max(0, index))];
  const fill = max > 0 ? index / max : 0;

  const step = (delta: number) => {
    const next = Math.min(max, Math.max(0, index + delta));
    if (next === index) return;
    tapFeedback();
    onChange(next);
  };

  return (
    <View className="border-border bg-panel gap-4 rounded-3xl border p-5">
      <View className="items-center gap-1">
        <AppText weight="bold" className="text-foreground text-[38px] leading-none">
          {tier.price}
        </AppText>
        <AppText className="text-ink-dim text-center text-[12px] leading-5">{caption}</AppText>
      </View>

      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => step(-1)}
          disabled={index === 0}
          accessibilityRole="button"
          accessibilityLabel="Lower the amount"
          className={cn(
            'border-border bg-panel-raised h-11 w-11 items-center justify-center rounded-full border active:opacity-70',
            index === 0 && 'opacity-40',
          )}
        >
          <Minus color={palette.foreground} size={18} />
        </Pressable>

        <View className="bg-grid h-2 flex-1 overflow-hidden rounded-full">
          <View
            className="bg-accent h-full rounded-full"
            style={{ width: `${Math.round(fill * 100)}%` }}
          />
        </View>

        <Pressable
          onPress={() => step(1)}
          disabled={index === max}
          accessibilityRole="button"
          accessibilityLabel="Raise the amount"
          className={cn(
            'border-accent bg-accent-soft h-11 w-11 items-center justify-center rounded-full border active:opacity-70',
            index === max && 'opacity-40',
          )}
        >
          <Plus color={palette.accent} size={18} />
        </Pressable>
      </View>

      <View className="flex-row gap-2">
        {PRESET_IDS.map((id) => {
          const presetIndex = CONTRIBUTION_TIERS.findIndex((item) => item.id === id);
          const preset = CONTRIBUTION_TIERS[presetIndex];
          const active = presetIndex === index;
          return (
            <Pressable
              key={id}
              onPress={() => {
                tapFeedback();
                onChange(presetIndex);
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
                {preset.price}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
