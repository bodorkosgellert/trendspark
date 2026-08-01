import { useEffect } from 'react';
import { View } from 'react-native';
import {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedView } from '@/components/ui/primitives/AnimatedView';

const BAR_COUNT = 28;

/** Deterministic per-bar amplitude so the waveform reads as a fixed signature. */
const AMPLITUDES = Array.from({ length: BAR_COUNT }, (_, index) => {
  const wave = Math.sin(index * 0.7) * 0.35 + Math.sin(index * 1.9) * 0.22;
  return 0.42 + Math.abs(wave);
});

/** Stable per-bar identity for the static, never-reordered bar list. */
const BAR_KEYS = AMPLITUDES.map((_, index) => `wave-bar-${index}`);

interface WaveBarProps {
  index: number;
  active: boolean;
}

function WaveBar({ index, active }: WaveBarProps) {
  const scale = useSharedValue(0.18);
  const target = Math.min(1, AMPLITUDES[index]);

  useEffect(() => {
    if (active) {
      scale.value = withDelay(
        index * 26,
        withRepeat(
          withTiming(target, {
            duration: 420 + (index % 5) * 90,
            easing: Easing.inOut(Easing.quad),
          }),
          -1,
          true,
        ),
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(0.18, { duration: 240 });
    }
    return () => cancelAnimation(scale);
  }, [active, index, scale, target]);

  const style = useAnimatedStyle(() => ({ transform: [{ scaleY: scale.value }] }));

  return <AnimatedView style={style} className="bg-up h-full flex-1 rounded-full" />;
}

interface WaveformProps {
  active: boolean;
  height?: number;
}

export function Waveform({ active, height = 40 }: WaveformProps) {
  return (
    <View className="flex-row items-center gap-[3px]" style={{ height }}>
      {BAR_KEYS.map((key, index) => (
        <WaveBar key={key} index={index} active={active} />
      ))}
    </View>
  );
}
