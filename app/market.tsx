import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Check, Globe, Info, MapPin, Plus, Search, X } from 'lucide-react-native';

import { SectionLabel } from '@/components/SectionLabel';
import { AppText } from '@/components/ui/Text';
import { customCity, fold, findCity, searchCities, SUGGESTED_CITY_IDS } from '@/lib/data/cities';
import { SIGNALS } from '@/lib/data/signals';
import { observedCount } from '@/lib/feed';
import { successFeedback, tapFeedback } from '@/lib/haptics';
import { cityMarket, geoNote } from '@/lib/markets';
import { palette } from '@/lib/palette';
import { usePrefsStore } from '@/lib/store/usePrefsStore';
import type { CityDef } from '@/lib/types';
import { cn } from '@/lib/utils';

/** How Google Trends will actually read this city, in four words. */
function geoHint(city: CityDef): string {
  if (city.geoLevel === 'world') return 'no Trends region';
  if (city.geoLevel === 'city') return city.geo;
  if (city.geoLevel === 'region') return `via ${city.geoName ?? city.geo}`;
  return `country level · ${city.geo}`;
}

/** How many seeded signals are actually observed (not derived/followed) in this city's market. */
function measuredIn(entry: CityDef): number {
  return observedCount(SIGNALS, cityMarket(entry));
}

