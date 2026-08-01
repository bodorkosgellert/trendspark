import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Check, MapPin, Radar, Search } from 'lucide-react-native';

import { SectionLabel } from '@/components/SectionLabel';
import { AppText } from '@/components/ui/Text';
import { NICHES } from '@/lib/data/catalog';
import { tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import { usePrefsStore } from '@/lib/store/usePrefsStore';
import type { NicheId } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function OnboardingScreen() {
  const completeOnboarding = usePrefsStore((state) => state.completeOnboarding);
  const city = usePrefsStore((state) => state.city);
  const [selected, setSelected] = useState<NicheId[]>([]);

  const toggle = (id: NicheId) => {
    tapFeedback();
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const start = () => {
    completeOnboarding(selected);
    router.replace('/(tabs)');
  };

  return (
    <View className="bg-background flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-safe-offset-10 pb-6 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <View className="bg-accent-soft h-11 w-11 items-center justify-center rounded-2xl">
            <Radar color={palette.accent} size={22} />
          </View>
          <AppText weight="bold" className="text-foreground text-[30px] leading-9">
            Catch demand before it peaks.
          </AppText>
          <AppText className="text-muted text-[15px] leading-6">
            Every morning you get a 60-second voice briefing on what is rising, and a playbook you
            can act on the same day. Pick the areas you actually care about.
          </AppText>
        </View>

        <View className="gap-2.5">
          <SectionLabel hint="Type any city">Where you are building</SectionLabel>
          <Pressable
            onPress={() => {
              tapFeedback();
              router.push('/market');
            }}
            accessibilityRole="button"
            accessibilityLabel={`Change city. Currently ${city.name}`}
            className="border-border bg-panel flex-row items-center gap-3 rounded-2xl border p-4 active:opacity-80"
          >
            <MapPin color={palette.accent} size={16} />
            <View className="flex-1">
              <AppText weight="semibold" className="text-foreground text-[15px]" numberOfLines={1}>
                {city.name}
              </AppText>
              <AppText weight="medium" className="text-ink-dim text-[11px]" numberOfLines={1}>
                {city.countryName || 'Custom market'}
              </AppText>
            </View>
            <View className="border-border bg-panel-raised flex-row items-center gap-1.5 rounded-full border px-2.5 py-1.5">
              <Search color={palette.muted} size={11} />
              <AppText weight="semibold" className="text-muted text-[11px]">
                Change
              </AppText>
            </View>
          </Pressable>
          <AppText className="text-ink-dim text-[11px] leading-4">
            The feed, the ranking and the briefing are read through your city, with the worldwide
            curve next to it so you can tell whether you are early or late.
          </AppText>
        </View>

        <View className="gap-2">
          {NICHES.map((niche) => {
            const active = selected.includes(niche.id);
            return (
              <Pressable
                key={niche.id}
                onPress={() => toggle(niche.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
                className={cn(
                  'flex-row items-center justify-between rounded-2xl border p-4 active:opacity-80',
                  active ? 'border-accent bg-accent-soft' : 'border-border bg-panel',
                )}
              >
                <View className="flex-1 gap-0.5">
                  <AppText weight="semibold" className="text-foreground text-[15px]">
                    {niche.label}
                  </AppText>
                  <AppText className="text-muted text-xs">{niche.blurb}</AppText>
                </View>
                <View
                  className={cn(
                    'h-6 w-6 items-center justify-center rounded-full border',
                    active ? 'border-accent bg-accent' : 'border-border',
                  )}
                >
                  {active ? <Check color={palette.accentInk} size={14} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="pb-safe-offset-4 border-border bg-canvas gap-3 border-t px-5 pt-4">
        <Pressable
          onPress={start}
          accessibilityRole="button"
          className="bg-accent flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-80"
        >
          <AppText weight="semibold" className="text-accent-foreground text-[15px]">
            {selected.length === 0 ? 'Show me everything' : `Track ${selected.length} areas`}
          </AppText>
          <ArrowRight color={palette.accentInk} size={17} />
        </Pressable>
        <AppText className="text-ink-dim text-center text-xs">
          Everything is open from the first launch. No card, no trial, no locked tab.
        </AppText>
      </View>
    </View>
  );
}
