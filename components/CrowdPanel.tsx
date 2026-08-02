import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Swords } from 'lucide-react-native';

import { SectionLabel } from '@/components/SectionLabel';
import { AppText } from '@/components/ui/Text';
import { caseForClass, WINNER_BY_CLASS } from '@/lib/crowding';
import { windowClassFor, WINDOW_TEXT_CLASS } from '@/lib/emergence';
import { tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import type { Signal } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * The half of "should I act on this" that momentum and window age cannot answer:
 * who ends up with the money once other people arrive.
 *
 * Deliberately short here — the class-specific line plus one documented case —
 * with the full pattern, the sources and the concentration figures behind a link.
 * It sits under the emergence panel because the order of the questions is: is it
 * moving, how late am I, and only then who am I up against.
 */
export function CrowdPanel({ signal }: { signal: Signal }) {
  const cls = windowClassFor(signal);
  const example = caseForClass(cls.id);

  const open = () => {
    tapFeedback();
    router.push({ pathname: '/crowding', params: { case: example.id } });
  };

  return (
    <View className="border-border bg-panel gap-3 rounded-2xl border p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Swords color={palette.muted} size={14} />
          <SectionLabel>Who takes the money</SectionLabel>
        </View>
        <AppText weight="semibold" className={cn('text-[11px]', WINDOW_TEXT_CLASS[cls.tone])}>
          {cls.label}
        </AppText>
      </View>

      <AppText className="text-muted text-[12px] leading-5">{WINNER_BY_CLASS[cls.id]}</AppText>

      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`Read the case: ${example.title}`}
        className="border-border bg-panel-raised gap-1.5 rounded-xl border p-3 active:opacity-70"
      >
        <View className="flex-row items-center justify-between gap-3">
          <AppText weight="semibold" className="text-foreground flex-1 text-[12px] leading-5">
            {example.title}
          </AppText>
          <AppText className="text-ink-dim text-[11px]">{example.year}</AppText>
        </View>
        <AppText className="text-muted text-[11.5px] leading-5">{example.lesson}</AppText>
      </Pressable>

      <Pressable
        onPress={open}
        accessibilityRole="button"
        className="flex-row items-center justify-between active:opacity-70"
      >
        <AppText weight="semibold" className="text-up text-[12px]">
          First mover vs. best executor — the pattern
        </AppText>
        <ChevronRight color={palette.accent} size={14} />
      </Pressable>
    </View>
  );
}
