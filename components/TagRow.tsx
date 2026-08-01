import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/Text';
import type { Tag } from '@/lib/tags';
import { cn } from '@/lib/utils';

interface TagRowProps {
  tags: Tag[];
  /** Tag ids currently filtering the view. */
  activeIds?: string[];
  onPress?: (tag: Tag) => void;
  size?: 'sm' | 'md';
}

/** Derived theme tags, used both as labels on a signal and as history filters. */
export function TagRow({ tags, activeIds = [], onPress, size = 'md' }: TagRowProps) {
  return (
    <View className="flex-row flex-wrap gap-1.5">
      {tags.map((tag) => {
        const active = activeIds.includes(tag.id);
        const body = (
          <AppText
            weight="semibold"
            className={cn(
              active ? 'text-up' : 'text-muted',
              size === 'sm' ? 'text-[10px]' : 'text-[11px]',
            )}
          >
            {tag.label}
          </AppText>
        );
        const shell = cn(
          'rounded-full border',
          size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1',
          active ? 'border-accent bg-accent-soft' : 'border-border bg-panel-raised',
        );

        if (!onPress) {
          return (
            <View key={tag.id} className={shell}>
              {body}
            </View>
          );
        }

        return (
          <Pressable
            key={tag.id}
            onPress={() => onPress(tag)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Filter by ${tag.label}`}
            className={cn(shell, 'active:opacity-70')}
          >
            {body}
          </Pressable>
        );
      })}
    </View>
  );
}
