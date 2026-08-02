import type { Competition } from '@/lib/types';

export function formatMomentum(value: number): string {
  return `+${Math.round(value)}%`;
}

export function formatVolume(value: number): string {
  if (value >= 1000) {
    const thousands = value / 1000;
    return `${thousands >= 100 ? Math.round(thousands) : thousands.toFixed(1)}K`;
  }
  return String(value);
}

export function competitionLabel(competition: Competition): string {
  switch (competition) {
    case 'low':
      return 'Low competition';
    case 'medium':
      return 'Medium competition';
    default:
      return 'Crowded';
  }
}

/** Signals with the least competition and the most momentum score highest. */
export function heatScore(momentum: number, competition: Competition): number {
  const penalty = competition === 'low' ? 1 : competition === 'medium' ? 0.72 : 0.45;
  return momentum * penalty;
}

export function windowLabel(peakInDays: number): string {
  if (peakInDays <= 7) return `Closes in ${peakInDays}d`;
  if (peakInDays <= 14) return `${peakInDays}d window`;
  return `${peakInDays}d window`;
}

/** Window phrasing for a one-line metadata strip, where every character costs. */
export function windowShort(peakInDays: number): string {
  return peakInDays <= 7 ? `${peakInDays}d left` : `peaks in ${peakInDays}d`;
}

/** Competition in as few characters as stay readable. */
export function competitionShort(competition: Competition): string {
  switch (competition) {
    case 'low':
      return 'low comp';
    case 'medium':
      return 'med comp';
    default:
      return 'crowded';
  }
}

export function windowTone(peakInDays: number): 'hot' | 'warning' | 'muted' {
  if (peakInDays <= 7) return 'hot';
  if (peakInDays <= 14) return 'warning';
  return 'muted';
}

export function detectedLabel(iso: string): string {
  const hours = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

/** Euro cents to a display string. Sub-cent run costs round up to one cent. */
export function euro(cents: number): string {
  if (cents > 0 && cents < 1) return '€0.01';
  return `€${(cents / 100).toFixed(2)}`;
}

export function playKindLabel(kind: string): string {
  switch (kind) {
    case 'content':
      return 'Content play';
    case 'product':
      return 'Build a product';
    case 'affiliate':
      return 'Affiliate play';
    default:
      return 'Local play';
  }
}
