import { View } from 'react-native';

import { AppText } from '@/components/ui/Text';
import { cn } from '@/lib/utils';

interface SectionLabelProps {
  children: string;
  hint?: string;
  className?: string;
}

/** Small uppercase terminal-style section divider. */
export function SectionLabel({ children, hint, className }: SectionLabelProps) {
  return (
    <View className={cn('flex-row items-end justify-between', className)}>
      <AppText
        weight="semibold"
        className="text-ink-dim text-[11px] uppercase"
        style={{ letterSpacing: 1.4 }}
      >
        {children}
      </AppText>
      {hint ? (
        <AppText weight="medium" className="text-ink-dim text-[11px]">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}
