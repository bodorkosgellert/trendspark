import { Pressable } from 'react-native';
import { Zap } from 'lucide-react-native';

import { AppText } from '@/components/ui/Text';
import { palette } from '@/lib/palette';
import { useWalletStore } from '@/lib/store/useWalletStore';

interface CreditPillProps {
  onPress?: () => void;
}

/** Always-visible credit balance. Tapping it opens the top-up sheet. */
export function CreditPill({ onPress }: CreditPillProps) {
  const credits = useWalletStore((state) => state.credits);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${credits} credits remaining`}
      className="border-border bg-panel-raised flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 active:opacity-70"
    >
      <Zap color={palette.accent} size={13} />
      <AppText weight="semibold" className="text-foreground text-sm">
        {credits}
      </AppText>
      <AppText weight="medium" className="text-ink-dim text-xs">
        credits
      </AppText>
    </Pressable>
  );
}
