import { useState } from 'react';
import { Image, View } from 'react-native';

import { AppText } from '@/components/ui/Text';
import { hostOf } from '@/lib/explore';

interface FaviconProps {
  /** The link the icon stands for. */
  url: string;
  /** Used for the first-letter fallback when no icon loads. */
  label: string;
  size?: number;
}

/**
 * The real site icon for a link, with a letter tile fallback.
 *
 * Fetched from DuckDuckGo's icon service rather than Google's so that browsing a
 * signal's sources does not send a request to Google for every row, and rendered
 * behind a fallback because it will fail offline, on a blocked domain, or for a
 * site that never shipped a favicon.
 */
export function Favicon({ url, label, size = 16 }: FaviconProps) {
  const [failed, setFailed] = useState(false);
  const host = hostOf(url);
  const radius = Math.round(size / 4);

  if (failed || host.length === 0) {
    return (
      <View
        className="border-border bg-panel-raised items-center justify-center border"
        style={{ width: size, height: size, borderRadius: radius }}
      >
        <AppText
          weight="semibold"
          className="text-ink-dim"
          style={{ fontSize: Math.round(size * 0.55), lineHeight: Math.round(size * 0.7) }}
        >
          {label.replace(/^r\//, '').charAt(0).toUpperCase()}
        </AppText>
      </View>
    );
  }

  return (
    <Image
      accessibilityIgnoresInvertColors
      source={{ uri: `https://icons.duckduckgo.com/ip3/${host}.ico` }}
      onError={() => setFailed(true)}
      style={{ width: size, height: size, borderRadius: radius }}
      resizeMode="contain"
    />
  );
}
