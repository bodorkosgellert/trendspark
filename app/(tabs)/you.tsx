import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Bell, Check, Clock, Mic, RotateCcw } from 'lucide-react-native';

import { SectionLabel } from '@/components/SectionLabel';
import { AppText } from '@/components/ui/Text';
import { NICHES } from '@/lib/data/catalog';
import { isVoiceConfigured } from '@/lib/elevenlabs';
import { tapFeedback } from '@/lib/haptics';
import { isModelConfigured } from '@/lib/openai';
import { palette } from '@/lib/palette';
import { VOICES, usePrefsStore } from '@/lib/store/usePrefsStore';
import { useSignalStore } from '@/lib/store/useSignalStore';
import { useWalletStore } from '@/lib/store/useWalletStore';
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
  const voiceId = usePrefsStore((state) => state.voiceId);
  const setVoice = usePrefsStore((state) => state.setVoice);
  const briefingHour = usePrefsStore((state) => state.briefingHour);
  const setBriefingHour = usePrefsStore((state) => state.setBriefingHour);
  const notifyOnBreakout = usePrefsStore((state) => state.notifyOnBreakout);
  const setNotifyOnBreakout = usePrefsStore((state) => state.setNotifyOnBreakout);
  const resetPrefs = usePrefsStore((state) => state.reset);

  const unlockedCount = useSignalStore((state) => state.unlockedIds.length);
  const resetSignals = useSignalStore((state) => state.reset);
  const resetWallet = useWalletStore((state) => state.reset);
  const plan = useWalletStore((state) => state.plan);

  const startOver = () => {
    tapFeedback();
    resetSignals();
    resetWallet();
    resetPrefs();
    router.replace('/onboarding');
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
              Playbooks owned
            </AppText>
            <AppText weight="bold" className="text-foreground text-[20px]">
              {unlockedCount}
            </AppText>
          </View>
          <View className="border-border bg-panel flex-1 gap-1 rounded-2xl border p-4">
            <AppText
              weight="semibold"
              className="text-ink-dim text-[10px] uppercase"
              style={{ letterSpacing: 1 }}
            >
              Plan
            </AppText>
            <AppText weight="bold" className="text-foreground text-[20px] capitalize">
              {plan}
            </AppText>
          </View>
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
