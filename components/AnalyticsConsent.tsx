import { Pressable, View } from 'react-native';
import { BarChart3 } from 'lucide-react-native';

import { AppText } from '@/components/ui/Text';
import { analyticsAvailable, applyAnalyticsConsent } from '@/lib/analytics';
import { tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import { usePrefsStore } from '@/lib/store/usePrefsStore';

/**
 * Consent bar for usage analytics.
 *
 * It exists because the honest version of "measure whether this works" needs a
 * persistent identifier — you cannot count second-day returns without one — and
 * in Germany storing that identifier requires consent (§25 TDDDG) whatever the
 * storage technology. Asked once, remembered, reversible on the You tab.
 *
 * Renders nothing when no PostHog key is configured: there is no point asking
 * for permission to do something the build cannot do.
 */
export function AnalyticsConsent() {
  const consent = usePrefsStore((state) => state.analyticsConsent);
  const setConsent = usePrefsStore((state) => state.setAnalyticsConsent);

  if (consent !== null || !analyticsAvailable()) return null;

  const answer = (granted: boolean) => {
    tapFeedback();
    setConsent(granted ? 'granted' : 'denied');
    applyAnalyticsConsent(granted);
  };

  return (
    <View className="border-border bg-panel-raised absolute inset-x-3 bottom-3 gap-3 rounded-2xl border p-4">
      <View className="flex-row items-start gap-2.5">
        <BarChart3 color={palette.accent} size={16} />
        <AppText className="text-muted flex-1 text-[12px] leading-5">
          Can TrendSpark count what you use — briefings played, signals opened, days you come back?
          No ads, no profiles sold, no session recording, and it never leaves the analytics account.
        </AppText>
      </View>
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => answer(false)}
          accessibilityRole="button"
          className="border-border bg-panel flex-1 items-center rounded-full border py-2.5 active:opacity-70"
        >
          <AppText weight="semibold" className="text-muted text-[12px]">
            No thanks
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => answer(true)}
          accessibilityRole="button"
          className="bg-accent flex-1 items-center rounded-full py-2.5 active:opacity-80"
        >
          <AppText weight="semibold" className="text-accent-foreground text-[12px]">
            Allow
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
