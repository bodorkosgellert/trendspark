import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Bell, BarChart3, Check, Clock, Mic, RotateCcw } from 'lucide-react-native';

import { EmailCapture } from '@/components/EmailCapture';
import { SectionLabel } from '@/components/SectionLabel';
import { MarketSwitcher } from '@/components/MarketSwitcher';
import { AppText } from '@/components/ui/Text';
import { useMarketLens } from '@/hooks/useMarketLens';
import { analyticsAvailable, applyAnalyticsConsent } from '@/lib/analytics';
import { NICHES } from '@/lib/data/catalog';
import { isVoiceConfigured } from '@/lib/elevenlabs';
import { tapFeedback } from '@/lib/haptics';
import { geoNote } from '@/lib/markets';
import { isModelConfigured } from '@/lib/openai';
import { palette } from '@/lib/palette';
import { isCheckoutConfigured } from '@/lib/polar';
import { VOICES, usePrefsStore } from '@/lib/store/usePrefsStore';
import { useSignalStore } from '@/lib/store/useSignalStore';
import { useOutcomeStore } from '@/lib/store/useOutcomeStore';
import { useSupportStore } from '@/lib/store/useSupportStore';
import { isSubscribeConfigured } from '@/lib/subscribe';
import { euro } from '@/lib/format';
import { cn } from '@/lib/utils';

const HOURS = [6, 7, 8, 9, 12, 18];

function Toggle({ value }: { value: boolean }) {
  return (
    <View
      className={cn(
        'h-6 w-10 justify-center rounded-full px-0.5',
        value ? 'bg-accent' : 'bg-panel-raised',
      )}
    >
      <View className={cn('bg-canvas h-5 w-5 rounded-full', value && 'self-end')} />
    </View>
  );
}

