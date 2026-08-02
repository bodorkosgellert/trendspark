import type { WindowClassId } from '@/lib/emergence';

/**
 * Who actually takes the money once a window opens — the other half of "how
 * early am I".
 *
 * {@link lib/emergence} answers how much of the window is left. It does not
 * answer the harder question a first-time builder gets wrong: being first is
 * usually worth less than being the best operator inside the window, and the
 * revenue at the end of it is not shared out evenly. Both halves are needed
 * before "act on this signal" means anything.
 *
 * Everything in this file is a documented case or a published figure with a link
 * to the source, because the whole product argument rests on claims a reader can
 * check. No modelled numbers, no aggregate "success rate", nothing that would
 * read as an earnings claim.
 */

export interface Source {
  label: string;
  url: string;
}

export interface CrowdCase {
  id: string;
  /** `First mover → who kept the market`, as a title. */
  title: string;
  year: string;
  /** Which window class this case illustrates. */
  windowClass: WindowClassId;
  /** Who moved first. */
  first: string;
  /** Who ended up with the market or the money. */
  won: string;
  /** What happened, in checkable specifics. */
  detail: string;
  /** The transferable part. */
  lesson: string;
  source: Source;
}

export const CROWD_CASES: CrowdCase[] = [
  {
    id: 'wordle',
    title: 'Wordle → The New York Times',
    year: '2021–22',
    windowClass: 'fad',
    first: 'One free web page, no app, no ads, no account.',
    won: 'The original — and then a newspaper that bought it.',
    detail:
      'Josh Wardle published Wordle as a single page in October 2021. Clones reached the App Store within weeks, some charging a subscription; Apple removed them in January 2022 after public backlash, and the developer of the most visible copy apologised. The New York Times bought the original at the end of that month for a price it described as in the low seven figures.',
    lesson:
      'In a fad the format is the asset and the copy is a days-long business. Cloning something already on your radar is the losing end of this trade — you arrive after the peak and you can be removed from the store by the platform, not out-competed by the market.',
    source: {
      label: 'BBC News',
      url: 'https://www.bbc.com/news/technology-59980699',
    },
  },
  {
    id: 'wordle-accident',
    title: 'The accidental winner: an unrelated app called Wordle!',
    year: '2022',
    windowClass: 'fad',
    first: 'A word game shipped around 2016 and then abandoned.',
    won: 'Its author, by name collision, for about a week.',
    detail:
      'Steven Cravotta had a five-year-old, no-longer-updated app named Wordle! on the store. Search traffic for the web game landed on it: roughly 40,000 downloads in the first week of January 2022, an 850% jump. He announced the proceeds — around $50,000 — would go to a literacy non-profit, together with Wardle.',
    lesson:
      'The cash in a fad often lands on whoever already occupies the search term, not on whoever builds the best version during the spike. That is a distribution outcome, not a product outcome, and it is not repeatable on purpose.',
    source: {
      label: 'Rolling Stone',
      url: 'https://www.rollingstone.com/culture/culture-news/wordle-app-charity-donation-1286210/',
    },
  },
  {
    id: 'lensa',
    title: 'Stable Diffusion avatars → Lensa',
    year: '2022',
    windowClass: 'wrapper',
    first: 'Dozens of avatar apps built on the same open model release.',
    won: 'A photo editor that had existed since 2018.',
    detail:
      'When magic avatars went viral in late 2022, the app that topped the charts was not a new entrant: Lensa had shipped in 2018 and had, by Sensor Tower estimates at the time, around 22.2 million downloads and roughly $29 million in consumer spending behind it. It switched a feature on. Its own downloads collapsed within months once the novelty passed.',
    lesson:
      'On a platform wave the winner is usually whoever already had the install base the day the capability opened. A new entrant is racing a distribution advantage, not a feature — and the wave recedes fast enough that the leader does not keep the revenue either.',
    source: {
      label: 'TechCrunch',
      url: 'https://techcrunch.com/2022/12/01/lensa-ai-climbs-the-app-store-charts-as-its-magic-avatars-go-viral/',
    },
  },
  {
    id: 'hipstamatic',
    title: 'Hipstamatic → Instagram',
    year: '2009–12',
    windowClass: 'category',
    first: 'A paid camera app with filters, and Apple’s App of the Year in 2010.',
    won: 'A free app that added the social graph.',
    detail:
      'Hipstamatic reached the filtered-photo idea first and was celebrated for it. Instagram launched in October 2010 with the same core feature, gave it away, and attached a feed and a follow graph. Facebook bought Instagram in 2012 for about a billion dollars; Hipstamatic stayed a filter app.',
    lesson:
      'Same feature, different product. When a category shifts, the durable position is the one nobody can copy in a weekend — a network, an operation, a data set — not the feature that opened it.',
    source: {
      label: 'Wikipedia',
      url: 'https://en.wikipedia.org/wiki/Hipstamatic',
    },
  },
  {
    id: 'search',
    title: 'Search engines → Google',
    year: '1993–2000',
    windowClass: 'category',
    first: 'Archie, Aliweb, WebCrawler, Lycos, Excite, AltaVista, Infoseek and more.',
    won: 'A late entrant with a better ranking method.',
    detail:
      'Web search had a dozen serious entrants before Google launched in 1998. Being years early bought AltaVista and Lycos brand recognition and, in the end, nothing durable. The window stayed open because the hard part — ranking — had not been solved.',
    lesson:
      'A window closes when the problem is solved, not when the first product ships. If everyone in a space is executing badly, arriving late with a genuinely better method is still the strongest hand you can hold.',
    source: {
      label: 'Wikipedia',
      url: 'https://en.wikipedia.org/wiki/Timeline_of_web_search_engines',
    },
  },
];

