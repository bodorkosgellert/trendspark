import { useState } from 'react';
import {
  Pressable,
  View,
  type AccessibilityActionEvent,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

import { AppText } from '@/components/ui/Text';
import { CONTRIBUTION_TIERS } from '@/lib/data/catalog';
import { stepFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import { cn } from '@/lib/utils';

/** Quick jumps on the ladder, by tier id. */
const PRESET_IDS = ['c-99', 'c-299', 'c-799', 'c-1999'];

const THUMB = 22;
const TRACK_HEIGHT = 40;
const BAR = 6;
const TICK = 5;

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
 *
 * Drawn as a stepped slider rather than a rotary knob on purpose. A knob looks
 * good in a screenshot and is worse to use: it hides how many rungs exist, has no
 * obvious direction of travel, and its accessibility story is poor. A track with
 * one visible tick per price point shows the whole ladder, snaps to it, and
 * notches a haptic on each rung as you drag.
 */
export function AmountDial({ index, onChange, caption }: AmountDialProps) {
  const [trackWidth, setTrackWidth] = useState(0);

  const max = CONTRIBUTION_TIERS.length - 1;
  const clamped = Math.min(max, Math.max(0, index));
  const tier = CONTRIBUTION_TIERS[clamped];
  const fill = max > 0 ? clamped / max : 0;

  /** Usable travel: the thumb centre never leaves the track. */
  const travel = Math.max(0, trackWidth - THUMB);

  const centerOf = (rung: number) => THUMB / 2 + (max > 0 ? (rung / max) * travel : 0);

  const commit = (next: number) => {
    const bounded = Math.min(max, Math.max(0, next));
    if (bounded === clamped) return;
    stepFeedback();
    onChange(bounded);
  };

  /** Absolute drag: the rung is whichever tick the finger is nearest. */
  const pickAt = (event: GestureResponderEvent) => {
    if (travel <= 0) return;
    const x = event.nativeEvent.locationX - THUMB / 2;
    const ratio = Math.min(1, Math.max(0, x / travel));
    commit(Math.round(ratio * max));
  };

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'increment') commit(clamped + 1);
    if (event.nativeEvent.actionName === 'decrement') commit(clamped - 1);
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    if (Math.abs(next - trackWidth) > 1) setTrackWidth(next);
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
          onPress={() => commit(clamped - 1)}
          disabled={clamped === 0}
          accessibilityRole="button"
          accessibilityLabel="Lower the amount"
          className={cn(
            'border-border bg-panel-raised h-11 w-11 items-center justify-center rounded-full border active:opacity-70',
            clamped === 0 && 'opacity-40',
          )}
        >
          <Minus color={palette.foreground} size={18} />
        </Pressable>

        <View
          onLayout={onLayout}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={pickAt}
          onResponderMove={pickAt}
          accessibilityRole="adjustable"
          accessibilityLabel="Amount"
          accessibilityValue={{ min: 0, max, now: clamped, text: tier.price }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={onAccessibilityAction}
          className="flex-1 justify-center"
          style={{ height: TRACK_HEIGHT }}
        >
          <View
            pointerEvents="none"
            className="bg-grid rounded-full"
            style={{ height: BAR, marginHorizontal: THUMB / 2 }}
          />

          <View
            pointerEvents="none"
            className="bg-accent absolute rounded-full"
            style={{
              height: BAR,
              top: (TRACK_HEIGHT - BAR) / 2,
              left: THUMB / 2,
              width: fill * travel,
            }}
          />

          {CONTRIBUTION_TIERS.map((rungTier, rung) => (
            <View
              key={rungTier.id}
              pointerEvents="none"
              className="bg-canvas absolute rounded-full"
              style={{
                width: TICK,
                height: TICK,
                borderRadius: TICK / 2,
                top: (TRACK_HEIGHT - TICK) / 2,
                left: centerOf(rung) - TICK / 2,
                opacity: rung === clamped ? 0 : 0.5,
              }}
            />
          ))}

          <View
            pointerEvents="none"
            className="bg-accent border-panel absolute rounded-full border-2"
            style={{
              width: THUMB,
              height: THUMB,
              top: (TRACK_HEIGHT - THUMB) / 2,
              left: centerOf(clamped) - THUMB / 2,
            }}
          />
        </View>

        <Pressable
          onPress={() => commit(clamped + 1)}
          disabled={clamped === max}
          accessibilityRole="button"
          accessibilityLabel="Raise the amount"
          className={cn(
            'border-accent bg-accent-soft h-11 w-11 items-center justify-center rounded-full border active:opacity-70',
            clamped === max && 'opacity-40',
          )}
        >
          <Plus color={palette.accent} size={18} />
        </Pressable>
      </View>

      <View className="flex-row gap-2">
        {PRESET_IDS.map((id) => {
          const presetIndex = CONTRIBUTION_TIERS.findIndex((item) => item.id === id);
          const preset = CONTRIBUTION_TIERS[presetIndex];
          const active = presetIndex === clamped;
          return (
            <Pressable
              key={id}
              onPress={() => commit(presetIndex)}
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