export default function YouScreen() {
  const niches = usePrefsStore((state) => state.niches);
  const toggleNiche = usePrefsStore((state) => state.toggleNiche);
  const setMarketScope = usePrefsStore((state) => state.setMarketScope);
  const lens = useMarketLens();
  const voiceId = usePrefsStore((state) => state.voiceId);
  const setVoice = usePrefsStore((state) => state.setVoice);
  const briefingHour = usePrefsStore((state) => state.briefingHour);
  const setBriefingHour = usePrefsStore((state) => state.setBriefingHour);
  const notifyOnBreakout = usePrefsStore((state) => state.notifyOnBreakout);
  const setNotifyOnBreakout = usePrefsStore((state) => state.setNotifyOnBreakout);
  const analyticsConsent = usePrefsStore((state) => state.analyticsConsent);
  const setAnalyticsConsent = usePrefsStore((state) => state.setAnalyticsConsent);
  const activeDays = usePrefsStore((state) => state.activeDays);
  const resetPrefs = usePrefsStore((state) => state.reset);

  const openedCount = useSignalStore((state) => state.openedIds.length);
  const resetSignals = useSignalStore((state) => state.reset);
  const resetSupport = useSupportStore((state) => state.reset);
  const contributedCents = useSupportStore((state) => state.contributedCents);
  const resetOutcomes = useOutcomeStore((state) => state.reset);

  const startOver = () => {
    tapFeedback();
    resetSignals();
    resetSupport();
    resetOutcomes();
    resetPrefs();
    router.replace('/onboarding');
  };

  const measuring = analyticsConsent === 'granted';
  const toggleMeasuring = () => {
    tapFeedback();
    const next = !measuring;
    setAnalyticsConsent(next ? 'granted' : 'denied');
    applyAnalyticsConsent(next);
  };

  return (
    <View className="bg-background flex-1">
      <View className="pt-safe-offset-3 border-border bg-canvas border-b px-5 pb-3">
        <AppText weight="bold" className="text-foreground text-[17px]">
          You
        </AppText>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-5 gap-6 pb-safe-offset-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row gap-3">
          <View className="border-border bg-panel flex-1 gap-1 rounded-2xl border p-4">
            <AppText
              weight="semibold"
              className="text-ink-dim text-[10px] uppercase"
              style={{ letterSpacing: 1 }}
            >
              Playbooks read
            </AppText>
            <AppText weight="bold" className="text-foreground text-[20px]">
              {openedCount}
            </AppText>
          </View>
          <View className="border-border bg-panel flex-1 gap-1 rounded-2xl border p-4">
            <AppText
              weight="semibold"
              className="text-ink-dim text-[10px] uppercase"
              style={{ letterSpacing: 1 }}
            >
              Contributed
            </AppText>
            <AppText weight="bold" className="text-foreground text-[20px]">
              {euro(contributedCents)}
            </AppText>
          </View>
        </View>

        <View className="gap-3">
          <SectionLabel hint={lens.active.label}>Home market</SectionLabel>
          <MarketSwitcher
            lens={lens}
            onScope={setMarketScope}
            onChangeCity={() => {
              router.push('/market');
            }}
          />
          <AppText className="text-ink-dim text-[11px] leading-4">
            Type any city and the feed, the ranking and the briefing are read through it. Every
            signal still shows the global curve next to the local one, so you can see whether you
            are early or late. {geoNote(lens.city)}
          </AppText>
        </View>

        <View className="gap-3">
          <SectionLabel hint={niches.length === 0 ? 'All areas' : `${niches.length} selected`}>
            Areas you track
          </SectionLabel>
          <View className="flex-row flex-wrap gap-2">
            {NICHES.map((niche) => {
              const active = niches.includes(niche.id);
              return (
                <Pressable
                  key={niche.id}
                  onPress={() => {
                    tapFeedback();
                    toggleNiche(niche.id);
                  }}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: active }}
                  className={cn(
                    'flex-row items-center gap-1.5 rounded-full border px-3 py-2 active:opacity-70',
                    active ? 'border-accent bg-accent-soft' : 'border-border bg-panel',
                  )}
                >
                  {active ? <Check color={palette.accent} size={12} /> : null}
                  <AppText
                    weight="medium"
                    className={cn('text-xs', active ? 'text-up' : 'text-muted')}
                  >
                    {niche.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="gap-3">
          <SectionLabel>Briefing voice</SectionLabel>
          {VOICES.map((voice) => {
            const active = voiceId === voice.id;
            return (
              <Pressable
                key={voice.id}
                onPress={() => {
                  tapFeedback();
                  setVoice(voice.id);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                className={cn(
                  'flex-row items-center justify-between rounded-2xl border p-4 active:opacity-80',
                  active ? 'border-accent bg-accent-soft' : 'border-border bg-panel',
                )}
              >
                <View className="flex-row items-center gap-3">
                  <Mic color={active ? palette.accent : palette.inkDim} size={16} />
                  <View className="gap-0.5">
                    <AppText weight="semibold" className="text-foreground text-[14px]">
                      {voice.label}
                    </AppText>
                    <AppText className="text-muted text-xs">{voice.blurb}</AppText>
                  </View>
                </View>
                {active ? <Check color={palette.accent} size={16} /> : null}
              </Pressable>
            );
          })}
        </View>

        <View className="gap-3">
          <SectionLabel>Delivery</SectionLabel>
          <View className="border-border bg-panel gap-3 rounded-2xl border p-4">
            <View className="flex-row items-center gap-2">
              <Clock color={palette.inkDim} size={15} />
              <AppText weight="medium" className="text-foreground text-[14px]">
                Briefing lands at
              </AppText>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {HOURS.map((hour) => {
                const active = briefingHour === hour;
                return (
                  <Pressable
                    key={hour}
                    onPress={() => {
                      tapFeedback();
                      setBriefingHour(hour);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    className={cn(
                      'rounded-full border px-3 py-1.5 active:opacity-70',
                      active ? 'border-accent bg-accent-soft' : 'border-border bg-canvas',
                    )}
                  >
                    <AppText
                      weight="semibold"
                      className={cn('text-xs', active ? 'text-up' : 'text-muted')}
                    >
                      {String(hour).padStart(2, '0')}:00
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            onPress={() => {
              tapFeedback();
              setNotifyOnBreakout(!notifyOnBreakout);
            }}
            accessibilityRole="switch"
            accessibilityState={{ checked: notifyOnBreakout }}
            className="border-border bg-panel flex-row items-center justify-between rounded-2xl border p-4 active:opacity-80"
          >
            <View className="flex-1 flex-row items-center gap-3">
              <Bell color={palette.inkDim} size={15} />
              <View className="flex-1 gap-0.5">
                <AppText weight="medium" className="text-foreground text-[14px]">
                  Breakout alerts
                </AppText>
                <AppText className="text-muted text-xs">
                  Ping me when something jumps over 300%
                </AppText>
              </View>
            </View>
            <Toggle value={notifyOnBreakout} />
          </Pressable>
        </View>

        <EmailCapture />

        <View className="gap-3">
          <SectionLabel hint={activeDays.length === 1 ? 'Day 1' : `${activeDays.length} days`}>
            Usage measurement
          </SectionLabel>
          <Pressable
            onPress={toggleMeasuring}
            accessibilityRole="switch"
            accessibilityState={{ checked: measuring }}
            className="border-border bg-panel flex-row items-center justify-between rounded-2xl border p-4 active:opacity-80"
          >
            <View className="flex-1 flex-row items-center gap-3">
              <BarChart3 color={measuring ? palette.accent : palette.inkDim} size={15} />
              <View className="flex-1 gap-0.5">
                <AppText weight="medium" className="text-foreground text-[14px]">
                  Count what I use
                </AppText>
                <AppText className="text-muted text-xs">
                  Briefings played, signals opened, days you come back. No ads, no session
                  recording, nothing sold on.
                </AppText>
              </View>
            </View>
            <Toggle value={measuring} />
          </Pressable>
          <AppText className="text-ink-dim text-[11px] leading-4">
            {analyticsAvailable()
              ? 'Turning this off stops sending and clears the stored identifier. The day count above is kept on this device either way.'
              : 'Nothing is measured in this build: no analytics key is set, so the switch changes only your stated preference.'}
          </AppText>
        </View>

        <View className="gap-3">
          <SectionLabel>Connected services</SectionLabel>
          <View className="border-border bg-panel gap-2 rounded-2xl border p-4">
            <View className="flex-row items-center justify-between">
              <AppText weight="medium" className="text-foreground text-[13px]">
                ElevenLabs voice
              </AppText>
              <AppText
                weight="semibold"
                className={cn('text-xs', isVoiceConfigured() ? 'text-up' : 'text-ink-dim')}
              >
                {isVoiceConfigured() ? 'Connected' : 'Transcript mode'}
              </AppText>
            </View>
            <View className="bg-border h-px" />
            <View className="flex-row items-center justify-between">
              <AppText weight="medium" className="text-foreground text-[13px]">
                Playbook generation
              </AppText>
              <AppText
                weight="semibold"
                className={cn('text-xs', isModelConfigured() ? 'text-up' : 'text-ink-dim')}
              >
                {isModelConfigured() ? 'Connected' : 'Written playbooks'}
              </AppText>
            </View>
            <View className="bg-border h-px" />
            <View className="flex-row items-center justify-between">
              <AppText weight="medium" className="text-foreground text-[13px]">
                Email list
              </AppText>
              <AppText
                weight="semibold"
                className={cn('text-xs', isSubscribeConfigured() ? 'text-up' : 'text-ink-dim')}
              >
                {isSubscribeConfigured() ? 'Connected' : 'Not connected'}
              </AppText>
            </View>
            <View className="bg-border h-px" />
            <View className="flex-row items-center justify-between">
              <AppText weight="medium" className="text-foreground text-[13px]">
                Card payments
              </AppText>
              <AppText
                weight="semibold"
                className={cn('text-xs', isCheckoutConfigured() ? 'text-up' : 'text-ink-dim')}
              >
                {isCheckoutConfigured() ? 'Polar checkout' : 'Simulated'}
              </AppText>
            </View>
            <View className="bg-border h-px" />
            <View className="flex-row items-center justify-between">
              <AppText weight="medium" className="text-foreground text-[13px]">
                Usage analytics
              </AppText>
              <AppText
                weight="semibold"
                className={cn(
                  'text-xs',
                  analyticsAvailable() && measuring ? 'text-up' : 'text-ink-dim',
                )}
              >
                {!analyticsAvailable() ? 'No key set' : measuring ? 'On' : 'Off'}
              </AppText>
            </View>
          </View>
        </View>

        <Pressable
          onPress={startOver}
          accessibilityRole="button"
          className="border-border bg-panel flex-row items-center justify-center gap-2 rounded-2xl border py-3.5 active:opacity-70"
        >
          <RotateCcw color={palette.muted} size={15} />
          <AppText weight="medium" className="text-muted text-[14px]">
            Reset demo data
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}