/** The one-line rule the cases are evidence for. */
export const CROWD_RULE = {
  headline: 'First mover usually loses to best executor',
  body: 'Being early is worth something only for as long as it is hard to copy what you built. Where copying is trivial — a fad, a platform feature — the head start is measured in days and the money lands on whoever already had the audience. Where copying is expensive — a rule nobody has read, an operation in one city, a method nobody has cracked — arriving late with better execution is still a winning position.',
  closing:
    'The usable test for "too late" is not a date. It is when people search a product name instead of the problem. Until then the idea is open; after that you are competing on price or on the niche the leader will not staff.',
};

/**
 * What winning looks like inside each window class. Keyed on the same ids as
 * {@link WINDOW_CLASSES} so a signal's class decides which line it gets, and the
 * two files cannot drift into contradicting each other.
 */
export const WINNER_BY_CLASS: Record<WindowClassId, string> = {
  fad: 'Hundreds enter and being first is worth days. The money lands on whoever already owns the search term or the audience the format spreads through. Building the better version during the spike is usually unpaid work.',
  wrapper:
    'The winner is normally an app that already existed and switched the feature on the day the platform opened it. As a new entrant you are racing an install base, and the platform may ship the feature itself.',
  rules:
    'Almost nobody enters, because reading legislation is not fun. Winning is unglamorous: be the one who read it, published the guide, and kept it correct when the rule changed. Still being there next year beats being first.',
  local:
    'One or two people per city do the boring part, and often nobody does. There is no clone wave to outrun — the constraint is your own patience and whether you keep the data right.',
  category:
    'A solo builder does not take the category; funded companies do. Take the niche the leader will not staff, and expect the leader to end up owning brand-name search.',
};

export interface CrowdStat {
  id: string;
  value: string;
  label: string;
  note: string;
  source: Source;
}

/** Where app revenue actually ends up. Published estimates, with the source. */
export const CONCENTRATION_STATS: CrowdStat[] = [
  {
    id: 'sensortower',
    value: '94%',
    label: 'of US App Store revenue',
    note: 'went to the top 1% of publishers that monetise at all, in the quarter Sensor Tower measured.',
    source: { label: 'Sensor Tower', url: 'https://sensortower.com/blog/app-store-one-percent' },
  },
  {
    id: 'appfigures',
    value: '91%',
    label: 'of app revenue, both stores',
    note: 'went to 1% of publishers in the first half of 2021, on Appfigures data. Two firms, two methods, the same shape.',
    source: {
      label: 'PocketGamer.biz',
      url: 'https://www.pocketgamer.biz/1-of-publishers-are-responsible-for-91-of-app-revenue/',
    },
  },
];

/** Survival and retention, and the reason the two curves are not the same curve. */
export const SURVIVAL_STATS: CrowdStat[] = [
  {
    id: 'bls',
    value: '~50%',
    label: 'of new US businesses reach year five',
    note: 'About 80% survive the first year and roughly a third reach ten, measured across every industry — restaurants, builders, agencies.',
    source: { label: 'US Bureau of Labor Statistics', url: 'https://www.bls.gov/bdm/bdmage.htm' },
  },
  {
    id: 'dau',
    value: '90%',
    label: 'of daily users gone in 30 days',
    note: 'The average app loses 77% of its daily actives within three days of install and over 95% within ninety.',
    source: {
      label: 'Andrew Chen',
      url: 'https://andrewchen.com/new-data-shows-why-losing-80-of-your-mobile-users-is-normal-and-that-the-best-apps-do-much-better/',
    },
  },
  {
    id: 'day30',
    value: '~3–4%',
    label: 'day-30 retention, industry average',
    note: 'Vendor benchmarks put day 30 near 4% on iOS and under 3% on Android. Averages across millions of apps, not a forecast for yours.',
    source: {
      label: 'Business of Apps',
      url: 'https://www.businessofapps.com/guide/mobile-app-retention/',
    },
  },
];

/**
 * The honest answer to "does the startup survival curve apply to apps too?".
 * Kept as prose rather than a number because the mechanism differs, and the
 * mechanism is the part that changes what you do.
 */
export const SURVIVAL_NOTE = [
  'Not directly. A business fails visibly — it stops trading, it files something. An app almost never fails that way: it stays listed, keeps working, and simply stops being opened. Nothing marks the date, so there is no clean survival curve to quote.',
  'What does transfer is the shape. Revenue is far more concentrated in apps than across businesses generally: on published estimates around 1% of publishers take over 90% of store revenue, which is a steeper curve than any restaurant or agency market. And app mortality shows up as retention, not closure — most installs are gone inside a month.',
  'The practical reading is not "do not bother". It is that median outcomes are a bad target: a small side project that keeps a few hundred people who come back is worth more than a launch spike, and a launch spike with no day-30 retention is the normal outcome, not a personal failure.',
];

export function casesForClass(id: WindowClassId): CrowdCase[] {
  return CROWD_CASES.filter((item) => item.windowClass === id);
}

/**
 * One case to show beside a signal. Prefers a case from the signal's own window
 * class and otherwise falls back to the clearest general one, so the panel is
 * never empty for a class nobody has documented yet.
 */
export function caseForClass(id: WindowClassId): CrowdCase {
  return casesForClass(id)[0] ?? CROWD_CASES[3];
}
