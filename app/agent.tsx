import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Bot, Code2, X } from 'lucide-react-native';

import { SectionLabel } from '@/components/SectionLabel';
import { AppText } from '@/components/ui/Text';
import { palette } from '@/lib/palette';

const ENDPOINTS = [
  { path: 'GET /v1/signals?niche=ai-tools', price: '$0.002', note: 'Ranked list, metadata only' },
  { path: 'GET /v1/signals/{id}', price: '$0.01', note: 'Full signal with series and sources' },
  { path: 'GET /v1/signals/{id}/playbook', price: '$0.05', note: 'Generated playbook' },
];

const FLOW = [
  'Agent requests a signal without credentials.',
  'API answers 402 Payment Required with the price and a payment address.',
  'Agent pays in stablecoin and retries with the payment header.',
  'API returns the data. No account, no card, no invoice.',
];

export default function AgentScreen() {
  return (
    <View className="bg-background flex-1">
      <View className="pt-safe-offset-3 border-border bg-canvas flex-row items-center justify-between border-b px-5 pb-3">
        <AppText weight="semibold" className="text-foreground text-[15px]">
          Machine access
        </AppText>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="border-border bg-panel h-9 w-9 items-center justify-center rounded-full border active:opacity-70"
        >
          <X color={palette.muted} size={16} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-5 gap-6 pb-safe-offset-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <View className="bg-accent-soft h-11 w-11 items-center justify-center rounded-2xl">
            <Bot color={palette.accent} size={22} />
          </View>
          <AppText weight="bold" className="text-foreground text-[24px] leading-8">
            Humans buy credits. Agents pay per request.
          </AppText>
          <AppText className="text-muted text-[14px] leading-6">
            Card networks have a fixed fee per charge, so a €0.002 purchase cannot exist on them.
            That is why people buy credit packs in the app. Software buyers have no such limit, so
            the same signals are also sold per request over HTTP 402.
          </AppText>
        </View>

        <View className="gap-3">
          <SectionLabel hint="Per request">Pricing</SectionLabel>
          {ENDPOINTS.map((endpoint) => (
            <View
              key={endpoint.path}
              className="border-border bg-panel gap-2 rounded-2xl border p-4"
            >
              <View className="flex-row items-center justify-between gap-3">
                <AppText weight="medium" className="text-foreground flex-1 text-[12px]">
                  {endpoint.path}
                </AppText>
                <AppText weight="semibold" className="text-up text-sm">
                  {endpoint.price}
                </AppText>
              </View>
              <AppText className="text-ink-dim text-[11px]">{endpoint.note}</AppText>
            </View>
          ))}
        </View>

        <View className="gap-3">
          <SectionLabel>How a paid request works</SectionLabel>
          {FLOW.map((step, index) => (
            <View
              key={step}
              className="border-border bg-panel flex-row gap-3 rounded-2xl border p-4"
            >
              <View className="bg-panel-raised h-6 w-6 items-center justify-center rounded-full">
                <AppText weight="semibold" className="text-up text-xs">
                  {index + 1}
                </AppText>
              </View>
              <AppText className="text-muted flex-1 text-[13px] leading-5">{step}</AppText>
            </View>
          ))}
        </View>

        <View className="border-border bg-panel gap-2 rounded-2xl border p-4">
          <View className="flex-row items-center gap-2">
            <Code2 color={palette.accent} size={15} />
            <AppText weight="semibold" className="text-foreground text-[13px]">
              Why this is not the checkout in the app
            </AppText>
          </View>
          <AppText className="text-muted text-[12px] leading-5">
            App store rules require in-app digital purchases to go through in-app purchase, and a
            consumer will not fund a wallet to read one trend report. Per-request payment is the
            right rail for software buyers, not for people.
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}
