import { NICHE_LABEL } from '@/lib/data/catalog';
import { competitionLabel, formatMomentum, formatVolume } from '@/lib/format';
import { compareToGlobal, marketMomentum, relationTo, type MarketComparison } from '@/lib/markets';
import type { MarketLens, Signal } from '@/lib/types';

export interface BriefingLine {
  id: string;
  text: string;
  signalId: string | null;
  startMs: number;
  durationMs: number;
}

export interface BriefingScript {
  lines: BriefingLine[];
  text: string;
  durationMs: number;
  signalIds: string[];
}

/** Spoken pace used to lay out the timeline when no real audio is available. */
const MS_PER_WORD = 355;
const PAUSE_MS = 260;

function estimate(text: string): number {
  return text.trim().split(/\s+/).length * MS_PER_WORD + PAUSE_MS;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** One spoken sentence about whether the local market is early or late. */
function timingSentence(comparison: MarketComparison): string {
  const days = Math.abs(comparison.leadDays);
  if (comparison.kind === 'in-step') return '';
  if (comparison.kind === 'local-first') {
    return ` It broke in ${comparison.localLabel} about ${days} days before the global curve, so you would be early everywhere else.`;
  }
  return ` The rest of the world moved on this about ${days} days ago, so this is a catch-up play rather than a discovery.`;
}

/**
 * Builds today's spoken briefing from the top signals. The same text is sent to
 * ElevenLabs when a key is configured, and drives the synthetic timeline when
 * it is not, so the transcript and audio never drift apart.
 */
export function buildBriefing(signals: Signal[], lens: MarketLens): BriefingScript {
  const picks = signals.slice(0, 3);
  const market = lens.active;
  const parts: { text: string; signalId: string | null }[] = [];

  parts.push({
    signalId: null,
    text: `${greeting()}. ${picks.length} signals moved enough to matter in ${market.label} since yesterday.`,
  });

  picks.forEach((signal, index) => {
    const order = index === 0 ? 'First' : index === 1 ? 'Second' : 'Third';
    const comparison = compareToGlobal(signal, lens);
    const relation = relationTo(signal, market);
    const transfer =
      relation === 'template'
        ? ` It was measured in ${signal.region} rather than ${market.label}, so treat it as a template.`
        : '';
    parts.push({
      signalId: signal.id,
      text:
        `${order}. ${signal.keyword}, in ${NICHE_LABEL[signal.niche] ?? signal.niche}. ` +
        `Up ${formatMomentum(marketMomentum(signal, market))} on roughly ${formatVolume(signal.volume)} searches a month, ${signal.region}. ` +
        `${competitionLabel(signal.competition).toLowerCase()}, and the window closes in about ${signal.peakInDays} days. ` +
        signal.why +
        transfer +
        timingSentence(comparison),
    });
  });

  if (picks.length > 0) {
    parts.push({
      signalId: picks[0].id,
      text: `If you only act on one, take ${picks[0].keyword}. The playbook is waiting in the app.`,
    });
  }

  let cursor = 0;
  const lines: BriefingLine[] = parts.map((part, index) => {
    const durationMs = estimate(part.text);
    const line: BriefingLine = {
      id: `line-${index}`,
      text: part.text,
      signalId: part.signalId,
      startMs: cursor,
      durationMs,
    };
    cursor += durationMs;
    return line;
  });

  return {
    lines,
    text: parts.map((part) => part.text).join(' '),
    durationMs: cursor,
    signalIds: picks.map((signal) => signal.id),
  };
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
