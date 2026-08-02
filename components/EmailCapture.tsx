import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Check, Mail } from 'lucide-react-native';

import { SectionLabel } from '@/components/SectionLabel';
import { AppText } from '@/components/ui/Text';
import { track } from '@/lib/analytics';
import { successFeedback, tapFeedback } from '@/lib/haptics';
import { palette } from '@/lib/palette';
import { usePrefsStore } from '@/lib/store/usePrefsStore';
import {
  isSubscribeConfigured,
  isValidEmail,
  type SubscribeResult,
  subscribeEmail,
} from '@/lib/subscribe';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'sending' | SubscribeResult;

const MESSAGES: Record<Exclude<Status, 'idle' | 'sending' | 'ok'>, string> = {
  invalid: 'That address does not look right.',
  'not-configured': 'The mailing list is not connected yet, so nothing was sent.',
  failed: 'That did not go through. Try again in a moment.',
};

/**
 * The only way a user of this app can be reached again.
 *
 * Every other piece of state is on-device, which means someone can rely on the
 * radar for a month and leave no trace — and cannot be told when the live data
 * pipeline replaces the seeded set.
 */
export function EmailCapture() {
  const city = usePrefsStore((state) => state.city);
  const savedEmail = usePrefsStore((state) => state.briefingEmail);
  const setBriefingEmail = usePrefsStore((state) => state.setBriefingEmail);

  const [value, setValue] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const submit = async () => {
    if (status === 'sending') return;
    tapFeedback();
    setStatus('sending');
    const result = await subscribeEmail(value, city.name);
    setStatus(result);
    if (result === 'ok') {
      successFeedback();
      setBriefingEmail(value.trim());
      track('email_submitted', { city: city.name });
      setValue('');
    }
  };

  if (savedEmail) {
    return (
      <View className="gap-3">
        <SectionLabel hint="On the list">Briefing by email</SectionLabel>
        <View className="border-accent bg-accent-soft flex-row items-center gap-3 rounded-2xl border p-4">
          <Check color={palette.accent} size={16} />
          <View className="flex-1 gap-0.5">
            <AppText weight="semibold" className="text-foreground text-[13px]">
              {savedEmail}
            </AppText>
            <AppText className="text-muted text-[11px] leading-4">
              You get a note when the live demand pipeline replaces the seeded set. Nothing else.
            </AppText>
          </View>
          <Pressable
            onPress={() => {
              tapFeedback();
              setBriefingEmail(null);
              setStatus('idle');
            }}
            accessibilityRole="button"
            accessibilityLabel="Remove email"
            className="active:opacity-70"
          >
            <AppText weight="semibold" className="text-ink-dim text-[11px]">
              Remove
            </AppText>
          </Pressable>
        </View>
      </View>
    );
  }

  const ready = isValidEmail(value) && status !== 'sending';

  return (
    <View className="gap-3">
      <SectionLabel hint={isSubscribeConfigured() ? 'Optional' : 'Not connected'}>
        Briefing by email
      </SectionLabel>
      <View className="border-border bg-panel gap-3 rounded-2xl border p-4">
        <AppText className="text-muted text-[12px] leading-5">
          Everything in TrendSpark lives on this device. Leave an address if you want to hear when
          the live pipeline goes on, or when your city gets its own keyword grid.
        </AppText>
        <View className="border-border bg-panel-raised flex-row items-center gap-2 rounded-xl border px-3 py-2.5">
          <Mail color={palette.inkDim} size={15} />
          <TextInput
            value={value}
            onChangeText={(next) => {
              setValue(next);
              if (status !== 'idle') setStatus('idle');
            }}
            placeholder="you@example.com"
            placeholderTextColor={palette.inkDim}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            inputMode="email"
            accessibilityLabel="Email address"
            className="text-foreground flex-1 text-[14px]"
            style={{ fontFamily: 'Inter_500Medium' }}
          />
        </View>
        <Pressable
          onPress={() => void submit()}
          disabled={!ready}
          accessibilityRole="button"
          accessibilityState={{ disabled: !ready }}
          className={cn(
            'items-center rounded-xl py-3 active:opacity-80',
            ready ? 'bg-accent' : 'border-border bg-panel-raised border',
          )}
        >
          <AppText
            weight="semibold"
            className={cn('text-[13px]', ready ? 'text-accent-foreground' : 'text-ink-dim')}
          >
            {status === 'sending' ? 'Sending…' : 'Send it to me'}
          </AppText>
        </Pressable>
        {status !== 'idle' && status !== 'sending' && status !== 'ok' ? (
          <AppText className="text-hot text-[11px] leading-4">{MESSAGES[status]}</AppText>
        ) : null}
      </View>
    </View>
  );
}
