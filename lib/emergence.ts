import type { Signal } from '@/lib/types';

/**
 * How long a window stays open, by what created it.
 *
 * The single rule underneath the whole taxonomy: **a window is as long as the
 * thing is hard to build.** Zero barrier means a clone wave in days; a window
 * opened by a rule change, a local peculiarity, or work nobody enjoys stays
 * open for months or years. Momentum tells you a keyword is moving. This tells
 * you whether moving is still worth anything to you.
 */
export type WindowClassId = 'fad' | 'wrapper' | 'rules' | 'local' | 'category';

export interface WindowClass {
  id: WindowClassId;
  label: string;
  /** Typical lag from first public mention to peak demand, as text. */
  lagLabel: string;
  lagLowDays: number;
  lagHighDays: number;
  /** What holds the window open — the reason the range is what it is. */
  barrier: string;
  /** How many entrants to expect around one of these. */
  entrants: string;
  /** The observable test for "the idea is closed". */
  tooLate: string;
  /** Chip colour role: hot = hurry, up = durable, muted = crowded or slow. */
  tone: 'hot' | 'up' | 'muted';
}

/**
 * Ranges are read off cases, not fitted: viral formats (Wordle, Lensa avatars)
 * peak inside two months; platform wrappers ran three to nine months through
 * 2023; German scheme changes such as the Balkonkraftwerk rules produced
 * elevated search for well over a year; category shifts take years and capital.
 * They are estimates for reading a window, not measurements.
 */
export const WINDOW_CLASSES: Record<WindowClassId, WindowClass> = {
  fad: {
    id: 'fad',
    label: 'Viral fad',
    lagLabel: '2–8 weeks',
    lagLowDays: 14,
    lagHighDays: 56,
    barrier:
      'Nothing stops anyone copying this, so being early is the only advantage there is. One format carries it, and the format tires.',
    entrants: 'Hundreds. Clones land within days of the peak.',
    tooLate: 'Closed once the debunks and the roundups outnumber the how-to posts.',
    tone: 'hot',
  },
  wrapper: {
    id: 'wrapper',
    label: 'Platform wave',
    lagLabel: '3–9 months',
    lagLowDays: 90,
    lagHighDays: 270,
    barrier:
      'A platform opened a new capability. The window lasts until the platform ships the feature itself or the wrappers commoditise each other.',
    entrants: 'Dozens to hundreds. Expect a funded competitor inside a month.',
    tooLate: 'Closed once people search a product name instead of the problem.',
    tone: 'muted',
  },
  rules: {
    id: 'rules',
    label: 'Rule change',
    lagLabel: '6–24 months',
    lagLowDays: 180,
    lagHighDays: 730,
    barrier:
      'A regulation, deadline or subsidy created the demand, and the paperwork stays annoying for as long as the rule exists. Best category for one person.',
    entrants: 'Five to thirty. Almost nobody reads the legislation.',
    tooLate: 'Closed when the authority publishes a decent guide itself, or the rule is withdrawn.',
    tone: 'up',
  },
  local: {
    id: 'local',
    label: 'Local operation',
    lagLabel: '1–3 years',
    lagLowDays: 365,
    lagHighDays: 1095,
    barrier:
      'It only works in one place and needs work nobody enjoys — which is a real moat for a solo builder, at the cost of never scaling by copy-paste.',
    entrants: 'Under ten per city, often none.',
    tooLate: 'Closed when the city, or one incumbent, finally does the boring part properly.',
    tone: 'up',
  },
  category: {
    id: 'category',
    label: 'Category shift',
    lagLabel: '1–3 years',
    lagLowDays: 365,
    lagHighDays: 1095,
    barrier:
      'The shift is real and slow, but funded companies are already inside it. A solo builder takes a niche of it, never the category.',
    entrants: 'Dozens, most with money behind them.',
    tooLate: 'Closed for one person as soon as the leader owns brand-name search.',
    tone: 'muted',
  },
};

export const WINDOW_ORDER: WindowClassId[] = ['fad', 'wrapper', 'rules', 'local', 'category'];

/**
 * Which window each seeded signal sits in. This is an editorial judgement, not a
 * computation — the same call a human vetter makes when deciding whether a
 * rising keyword is worth anyone's weekend. Keep it here rather than on
 * {@link Signal} so there is exactly one place to review it, and so the live
 * pipeline can replace the whole table with a classifier output.
 */