function CityRow({
  city,
  selected,
  measured,
  onPress,
}: {
  city: CityDef;
  selected: boolean;
  measured: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Read the feed for ${city.name}`}
      className={cn(
        'flex-row items-center gap-3 rounded-2xl border px-3.5 py-3 active:opacity-70',
        selected ? 'border-accent bg-accent-soft' : 'border-border bg-panel',
      )}
    >
      <MapPin color={selected ? palette.accent : palette.inkDim} size={14} />
      <View className="flex-1">
        <AppText weight="semibold" className="text-foreground text-[15px]" numberOfLines={1}>
          {city.name}
        </AppText>
        <AppText weight="medium" className="text-ink-dim text-[11px]" numberOfLines={1}>
          {[city.countryName, geoHint(city)].filter(Boolean).join(' · ')}
        </AppText>
      </View>
      {measured > 0 ? (
        <View className="border-border bg-panel-raised rounded-full border px-2 py-1">
          <AppText weight="semibold" className="text-muted text-[10px]">
            {`${measured} measured`}
          </AppText>
        </View>
      ) : null}
      {selected ? <Check color={palette.accent} size={15} /> : null}
    </Pressable>
  );
}

/**
 * Where the user says which city they are building for.
 *
 * The catalog exists because Google Trends only reports the regions it reports:
 * matching a typed name to a real geo code is what keeps every curve and every
 * "at source" link honest. A name the catalog does not know is still accepted, as
 * a custom market with the consequence stated — modelled curve, worldwide links.
 */
export default function MarketScreen() {
  const city = usePrefsStore((state) => state.city);
  const setCity = usePrefsStore((state) => state.setCity);
  const recentCities = usePrefsStore((state) => state.recentCities);

  const [query, setQuery] = useState('');

  const results = useMemo(() => searchCities(query), [query]);
  const suggested = useMemo(
    () =>
      SUGGESTED_CITY_IDS.map((id) => findCity(id)).filter((entry): entry is CityDef =>
        Boolean(entry),
      ),
    [],
  );

  const typed = query.trim();
  const exact = results.some((entry) => fold(entry.name) === fold(typed));
  const canAddCustom = typed.length >= 2 && !exact;

  const choose = (next: CityDef) => {
    successFeedback();
    setCity(next);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="bg-background flex-1"
    >
      <View className="pt-safe-offset-3 border-border bg-canvas flex-row items-center justify-between border-b px-5 pb-3">
        <View className="flex-1 gap-0.5">
          <AppText weight="bold" className="text-foreground text-[17px]">
            Your market
          </AppText>
          <AppText weight="medium" className="text-ink-dim text-[11px]">
            Which city are you building for?
          </AppText>
        </View>
        <Pressable
          onPress={() => {
            tapFeedback();
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="border-border bg-panel h-9 w-9 items-center justify-center rounded-full border active:opacity-70"
        >
          <X color={palette.muted} size={16} />
        </Pressable>
      </View>

      <View className="border-border bg-canvas border-b px-5 py-3">
        <View className="border-border bg-panel flex-row items-center gap-2.5 rounded-2xl border px-3.5 py-3">
          <Search color={palette.inkDim} size={15} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            placeholder="Type a city — Lisbon, Austin, Bangalore"
            placeholderTextColor={palette.inkDim}
            accessibilityLabel="Search for a city"
            className="text-foreground flex-1 text-[15px]"
            style={{ fontFamily: 'Inter_500Medium' }}
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Clear"
              className="active:opacity-70"
            >
              <X color={palette.inkDim} size={14} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-4 gap-5 pb-safe-offset-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {typed.length > 0 ? (
          <View className="gap-2">
            <SectionLabel hint={results.length > 0 ? `${results.length} found` : 'No match'}>
              Results
            </SectionLabel>
            {results.map((entry) => (
              <CityRow
                key={entry.id}
                city={entry}
                selected={entry.id === city.id}
                measured={measuredIn(entry)}
                onPress={() => choose(entry)}
              />
            ))}

            {canAddCustom ? (
              <Pressable
                onPress={() => choose(customCity(typed))}
                accessibilityRole="button"
                accessibilityLabel={`Use ${typed} as a custom market`}
                className="border-border bg-panel flex-row items-center gap-3 rounded-2xl border px-3.5 py-3 active:opacity-70"
              >
                <Plus color={palette.accent} size={14} />
                <View className="flex-1 gap-0.5">
                  <AppText weight="semibold" className="text-foreground text-[15px]">
                    {`Use “${typed}” anyway`}
                  </AppText>
                  <AppText className="text-ink-dim text-[11px] leading-4">
                    Google Trends has no region for it, so the curve is modelled and source links
                    open worldwide.
                  </AppText>
                </View>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <>
            <View className="gap-2">
              <SectionLabel hint="Now">Reading for</SectionLabel>
              <CityRow
                city={city}
                selected
                measured={measuredIn(city)}
                onPress={() => choose(city)}
              />
              <AppText className="text-ink-dim px-1 text-[11px] leading-4">
                {geoNote(cityMarket(city))}
              </AppText>
            </View>

            {recentCities.length > 0 ? (
              <View className="gap-2">
                <SectionLabel>Recent</SectionLabel>
                {recentCities.map((entry) => (
                  <CityRow
                    key={entry.id}
                    city={entry}
                    selected={false}
                    measured={measuredIn(entry)}
                    onPress={() => choose(entry)}
                  />
                ))}
              </View>
            ) : null}

            <View className="gap-2">
              <SectionLabel hint="Type to search">Common picks</SectionLabel>
              {suggested
                .filter((entry) => entry.id !== city.id)
                .map((entry) => (
                  <CityRow
                    key={entry.id}
                    city={entry}
                    selected={false}
                    measured={measuredIn(entry)}
                    onPress={() => choose(entry)}
                  />
                ))}
            </View>
          </>
        )}

        <View className="border-border bg-panel flex-row items-start gap-2.5 rounded-2xl border p-4">
          <Info color={palette.hot} size={15} />
          <View className="flex-1 gap-1.5">
            <AppText weight="semibold" className="text-foreground text-[13px]">
              Not every city is a Trends region
            </AppText>
            <AppText className="text-muted text-[12px] leading-5">
              Berlin, Hamburg and Vienna are city-states, so Google Trends reports them directly.
              Munich only exists there as Bavaria, and some countries have no sub-region at all.
              Each city says which code it reads at, and the signal screen says which side of the
              comparison was measured rather than reconstructed.
            </AppText>
            <View className="flex-row items-center gap-1.5 pt-0.5">
              <Globe color={palette.inkDim} size={12} />
              <AppText weight="medium" className="text-ink-dim text-[11px]">
                Signals were gathered in Berlin, so other cities read the global set first.
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
