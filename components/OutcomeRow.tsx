import { Pressable, View } from 'react-native';
import { Coins, Pencil, Repeat, Rocket } from 'lucide-react-native';

import { AppText } from '@/components/ui/Text';
import { euro } from '@/lib/format';
import { outcomeSummaryLine, stageMeta, stageToneClass } from '@/lib/outcomes';
import { palette } from '@/lib/palette';
import type { Outcome, Signal } from '@/lib/types';
import { cn } from '@/lib/utils';

interface OutcomeRowProps {
  signal: Signal;
  outcome: Outcome;
  onPress: () => void;
  onEdit: () => void;
  onPassBack: () => void;
}

function StageIcon({ stage }: { stage: Outcome['stage'] }) {
  const color = stage === 'shipped' ? palette.muted : palette.accent;
  if (stage === 'repeating') return <Repeat color={color} size={15} />;
  if (stage === 'first-money') return <Coins color={color} size={15} />;
  return <Rocket color={color} size={15} />;
}

/**
 * One self-reported result. The pass-back button is the whole point of the row:
 * the user comes back here after the money landed, not before.
 */
export function OutcomeRow({ signal, outcome, onPress, onEdit, onPassBack }: OutcomeRowProps) {
  const meta = stageMeta(outcome.stage);
  const earned = outcome.revenueCents > 0;

  return (
    <View className="border-border bg-panel gap-3 rounded-2xl border p-4">
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open ${signal.keyword}`}
        className="gap-2 active:opacity-70"
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <AppText weight="semibold" className="text-foreground text-[15px]" numberOfLines={2}>
              {signal.keyword}
            </AppText>
            <View className="flex-row items-center gap-1.5">
              <StageIcon stage={outcome.stage} />
              <AppText weight="medium" className={cn('text-[12px]', stageToneClass(outcome.stage))}>
                {meta.label}
              </AppText>
            </View>
          </View>
          {earned ? (
            <View className="items-end gap-0.5">
              <AppText weight="bold" className="text-foreground text-[19px] leading-none">
                {euro(outcome.revenueCents)}
              </AppText>
              <AppText className="text-ink-dim text-[10px]">reported</AppText>
            </View>
          ) : null}
        </View>

        {outcome.note ? (
          <AppText className="text-muted text-[12px] leading-5" numberOfLines={3}>
            {outcome.note}
          </AppText>
        ) : null}

        <AppText className="text-ink-dim text-[11px] leading-4">
          {outcomeSummaryLine(outcome)} ·{' '}
          {new Date(outcome.updatedAt).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
          })}
        </AppText>
      </Pressable>

      <View className="flex-row gap-2">
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          className="border-border bg-panel-raised flex-row items-center justify-center gap-1.5 rounded-full border px-3 py-2 active:opacity-70"
        >
          <Pencil color={palette.muted} size={13} />
          <AppText weight="semibold" className="text-muted text-[12px]">
            Update
          </AppText>
        </Pressable>
        {earned ? (
          <Pressable
            onPress={onPassBack}
            accessibilityRole="button"
            className="bg-accent flex-1 items-center rounded-full px-3 py-2 active:opacity-80"
          >
            <AppText weight="semibold" className="text-accent-foreground text-[12px]">
              {outcome.passedBackCents > 0 ? 'Pass back more' : 'Pass back a share'}
            </AppText>
          </Pressable>
        ) : (
          <View className="border-border bg-panel-raised flex-1 items-center justify-center rounded-full border px-3 py-2">
            <AppText weight="medium" className="text-ink-dim text-[11px]">
              Nothing to share yet
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
}