const WINDOW_BY_SIGNAL: Record<string, WindowClassId> = {
  'sig-voice-clone-podcast': 'wrapper',
  'sig-cortisol-face': 'fad',
  'sig-mouth-taping': 'fad',
  'sig-x402': 'wrapper',
  'sig-balatro-tracker': 'wrapper',
  'sig-ugc-script': 'wrapper',
  'sig-interrail': 'rules',
  'sig-creatine-gummies': 'fad',
  'sig-protein-ice-cream': 'fad',
  'sig-notion-voice': 'wrapper',
  'sig-balkonkraftwerk': 'rules',
  'sig-faceless-youtube': 'wrapper',
  'sig-cold-plunge': 'category',
  'sig-silent-air-fryer': 'category',
  'sig-sourdough-kit': 'local',
  'sig-dog-dna': 'category',
  'sig-steam-deck-dock': 'wrapper',
  'sig-depot-alternative': 'rules',
  'sig-cat-fountain': 'category',
  'sig-japan-nomad': 'rules',
  'sig-anmeldung-termin': 'local',
  'sig-mietspiegel-check': 'rules',
  'sig-kita-gutschein': 'local',
  'sig-wohnung-mappe': 'local',
  'sig-freelancer-steuer': 'rules',
  'sig-padel-berlin': 'local',
  'sig-berlin-builder-nights': 'local',
  'sig-berghain-guide': 'local',
};

/**
 * Fallback for a signal the table does not know yet — a live pipeline will
 * produce ids nobody classified by hand. Deliberately crude, and only ever a
 * guess: the table above is the truth.
 */
function inferWindowClass(signal: Signal): WindowClassId {
  if (signal.region === 'Berlin' || signal.portable === false) return 'local';
  if (signal.competition === 'high' && signal.peakInDays <= 14) return 'fad';
  if (signal.niche === 'ai-tools' || signal.niche === 'creator' || signal.niche === 'gaming') {
    return 'wrapper';
  }
  if (signal.peakInDays >= 20) return 'category';
  return 'wrapper';
}

export function windowClassFor(signal: Signal): WindowClass {
  return WINDOW_CLASSES[WINDOW_BY_SIGNAL[signal.id] ?? inferWindowClass(signal)];
}

/** True when the classification came from the reviewed table rather than a guess. */
export function windowClassReviewed(signal: Signal): boolean {
  return signal.id in WINDOW_BY_SIGNAL;
}

export type Stance = 'early' | 'inside' | 'late';

export interface EmergenceReading {
  stance: Stance;
  /** 0–1 through the typical window, clamped at both ends. */
  progress: number;
  headline: string;
  line: string;
}

/**
 * Places an age — days since the first public trace of an idea — inside its
 * window class. This is the "am I too late" question answered with the one
 * number that is actually observable.
 */
export function readEmergence(cls: WindowClass, ageDays: number): EmergenceReading {
  const span = Math.max(1, cls.lagHighDays - cls.lagLowDays);
  const progress = Math.min(1, Math.max(0, (ageDays - cls.lagLowDays) / span));

  if (ageDays < cls.lagLowDays) {
    return {
      stance: 'early',
      progress: Math.min(0.15, ageDays / Math.max(1, cls.lagHighDays)),
      headline: 'Ahead of the window',
      line: `The first public trace is ${ageLabel(ageDays)} old. A ${cls.label.toLowerCase()} usually needs ${cls.lagLabel} to reach peak demand, so nothing is late here. The risk is the opposite one: it may never arrive.`,
    };
  }

  if (ageDays <= cls.lagHighDays) {
    return {
      stance: 'inside',
      progress,
      headline: `Inside the window · ${Math.round(progress * 100)}% through`,
      line: `First traced ${ageLabel(ageDays)} ago, against a typical ${cls.lagLabel} run to peak. There is room left, and there are already people in it.`,
    };
  }

  return {
    stance: 'late',
    progress: 1,
    headline: 'Past the typical window',
    line: `The idea has been public for ${ageLabel(ageDays)} — longer than the ${cls.lagLabel} a ${cls.label.toLowerCase()} usually takes to peak. What is left is distribution and execution against people already ranking, not a head start.`,
  };
}

export const STANCE_TEXT_CLASS: Record<Stance, string> = {
  early: 'text-up',
  inside: 'text-foreground',
  late: 'text-hot',
};

export const WINDOW_TEXT_CLASS: Record<WindowClass['tone'], string> = {
  hot: 'text-hot',
  up: 'text-up',
  muted: 'text-muted',
};

/** Compact human age: `18 days`, `7 months`, `2 years 4 months`. */
export function ageLabel(days: number): string {
  if (days < 60) return `${Math.max(0, Math.round(days))} days`;
  const months = Math.round(days / 30.44);
  if (months < 24) return `${months} months`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years} years` : `${years} years ${rest} months`;
}
