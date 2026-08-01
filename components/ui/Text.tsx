import type { ComponentProps } from 'react';
import { Text as RNText } from 'react-native';

import { cn } from '@/lib/utils';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

const FONT: Record<Weight, string> = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

interface AppTextProps extends ComponentProps<typeof RNText> {
  weight?: Weight;
}

/**
 * Single text primitive for the app. Weight maps to the loaded Inter faces
 * because native does not synthesise weights from a single family.
 */
export function AppText({ weight = 'regular', className, style, ...rest }: AppTextProps) {
  return (
    <RNText
      {...rest}
      className={cn('text-foreground', className)}
      style={[{ fontFamily: FONT[weight] }, style]}
    />
  );
}
