import { Platform, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Bot, CircleDashed, Code2, X } from 'lucide-react-native';

import { SectionLabel } from '@/components/SectionLabel';
import { AppText } from '@/components/ui/Text';
import { palette } from '@/lib/palette';

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const ENDPOINTS = [
  { path: 'GET /v1/signals?city=berlin', price: '$0.002', note: 'Ranked list, metadata only' },
  { path: 'GET /v1/signals/{id}', price: '$0.01', note: 'Full signal with series and sources' },
  { path: 'GET /v1/signals/{id}/playbook', price: '$0.05', note: 'Generated playbook' },
];

const FLOW = [
  'Agent requests a signal without credentials.',
  'API answers 402 Payment Required with the price, asset, network and receiving address — in the body and in a PAYMENT-REQUIRED header.',
  'Agent signs a stablecoin authorisation and retries with the PAYMENT-SIGNATURE header.',
  'The server has a facilitator verify and settle it, then returns the data with a PAYMENT-RESPONSE header. No account, no card, no invoice.',
];

const EXCHANGE = `GET /v1/signals?city=berlin

HTTP/1.1 402 Payment Required
PAYMENT-REQUIRED: <base64 of the body>
{
  "x402Version": 2,
  "error": "PAYMENT-SIGNATURE header is required",
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:8453",
    "asset": "0x8335…2913",
    "amount": "2000",
    "payTo": "0x…",
    "maxTimeoutSeconds": 60
  }]
}

GET /v1/signals?city=berlin
PAYMENT-SIGNATURE: <base64 signed authorisation>
→ 200 OK + PAYMENT-RESPONSE`;

const RUN = `npm run export:signals
npm run x402
curl -i localhost:4020/v1/signals`;

const TO_BUILD = [
  'Deploy it and point a public URL at it, with a receiving address on Base and USDC so a €0.002 charge does not move with the market.',
  'A replay cache. A settled authorisation is not remembered yet, so the same payment could be retried against another route.',
  'A settlement scheme that survives the price: usage billed under an authorised ceiling (upto), or batched, because one on-chain settlement per request costs more than the request.',
  'A request log in EUR per call. Crypto received for a service is business revenue on the day it arrives, and it has to be reconstructable.',
  'A discovery listing, since an agent has to find the endpoint before it can pay for it.',
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
          <View className="flex-row items-center gap-2">
            <View className="bg-accent-soft h-11 w-11 items-center justify-center rounded-2xl">
              <Bot color={palette.accent} size={22} />
            </View>
            <View className="border-border bg-panel rounded-full border px-2.5 py-1">
              <AppText weight="medium" className="text-muted text-[10.5px] tracking-wide">
                x402 · machine lane
              </AppText>
            </View>
          </View>
          <AppText weight="bold" className="text-foreground text-[24px] leading-8">
            People choose. Agents get metered.
          </AppText>
          <AppText className="text-muted text-[14px] leading-6">
            People: the whole app is open, nothing is locked, support is optional and decided
            afterwards. Agents: the same signals priced per request over HTTP 402. Software cannot
            make a judgement call about what a report was worth and does not need the goodwill, and
            at €0.002 there is no card fee floor to clear.
          </AppText>
        </View>

        <View className="border-border bg-panel gap-2.5 rounded-2xl border p-4">
          <View className="flex-row items-center gap-2">
            <CircleDashed color={palette.hot} size={15} />
            <AppText weight="semibold" className="text-foreground text-[13px]">
              Status: written and runnable, not deployed
            </AppText>
          </View>
          <AppText className="text-muted text-[12px] leading-5">
            The server exists in this repository:{' '}
            <AppText className="text-foreground text-[11px]" style={{ fontFamily: MONO }}>
              server/x402-signals.mjs
            </AppText>
            . One file, no dependencies. It answers real 402 responses in the v2 wire format below
            and has a facilitator verify and settle a payment before it serves anything.
          </AppText>
          <AppText className="text-muted text-[12px] leading-5">
            What does not exist yet: a public deployment, a receiving wallet, and a discovery
            listing. Run it locally and it refuses payment on purpose until a payTo address is set.
          </AppText>
          <View className="border-border bg-canvas rounded-xl border p-3">
            <AppText className="text-up text-[11px] leading-[18px]" style={{ fontFamily: MONO }}>
              {RUN}
            </AppText>
          </View>
          <AppText className="text-ink-dim text-[11.5px] leading-5">
            This lane will not be described as live until{' '}
            <AppText className="text-muted text-[11px]" style={{ fontFamily: MONO }}>
              GET /v1/signals
            </AppText>{' '}
            returns a 402 from a public URL to a request you did not make yourself.
          </AppText>
        </View>

        <View className="gap-3">
          <SectionLabel hint="Per request, priced in the server">Pricing</SectionLabel>
          {ENDPOINTS.map((endpoint) => (
            <View
              key={endpoint.path}
              className="border-border bg-panel gap-2 rounded-2xl border p-4"
            >
              <View className="flex-row items-center justify-between gap-3">
                <AppText
                  weight="medium"
                  className="text-foreground flex-1 text-[12px]"
                  style={{ fontFamily: MONO }}
                >
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
          <View className="border-border bg-canvas rounded-2xl border p-4">
            <AppText className="text-muted text-[11px] leading-[18px]" style={{ fontFamily: MONO }}>
              {EXCHANGE}
            </AppText>
            <AppText className="text-ink-dim mt-3 text-[11px] leading-4">
              amount is in the asset&apos;s smallest unit — 2000 is 0.002 USDC at six decimals. This
              is what the server in this repository returns; it is not a screenshot of a hosted API.
            </AppText>
          </View>
        </View>

        <View className="gap-3">
          <SectionLabel hint="Roadmap">What a live lane needs</SectionLabel>
          {TO_BUILD.map((item) => (
            <View
              key={item}
              className="border-border bg-panel flex-row gap-3 rounded-2xl border p-4"
            >
              <View className="bg-grid mt-1.5 h-1.5 w-1.5 rounded-full" />
              <AppText className="text-muted flex-1 text-[12.5px] leading-5">{item}</AppText>
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
            consumer will not fund a crypto wallet to read one trend report. Per-request payment is
            the right rail for software buyers, not for people — which is why the two lanes are
            separate rather than one compromise.
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}
