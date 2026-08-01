import { Pressable } from 'react-native';
import { Heart, Unlock } from 'lucide-react-native';

import { AppText } from '@/components/ui/Text';
import { euro } from '@/lib/format';
import { palette } from '@/lib/palette';
import { useSupportStore } from '@/lib/store/useSupportStore';

interface SupportPillProps {
  onPress?: () => void;
}

/**
 * Replaces the old credit balance. Nothing is locked, so there is no balance to
 * show — the pill states the access model, and switches to the amount the user
 * chose to give once they have given something.
 */
export function SupportPill({ onPress }: SupportPillProps) {
  const contributedCents = useSupportStore((state) => state.contributedCents);
  const given = contributedCents > 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        given
          ? `${euro(contributedCents)} contributed so far`
          : 'Everything is open, pay if it helps'
      }
      className="border-border bg-panel-raised flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 active:opacity-70"
    >
      {given ? (
        <Heart color={palette.accent} size={12} fill={palette.accent} />
      ) : (
        <Unlock color={palette.accent} size={12} />
      )}
      <AppText weight="semibold" className="text-foreground text-xs">
        {given ? euro(contributedCents) : 'Open access'}
      </AppText>
    </Pressable>
  );
}
