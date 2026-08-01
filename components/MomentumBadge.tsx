import { View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

import { AppText } from '@/components/ui/Text';
import { formatMomentum } from '@/lib/format';
import { palette } from '@/lib/palette';
import { cn } from '@/lib/utils';

interface MomentumBadgeProps {
  momentum: number;
  size?: 'sm' | 'lg';
  className?: string;
}

export function MomentumBadge({ momentum, size = 'sm', className }: MomentumBadgeProps) {
  const large = size === 'lg';
  return (
    <View
      className={cn(
        'bg-accent-soft flex-row items-center gap-1 self-start rounded-full',
        large ? 'px-3 py-1.5' : 'px-2 py-1',
        className,
      )}
    >
      <TrendingUp color={palette.accent} size={large ? 16 : 12} />
      <AppText
        weight="semibold"
        className={cn('text-up', large ? 'text-base' : 'text-xs')}
        style={{ letterSpacing: -0.2 }}
      >
        {formatMomentum(momentum)}
      </AppText>
    </View>
  );
}
