import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Clock, ExternalLink, RotateCcw } from 'lucide-react-native';

import { SectionLabel } from '@/components/SectionLabel';
import { AppText } from '@/components/ui/Text';
import { track } from '@/lib/analytics';
import {
  ageLabel,
  readEmergence,
  STANCE_TEXT_CLASS,
  windowClassFor,
  WINDOW_TEXT_CLASS,
  type WindowClass,
} from '@/lib/emergence';
import { openExternal } from '@/lib/explore';
import { shortDate } from '@/lib/format';
import { tapFeedback } from '@/lib/haptics';
import { clearHnTrace, fetchHnTrace, type HnTrace } from '@/lib/hn';
import { palette } from '@/lib/palette';
import type { Signal } from '@/lib/types';
import { cn } from '@/lib/utils';

type LoadState = 'loading' | 'ready' | 'failed';

/** The window class as a chip, for the signal header meta row. */
export function WindowChip({ signal }: { signal: Signal }) {
  const cls = windowClassFor(signal);
  return (
    <View className="border-border bg-panel rounded-full border px-3 py-1.5">
      <AppText weight="medium" className={cn('text-xs', WINDOW_TEXT_CLASS[cls.tone])}>
        {cls.label}
      </AppText>
    </View>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <AppText className="text-ink-dim text-[12px]">{label}</AppText>
      <AppText
        weight="semibold"
        className={cn('flex-1 text-right text-[12px]', valueClass ?? 'text-foreground')}
      >
        {value}
      </AppText>
    </View>
  );
}

function noTraceNote(cls: WindowClass, query: string): string {
  if (cls.id === 'local' || cls.id === 'rules') {
    return `Nothing on Hacker News for “${query}”, which is what a local or regulatory keyword should look like — that demand never reaches an English developer forum. Check it on Google Trends and Reddit instead.`;
  }
  return `Nothing on Hacker News for “${query}”. For a builder-facing idea that means one of two things: it is genuinely untouched, or the words builders use for it are different from the words searchers use.`;
}

/**
 * Answers "how late am I" with the one date that is externally checkable.
 *
 * Momentum says a keyword is moving now. It cannot say whether the idea behind
 * it is three weeks or six years old, and that is what decides whether shipping
 * is worth a weekend. The window class supplies the expected lag from first
 * public mention to peak demand; Hacker News supplies the first mention itself,
 * free and without a key. Where HN has no trace, the panel says so and does not
 * substitute the radar's own flag date — that would be a made-up t₀.
 */
export function EmergencePanel({ signal }: { signal: Signal }) {
  const cls = windowClassFor(signal);
  const [trace, setTrace] = useState<HnTrace | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    setState('loading');

    void fetchHnTrace(signal.keyword).then((result) => {
      if (!live) return;
      if (!result) {
        setState('failed');
        return;
      }
      setTrace(result);
      setState('ready');
      track('emergence_checked', {
        signal_id: signal.id,
        window_class: cls.id,
        hn_hits: result.total,
        first_mention_age_days: result.first ? result.first.ageDays : -1,
      });
    });

    return () => {
      live = false;
    };
  }, [signal.keyword, signal.id, cls.id, attempt]);

  const retry = useCallback(() => {
    tapFeedback();
    clearHnTrace(signal.keyword);
    setAttempt((value) => value + 1);
  }, [signal.keyword]);

  const reading = trace?.first ? readEmergence(cls, trace.first.ageDays) : null;

  return (
    <View className="border-border bg-panel gap-3 rounded-2xl border p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Clock color={palette.muted} size={14} />
          <SectionLabel>How early is this</SectionLabel>
        </View>
        <AppText weight="semibold" className={cn('text-[11px]', WINDOW_TEXT_CLASS[cls.tone])}>
          {cls.label}
        </AppText>
      </View>

      <View className="gap-2">
        <Row label="Typical run to peak" value={cls.lagLabel} />
        <Row label="Expect" value={cls.entrants} />
      </View>

      <AppText className="text-muted text-[12px] leading-5">{cls.barrier}</AppText>

      <View className="border-border gap-2.5 border-t pt-3">
        {state === 'loading' ? (
          <View className="flex-row items-center gap-2.5">
            <ActivityIndicator color={palette.muted} size="small" />
            <AppText className="text-ink-dim text-[12px]">
              Checking Hacker News for the first public mention…
            </AppText>
          </View>
        ) : state === 'failed' ? (
          <View className="flex-row items-center justify-between gap-3">
            <AppText className="text-muted flex-1 text-[12px] leading-5">
              Could not reach Hacker News, so there is no first-mention date for this one right now.
            </AppText>
            <Pressable
              onPress={retry}
              accessibilityRole="button"
              accessibilityLabel="Retry the Hacker News lookup"
              className="border-border bg-panel-raised h-8 w-8 items-center justify-center rounded-full border active:opacity-70"
            >
              <RotateCcw color={palette.muted} size={14} />
            </Pressable>
          </View>
        ) : trace && trace.first ? (
          <>
            <Row
              label="First mention on HN"
              value={`${shortDate(trace.first.createdAt)} · ${ageLabel(trace.first.ageDays)} ago`}
            />
            <Row
              label="Mentions"
              value={`${trace.total} all time · ${trace.lastYear} in the last year`}
            />
            <Pressable
              onPress={() => {
                tapFeedback();
                void openExternal((trace.top ?? trace.first)?.hnUrl ?? trace.searchUrl);
              }}
              accessibilityRole="link"
              accessibilityLabel="Open the Hacker News thread"
              className="border-border bg-panel-raised flex-row items-center gap-2.5 rounded-xl border p-3 active:opacity-70"
            >
              <View className="flex-1">
                <AppText
                  weight="medium"
                  numberOfLines={2}
                  className="text-foreground text-[12px] leading-5"
                >
                  {(trace.top ?? trace.first)?.title}
                </AppText>
                <AppText className="text-ink-dim text-[11px]">
                  {trace.top && !trace.top.isComment
                    ? `${trace.top.points} points · ${shortDate(trace.top.createdAt)}`
                    : `Searched HN for “${trace.query}”`}
                </AppText>
              </View>
              <ExternalLink color={palette.inkDim} size={14} />
            </Pressable>
            {reading ? (
              <View className="gap-1 pt-0.5">
                <AppText
                  weight="semibold"
                  className={cn('text-[13px]', STANCE_TEXT_CLASS[reading.stance])}
                >
                  {reading.headline}
                </AppText>
                <AppText className="text-muted text-[12px] leading-5">{reading.line}</AppText>
                <AppText className="text-ink-dim text-[11px] leading-4">
                  {cls.tooLate} {trace.approximate ? 'First mention is dated to the month.' : ''}
                </AppText>
              </View>
            ) : null}
          </>
        ) : trace ? (
          <>
            <AppText className="text-muted text-[12px] leading-5">
              {noTraceNote(cls, trace.query)}
            </AppText>
            <AppText className="text-ink-dim text-[11px] leading-4">{cls.tooLate}</AppText>
          </>
        ) : null}
      </View>

      <AppText className="text-ink-dim text-[10px] leading-4">
        Hacker News is English-speaking and developer-heavy, and a first mention is the first
        indexed one, not the invention. Treat it as a floor on the idea&apos;s age, never a ceiling.
      </AppText>
    </View>
  );
}
