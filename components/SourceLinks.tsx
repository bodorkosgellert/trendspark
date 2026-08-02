import { Pressable, View } from 'react-native';
import { ExternalLink } from 'lucide-react-native';

import { Favicon } from '@/components/Favicon';
import { SectionLabel } from '@/components/SectionLabel';
import { AppText } from '@/components/ui/Text';
import { exploreLinks, openExternal, sourceUrl } from '@/lib/explore';
import { tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import type { Signal } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SourceLinksProps {
  signal: Signal;
}

function openLink(url: string) {
  tapFeedback();
  void openExternal(url);
}

/**
 * Lets the user leave the app and check the claim themselves. The signal is the
 * free half of the product, so the primary sources are open too — an unverifiable
 * percentage is worth less than one the user can go and confirm.
 */
export function SourceLinks({ signal }: SourceLinksProps) {
  const links = exploreLinks(signal);

  return (
    <View className="gap-5">
      <View className="gap-3">
        <SectionLabel hint="Opens in your browser">Check it yourself</SectionLabel>
        {links.map((link) => (
          <Pressable
            key={link.id}
            onPress={() => openLink(link.url)}
            accessibilityRole="link"
            accessibilityLabel={`${link.label}: ${link.hint}`}
            className="border-border bg-panel flex-row items-center justify-between gap-3 rounded-2xl border p-4 active:opacity-70"
          >
            <Favicon url={link.url} label={link.label} size={20} />
            <View className="flex-1 gap-0.5">
              <AppText weight="semibold" className="text-foreground text-[14px]">
                {link.label}
              </AppText>
              <AppText className="text-muted text-[12px] leading-5">{link.hint}</AppText>
            </View>
            <ExternalLink color={palette.inkDim} size={15} />
          </Pressable>
        ))}
      </View>

      <View className="gap-3">
        <SectionLabel>Where this came from</SectionLabel>
        <View className="flex-row flex-wrap gap-2">
          {signal.sources.map((source) => {
            const url = sourceUrl(source, signal.keyword);
            const label = (
              <AppText weight="medium" className={cn('text-xs', url ? 'text-up' : 'text-muted')}>
                {source}
              </AppText>
            );

            if (!url) {
              return (
                <View
                  key={source}
                  className="border-border bg-panel rounded-full border px-3 py-1.5"
                >
                  {label}
                </View>
              );
            }

            return (
              <Pressable
                key={source}
                onPress={() => openLink(url)}
                accessibilityRole="link"
                accessibilityLabel={`Open ${source}`}
                className="border-accent bg-accent-soft flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 active:opacity-70"
              >
                <Favicon url={url} label={source} size={13} />
                {label}
                <ExternalLink color={palette.accent} size={11} />
              </Pressable>
            );
          })}
        </View>
        <AppText className="text-ink-dim text-[11px] leading-4">
          Sources open a live search for this keyword. Interest indexes are rescaled per request, so
          a number you see there will not match ours exactly — the shape is what matters.
        </AppText>
      </View>
    </View>
  );
}
