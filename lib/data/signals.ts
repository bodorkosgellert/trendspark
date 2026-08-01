import type { Signal } from '@/lib/types';

const HOUR = 60 * 60 * 1000;

/** Detected timestamps are relative to launch so the feed always looks live. */
function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * HOUR).toISOString();
}

export const SIGNALS: Signal[] = [
  {
    id: 'sig-voice-clone-podcast',
    keyword: 'ai voice cloning for podcasts',
    niche: 'ai-tools',
    momentum: 412,
    volume: 18400,
    competition: 'medium',
    region: 'Global',
    detectedAt: hoursAgo(5),
    peakInDays: 9,
    series: [12, 14, 13, 18, 22, 27, 31, 44, 58, 66, 79, 88, 94, 100],
    why: 'Three podcast networks announced cloned-host episodes in the same week. Search moved from "is it legal" to "how do I do it", which is buying intent.',
    sources: ['Google Trends', 'r/podcasting', 'YouTube search suggest'],
    play: {
      kind: 'content',
      headline: 'Become the person who explains podcast voice cloning in plain language',
      audience:
        'Solo podcasters with 50 to 5,000 listeners who record weekly and hate re-recording',
      steps: [
        {
          title: 'Record one 8-minute walkthrough',
          detail:
            'Clone your own voice, then read the same paragraph twice, once real once cloned. The A/B moment is the whole video.',
        },
        {
          title: 'Publish as a comparison, not a tutorial',
          detail:
            'Title it "I cloned my voice and my listeners could not tell". Comparison beats tutorial on click-through for new topics.',
        },
        {
          title: 'Put the workflow behind an email gate',
          detail:
            'One-page PDF with settings, prompt, and the fix for robotic breathing. Costs you nothing, converts at 20 to 30% on hot traffic.',
        },
        {
          title: 'Add an affiliate layer on day three',
          detail:
            'Voice tools pay recurring commission. Do not lead with it, place it after the honest limitations section.',
        },
      ],
      angles: [
        'I cloned my voice and my listeners could not tell',
        'The three settings that stop cloned voices sounding dead',
        'What voice cloning still cannot do (and why that is fine)',
      ],
      monetization: {
        model: 'Affiliate plus email list',
        estimate: '€400 to €1,800 in the first month',
        note: 'Recurring tool commissions compound if you keep the page updated as pricing changes.',
      },
      firstPost:
        'I cloned my own voice this week and re-recorded an old episode with it. My three most loyal listeners could not pick the fake one. Here is exactly what I did, what it cost, and the one setting that gives it away if you get it wrong.',
      keywords: [
        'ai voice cloning for podcasts',
        'clone my voice for podcast',
        'voice cloning ethics podcast',
        'best voice cloning tool 2026',
      ],
    },
  },
  {
    id: 'sig-cortisol-face',
    keyword: 'cortisol face reduce swelling',
    niche: 'wellness',
    momentum: 389,
    volume: 91200,
    competition: 'high',
    region: 'Global',
    detectedAt: hoursAgo(11),
    peakInDays: 9,
    series: [20, 24, 26, 33, 41, 52, 58, 63, 71, 80, 86, 92, 97, 100],
    why: 'A single TikTok format ("cortisol face before and after") crossed 40 million views. Google search follows TikTok by roughly four days, so the search wave is only starting.',
    sources: ['TikTok Creative Center', 'Google Trends breakout', 'Pinterest trends'],
    play: {
      kind: 'content',
      headline: 'Win the "is cortisol face real" question before the debunk wave arrives',
      audience:
        'Women 22 to 38 who saw the trend, felt seen, and now want something concrete to do',
      steps: [
        {
          title: 'Answer the sceptical question honestly',
          detail:
            'Most of the trend is puffiness from sleep, salt and alcohol, not clinical cortisol. Saying so earns trust and outranks the hype pages within weeks.',
        },
        {
          title: 'Ship a 7-day de-puff checklist',
          detail:
            'Sleep window, sodium, lymph massage, caffeine timing. Concrete and free. This is your lead magnet.',
        },
        {
          title: 'Film the same three shots daily',
          detail:
            'Same light, same angle, morning and evening. Visual proof is the entire conversion mechanism in this niche.',
        },
        {
          title: 'Layer a €9 protocol product on day ten',
          detail:
            'Only after the free checklist has proof attached. Cheap digital product converts better than affiliate here.',
        },
      ],
      angles: [
        'Cortisol face is mostly not cortisol. Here is what it actually is',
        'Seven days of the de-puff routine, photographed every morning',
        'The three things that made zero difference (save your money)',
      ],
      monetization: {
        model: 'Low-ticket digital product',
        estimate: '€900 to €4,000 while the trend runs',
        note: 'High volume, high competition. Speed and honesty are your only edge here.',
      },
      firstPost:
        'Your "cortisol face" is probably not cortisol. I spent a week testing what actually reduces morning facial puffiness and photographed every single day at the same time in the same light. Two things worked, three did nothing.',
      keywords: [
        'cortisol face reduce swelling',
        'is cortisol face real',
        'morning face puffiness fix',
        'de-puff face routine',
      ],
    },
  },
  {
    id: 'sig-mouth-taping',
    keyword: 'mouth taping sleep safety',
    niche: 'wellness',
    momentum: 445,
    volume: 68900,
    competition: 'medium',
    region: 'Global',
    detectedAt: hoursAgo(3),
    peakInDays: 10,
    series: [15, 16, 19, 24, 30, 38, 47, 55, 64, 73, 82, 90, 96, 100],
    why: 'Interest flipped from "how to" to "is it dangerous" after a widely shared clinician thread. Safety-intent searches are underserved and convert to email at unusually high rates.',
    sources: ['Google Trends', 'X clinician thread', 'r/sleep'],
    play: {
      kind: 'affiliate',
      headline: 'Own the safety question, not the hype',
      audience: 'Light snorers and mouth breathers who already tried it once and got scared',
      steps: [
        {
          title: 'Write the decision tree, not an opinion',
          detail:
            'Three clear "do not do this if" conditions up front. Safety content that starts with contraindications gets linked by real practitioners.',
        },
        {
          title: 'Test four tapes on camera',
          detail:
            'Adhesion, skin reaction, whether it peels off in the night. Physical testing is the moat against AI-written competitors.',
        },
        {
          title: 'Build one comparison table',
          detail:
            'Tape, price per night, skin sensitivity, whether it survives eight hours. Tables win featured snippets.',
        },
        {
          title: 'Add a sleep-tracker angle',
          detail:
            'Screenshot your own before and after nights. Data screenshots are the highest-saved asset in this niche.',
        },
      ],
      angles: [
        'Do not tape your mouth shut if any of these three things are true',
        'I tested four mouth tapes for two weeks. One caused a rash',
        'What my sleep tracker showed before and after taping',
      ],
      monetization: {
        model: 'Affiliate on physical goods',
        estimate: '€300 to €1,500 per month, long tail',
        note: 'Physical product affiliate is lower margin than software but the content stays relevant for years.',
      },
      firstPost:
        'Before you tape your mouth shut tonight, there are three conditions where this is a genuinely bad idea. I went looking for a straight answer, could not find one, so I tested four tapes for two weeks and tracked every night.',
      keywords: [
        'mouth taping sleep safety',
        'is mouth taping dangerous',
        'best mouth tape for sleeping',
        'mouth taping side effects',
      ],
    },
  },
  {
    id: 'sig-x402',
    keyword: 'x402 micropayments tutorial',
    niche: 'finance',
    momentum: 920,
    volume: 3100,
    competition: 'low',
    region: 'Global',
    detectedAt: hoursAgo(2),
    peakInDays: 6,
    series: [2, 3, 3, 5, 8, 12, 19, 28, 41, 55, 68, 81, 93, 100],
    why: 'Near-zero competition against a 900% rise. Almost nothing ranks. This is the classic shape of a window that closes in under two weeks once the big dev blogs notice.',
    sources: ['GitHub stars velocity', 'Hacker News', 'Google Trends breakout'],
    play: {
      kind: 'product',
      headline: 'Publish the reference implementation everyone links to',
      audience: 'Indie developers who want machine-to-machine payments without a merchant account',
      steps: [
        {
          title: 'Ship a working repo in one sitting',
          detail:
            'One paid endpoint, one client that pays and retries. Nothing else. Working beats complete when a topic is this young.',
        },
        {
          title: 'Write the "why this is not Stripe" post',
          detail:
            'Explain the card-fee floor that makes sub-euro pricing impossible. That framing is the searchable part.',
        },
        {
          title: 'Document the failure modes',
          detail:
            'What happens on double payment, on timeout, on wrong amount. Failure docs are what senior developers actually search for.',
        },
        {
          title: 'Turn the repo into a hosted starter',
          detail:
            'Charge for the managed version once the free repo has traction. The repo is the funnel.',
        },
      ],
      angles: [
        'Why per-request pricing is impossible with cards, and what changes now',
        'A paid API endpoint in 40 lines',
        'The four failure modes nobody documents yet',
      ],
      monetization: {
        model: 'Open-core with hosted tier',
        estimate: 'Reputation first, €0 to €500 month one',
        note: 'Low volume, so treat this as authority building rather than immediate revenue.',
      },
      firstPost:
        'Card networks make a €0.05 charge economically impossible: the fixed fee eats it. That single constraint has shaped a decade of SaaS pricing. Here is a 40-line paid endpoint that does not have that constraint, and the four ways it breaks.',
      keywords: [
        'x402 micropayments tutorial',
        'pay per request api',
        'http 402 payment required example',
        'agent to agent payments',
      ],
    },
  },
  {
    id: 'sig-balatro-tracker',
    keyword: 'deck builder run tracker app',
    niche: 'gaming',
    momentum: 512,
    volume: 21600,
    competition: 'low',
    region: 'Global',
    detectedAt: hoursAgo(7),
    peakInDays: 7,
    series: [8, 9, 12, 17, 21, 29, 38, 49, 61, 72, 84, 91, 97, 100],
    why: 'A roguelike deck builder hit a player-count record and the community immediately started spreadsheet-ing their runs. Spreadsheets in a community are the clearest possible signal for a paid app.',
    sources: ['Steam concurrent players', 'r/roguelikes', 'Discord message volume'],
    play: {
      kind: 'product',
      headline: 'Replace the community spreadsheet with a phone app',
      audience: 'Players who already track runs manually and lose the tab every session',
      steps: [
        {
          title: 'Find the most-shared spreadsheet',
          detail:
            'Copy its columns exactly. Do not redesign it. The spreadsheet already passed product-market fit.',
        },
        {
          title: 'Ship logging in under 10 seconds',
          detail: 'Three taps to log a run. Anything slower and people go back to the spreadsheet.',
        },
        {
          title: 'Add the one thing a sheet cannot do',
          detail:
            'Win-rate by starting card, computed automatically. That is the screenshot people post.',
        },
        {
          title: 'Charge once, not monthly',
          detail:
            'Gaming utilities convert far better on a €4.99 one-time unlock than a subscription.',
        },
      ],
      angles: [
        'I built the run tracker the Discord kept asking for',
        'Your win rate by opening hand, computed automatically',
        'Two hundred runs logged, here is what actually correlates with winning',
      ],
      monetization: {
        model: 'One-time unlock',
        estimate: '€1,200 to €6,000 if you ship inside two weeks',
        note: 'Game-attached apps decay with the game. Ship fast, harvest fast, do not build a roadmap.',
      },
      firstPost:
        'The pinned spreadsheet in the Discord has 4,000 copies. I turned it into an app that logs a run in three taps and computes your win rate by opening hand. Free while I fix the bugs you find.',
      keywords: [
        'deck builder run tracker',
        'roguelike run stats app',
        'win rate tracker mobile',
        'seeded run log',
      ],
    },
  },
  {
    id: 'sig-ugc-script',
    keyword: 'ugc script generator',
    niche: 'creator',
    momentum: 376,
    volume: 12100,
    competition: 'low',
    region: 'Global',
    detectedAt: hoursAgo(9),
    peakInDays: 8,
    series: [10, 11, 14, 18, 23, 30, 39, 48, 59, 70, 81, 89, 95, 100],
    why: 'UGC creator supply exploded but scripting is still the bottleneck everyone complains about. Demand is for a narrow tool, not another all-purpose AI writer.',
    sources: ['Upwork job volume', 'TikTok creator forums', 'Google Trends'],
    play: {
      kind: 'product',
      headline: 'A single-purpose script tool beats a general AI writer here',
      audience: 'UGC creators pitching 10 to 40 brands a month who write every script from scratch',
      steps: [
        {
          title: 'Constrain the output hard',
          detail:
            'Hook, problem, product moment, call to action. Fixed four-beat structure. Constraint is the feature.',
        },
        {
          title: 'Seed it with 50 real winning ads',
          detail:
            'Transcribe ads that actually scaled. Quality of the seed set is the entire product quality.',
        },
        {
          title: 'Output a shot list, not prose',
          detail:
            'Creators need what to point the camera at. Prose gets rewritten, shot lists get used.',
        },
        {
          title: 'Price per brand pitch',
          detail:
            'Creators think in pitches, not months. A 20-pitch pack maps to how they already budget.',
        },
      ],
      angles: [
        'The four-beat structure behind every UGC ad that scaled',
        'I transcribed 50 winning ads. They all do the same thing in second two',
        'Stop writing scripts, write shot lists',
      ],
      monetization: {
        model: 'Credit packs per pitch',
        estimate: '€600 to €3,000 per month',
        note: 'Creators churn hard on subscriptions and barely at all on credit packs.',
      },
      firstPost:
        'I transcribed 50 UGC ads that actually scaled. Every single one does the same thing in the first two seconds, and almost nobody teaches it. Here is the four-beat structure, and the tool I built so I never write a script from scratch again.',
      keywords: [
        'ugc script generator',
        'ugc ad script template',
        'tiktok ad hook formula',
        'ugc shot list',
      ],
    },
  },
  {
    id: 'sig-interrail',
    keyword: 'interrail 2026 route planner',
    niche: 'travel',
    momentum: 358,
    volume: 39600,
    competition: 'medium',
    region: 'Europe',
    detectedAt: hoursAgo(14),
    peakInDays: 11,
    series: [18, 20, 25, 31, 36, 45, 53, 62, 70, 79, 87, 93, 98, 100],
    why: 'Night train routes reopened and summer planning peaks now. Highly seasonal, so this window is sharp and predictable rather than speculative.',
    sources: ['Google Trends seasonality', 'r/interrail', 'Rail operator press'],
    play: {
      kind: 'affiliate',
      headline: 'Publish five finished routes instead of a planning guide',
      audience: 'Students and 20-somethings booking a three-week summer trip in the next fortnight',
      steps: [
        {
          title: 'Build five complete itineraries',
          detail:
            'Exact trains, exact nights, real prices. Finished plans convert; "how to plan" articles do not.',
        },
        {
          title: 'Include the night train reservation trap',
          detail:
            'The pass does not cover reservations. That gap is the most-searched frustration in the niche.',
        },
        {
          title: 'Add a printable day-by-day sheet',
          detail: 'Offline copy matters when roaming fails. Email-gate it.',
        },
        {
          title: 'Monetise with pass and insurance affiliate',
          detail:
            'Both pay well and are genuinely needed. Place them at the decision point, not the intro.',
        },
      ],
      angles: [
        'Five finished Interrail routes with real 2026 prices',
        'The reservation fees nobody tells you the pass does not cover',
        'Three weeks, nine countries, what it actually cost',
      ],
      monetization: {
        model: 'Travel affiliate',
        estimate: '€800 to €3,500 across the season',
        note: 'Strictly seasonal. Publish now, it earns again next summer with a date refresh.',
      },
      firstPost:
        'I planned nine countries in three weeks by train and the pass price was only half of what I actually paid. Here are five finished routes with real 2026 numbers, including every reservation fee the pass does not cover.',
      keywords: [
        'interrail 2026 route planner',
        'interrail night train reservation',
        'interrail three week route',
        'europe train pass cost',
      ],
    },
  },
  {
    id: 'sig-creatine-gummies',
    keyword: 'creatine gummies for women',
    niche: 'fitness',
    momentum: 341,
    volume: 61000,
    competition: 'high',
    region: 'Global',
    detectedAt: hoursAgo(20),
    peakInDays: 16,
    series: [22, 25, 28, 34, 40, 48, 55, 63, 70, 78, 85, 92, 97, 100],
    why: 'Creatine crossed from gym culture into general wellness and the format question became the search. Gummy stability is a real, testable controversy nobody has covered properly.',
    sources: ['Amazon movers and shakers', 'Google Trends', 'TikTok Creative Center'],
    play: {
      kind: 'affiliate',
      headline: 'Test whether the gummies actually contain what they claim',
      audience: 'Women 25 to 45 starting creatine who will not tolerate the powder texture',
      steps: [
        {
          title: 'Buy five brands and check the dose maths',
          detail:
            'Most gummies need six to eight pieces for 5g. Computing real cost per gram is the whole article.',
        },
        {
          title: 'Cover the degradation question',
          detail:
            'Creatine converts to creatinine in moisture over time. Explaining this plainly is your ranking edge.',
        },
        {
          title: 'Publish a cost-per-gram table',
          detail:
            'Gummies versus powder versus capsules. Tables win snippets and get screenshotted.',
        },
        {
          title: 'Update the page weekly for a month',
          detail:
            'This term is competitive. Freshness signals are how a small site holds position.',
        },
      ],
      angles: [
        'How many gummies you actually need for 5g (it is not two)',
        'Cost per gram: gummies versus powder, five brands compared',
        'The moisture problem with creatine gummies nobody mentions',
      ],
      monetization: {
        model: 'Amazon and DTC affiliate',
        estimate: '€500 to €2,500 per month',
        note: 'High competition means you need the physical testing angle. Do not write this from a desk.',
      },
      firstPost:
        'The label says two gummies. The maths says you need seven to hit 5g of creatine. I bought five brands, did the arithmetic, and worked out the real cost per gram against plain powder. One brand is genuinely fine. Three are not.',
      keywords: [
        'creatine gummies for women',
        'creatine gummies dosage',
        'creatine gummies vs powder',
        'do creatine gummies work',
      ],
    },
  },
  {
    id: 'sig-protein-ice-cream',
    keyword: 'protein ice cream homemade recipe',
    niche: 'food',
    momentum: 297,
    volume: 52800,
    competition: 'medium',
    region: 'Global',
    detectedAt: hoursAgo(26),
    peakInDays: 13,
    series: [25, 27, 31, 36, 42, 49, 56, 64, 71, 79, 86, 92, 97, 100],
    why: 'Frozen dessert machines went mainstream and the price of branded protein ice cream keeps rising. The gap between the two is exactly where recipe demand sits.',
    sources: ['Pinterest trends', 'Google Trends', 'YouTube search suggest'],
    play: {
      kind: 'content',
      headline: 'Own the texture problem, because every recipe out there fails on it',
      audience: 'People with a frozen dessert machine who tried once and got an icy brick',
      steps: [
        {
          title: 'Solve iciness explicitly',
          detail:
            'Protein plus water equals ice crystals. The fix is fat and a binder. Lead with the failure everyone had.',
        },
        {
          title: 'Publish a base ratio, then flavours',
          detail:
            'One memorised ratio plus eight variations. Ratios get saved, recipes get forgotten.',
        },
        {
          title: 'Show the cost per serving',
          detail:
            'Homemade versus the branded tub. The number is dramatic and it is the shareable asset.',
        },
        {
          title: 'Turn saves into a recipe card pack',
          detail: 'Printable cards for €5. Recipe audiences buy small artefacts, not courses.',
        },
      ],
      angles: [
        'Why your protein ice cream comes out like a brick',
        'One base ratio, eight flavours, memorise it once',
        'Cost per serving versus the branded tub',
      ],
      monetization: {
        model: 'Digital recipe pack plus affiliate',
        estimate: '€400 to €2,000 per month',
        note: 'Food content compounds slowly but decays slowly too. Good long-term asset.',
      },
      firstPost:
        'Your protein ice cream comes out like a brick because protein powder is mostly water-binding and no fat. Two ingredients fix it. Here is the base ratio I now use for everything, and what a serving actually costs against the branded tub.',
      keywords: [
        'protein ice cream homemade recipe',
        'protein ice cream not icy',
        'ninja creami protein base',
        'high protein dessert cheap',
      ],
    },
  },
  {
    id: 'sig-notion-voice',
    keyword: 'notion voice notes integration',
    niche: 'ai-tools',
    momentum: 288,
    volume: 9200,
    competition: 'low',
    region: 'Global',
    detectedAt: hoursAgo(31),
    peakInDays: 12,
    series: [14, 15, 18, 22, 27, 33, 41, 50, 59, 69, 79, 88, 95, 100],
    why: 'A missing integration with steady search volume and almost no ranking pages. Integration-gap searches are the most reliable micro-SaaS signal that exists.',
    sources: ['Google Trends', 'Notion community forum', 'Product Hunt comments'],
    play: {
      kind: 'product',
      headline: 'Build the smallest possible bridge and charge for it',
      audience: 'Notion power users who think out loud and never type their notes up',
      steps: [
        {
          title: 'Do one direction only',
          detail: 'Voice in, structured Notion page out. No sync, no two-way, no settings screen.',
        },
        {
          title: 'Structure the transcript',
          detail:
            'Decisions, tasks, open questions. Raw transcripts are worthless, structure is the product.',
        },
        {
          title: 'Launch in the community forum first',
          detail:
            'The people complaining about the gap are your first fifty customers. Reply to every thread.',
        },
        {
          title: 'Price flat and low',
          detail:
            '€6 per month. Utility bridges cannot support more, and low price kills support burden.',
        },
      ],
      angles: [
        'Talk for two minutes, get a structured Notion page',
        'Raw transcripts are useless. Here is what to extract instead',
        'The integration Notion never shipped',
      ],
      monetization: {
        model: 'Flat low subscription',
        estimate: '€200 to €1,200 monthly recurring',
        note: 'Slow, boring, durable. This is the least glamorous and most reliable play in the list.',
      },
      firstPost:
        'I think out loud and never type my notes up, so the ideas die in a voice memo folder. I built the smallest possible bridge: talk for two minutes, get a Notion page with decisions, tasks and open questions already separated.',
      keywords: [
        'notion voice notes integration',
        'voice memo to notion',
        'transcribe meeting to notion',
        'notion ai voice',
      ],
    },
  },
  {
    id: 'sig-balkonkraftwerk',
    keyword: 'balkonkraftwerk anmelden 2026',
    niche: 'home',
    momentum: 268,
    volume: 74200,
    competition: 'medium',
    region: 'Germany',
    detectedAt: hoursAgo(18),
    peakInDays: 25,
    series: [30, 32, 36, 41, 46, 53, 60, 67, 74, 81, 88, 93, 98, 100],
    why: 'A registration rule change landed and the official guidance is dense. Regulatory confusion in a large market is the most monetisable local search pattern there is.',
    sources: ['Google Trends Germany', 'Bundesnetzagentur updates', 'r/de'],
    play: {
      kind: 'local',
      headline: 'Translate a regulation into a ten-minute checklist',
      audience:
        'German renters and flat owners who bought a balcony solar kit and now face paperwork',
      steps: [
        {
          title: 'Write the checklist, in German',
          detail:
            'Every field of the registration, in order, with what to type. Local language, local specificity, no hedging.',
        },
        {
          title: 'Screenshot the actual portal',
          detail:
            'Real screenshots are what makes this outrank the official page, which nobody can follow.',
        },
        {
          title: 'Add the landlord permission template',
          detail:
            'Renters are the majority and are blocked on this. A copy-paste letter is the highest-value asset here.',
        },
        {
          title: 'Monetise with kit affiliate plus installer leads',
          detail:
            'Two revenue lines from one page. Installer referral pays far more than hardware commission.',
        },
      ],
      angles: [
        'Balkonkraftwerk anmelden: every field, in order, with screenshots',
        'The landlord letter that gets balcony solar approved',
        'What changed in 2026 and what you can ignore',
      ],
      monetization: {
        model: 'Affiliate plus installer referral',
        estimate: '€1,000 to €5,000 per month',
        note: 'German-language competition is thinner than English. Regulatory pages age well with annual refreshes.',
      },
      firstPost:
        'Die offizielle Anleitung ist unlesbar. Ich habe die Anmeldung selbst durchgeklickt und jedes Feld dokumentiert, mit Screenshots und der Vorlage fuer die Genehmigung des Vermieters.',
      keywords: [
        'balkonkraftwerk anmelden 2026',
        'balkonkraftwerk vermieter erlaubnis',
        'marktstammdatenregister balkonkraftwerk',
        'balkonkraftwerk regeln neu',
      ],
    },
  },
  {
    id: 'sig-faceless-youtube',
    keyword: 'faceless youtube channel automation',
    niche: 'creator',
    momentum: 254,
    volume: 44300,
    competition: 'high',
    region: 'Global',
    detectedAt: hoursAgo(38),
    peakInDays: 14,
    series: [28, 30, 33, 38, 44, 50, 57, 64, 71, 78, 85, 91, 97, 100],
    why: 'Volume is large and rising but the space is saturated with recycled advice. The unmet demand is for honest numbers from someone who actually ran one.',
    sources: ['Google Trends', 'YouTube search suggest', 'r/NewTubers'],
    play: {
      kind: 'content',
      headline: 'Publish the real numbers, because everyone else is selling a dream',
      audience: 'People who watched three "make €10k" videos and now want to know what is true',
      steps: [
        {
          title: 'Run one channel for 30 days and log everything',
          detail:
            'Hours, tool costs, RPM, views. Your primary data is the only defensible asset in a saturated niche.',
        },
        {
          title: 'Lead with the disappointing result',
          detail:
            'If you made €38, say €38. Contrarian honesty outperforms hype on retention and comments.',
        },
        {
          title: 'Break down where time actually went',
          detail:
            'Almost always thumbnails and research, not generation. This reframe is the useful insight.',
        },
        {
          title: 'Sell nothing for the first month',
          detail:
            'In a scam-heavy niche, trust is the scarce resource. Monetise with sponsors later, not a course.',
        },
      ],
      angles: [
        'I ran a faceless channel for 30 days. I made €38',
        'Where the time actually goes (it is not the AI part)',
        'The three claims in every faceless channel video that are false',
      ],
      monetization: {
        model: 'Ad revenue plus sponsorship',
        estimate: '€200 to €1,500 per month, slow ramp',
        note: 'Crowded. Only worth it if you commit to publishing real numbers others will not.',
      },
      firstPost:
        'I ran a faceless YouTube channel for 30 days exactly the way the gurus describe it. I made €38. Here is every hour logged, every tool cost, and the part of the process that AI does not actually shorten.',
      keywords: [
        'faceless youtube channel automation',
        'faceless channel real earnings',
        'ai youtube channel results',
        'faceless youtube tools cost',
      ],
    },
  },
  {
    id: 'sig-cold-plunge',
    keyword: 'cold plunge tub apartment',
    niche: 'fitness',
    momentum: 196,
    volume: 27500,
    competition: 'medium',
    region: 'Germany',
    detectedAt: hoursAgo(44),
    peakInDays: 21,
    series: [35, 37, 40, 44, 48, 54, 60, 66, 73, 80, 86, 92, 97, 100],
    why: 'Cold exposure went mainstream but almost all content assumes a garden. The apartment constraint is a large, specific, unserved sub-intent.',
    sources: ['Google Trends Germany', 'r/Berlin', 'Amazon search volume'],
    play: {
      kind: 'affiliate',
      headline: 'Serve the constraint everyone else ignores: no garden, no drain, no space',
      audience: 'City renters in 40 to 70 square metre flats who want cold exposure anyway',
      steps: [
        {
          title: 'Measure everything for real flats',
          detail:
            'Footprint, filled weight, whether a bathroom floor takes it. Weight is the question nobody answers.',
        },
        {
          title: 'Solve draining and refilling',
          detail:
            'The practical blocker is water logistics, not the tub. Solve it and you own the intent.',
        },
        {
          title: 'Cover the ice-cost maths',
          detail: 'Bagged ice versus a chiller, per session. Determines what people actually buy.',
        },
        {
          title: 'Add a cheap alternative section',
          detail: 'Recommending the €40 option builds the trust that sells the €900 one later.',
        },
      ],
      angles: [
        'A filled plunge tub weighs 300kg. Will your bathroom floor take it?',
        'Cold plunge in a 45 square metre flat: what actually fits',
        'Bagged ice versus a chiller, cost per session',
      ],
      monetization: {
        model: 'High-ticket affiliate',
        estimate: '€600 to €2,800 per month',
        note: 'Few sales but large commissions. Weight and drainage detail is what earns the click.',
      },
      firstPost:
        'A filled cold plunge weighs about as much as four adults standing in one spot. Nobody selling them mentions that, and it is the first thing that matters in a rented flat. Here is what actually fits, and how to drain it without a garden hose.',
      keywords: [
        'cold plunge tub apartment',
        'cold plunge weight floor',
        'ice bath small flat',
        'cold plunge chiller cost',
      ],
    },
  },
  {
    id: 'sig-silent-air-fryer',
    keyword: 'silent air fryer under 60db',
    niche: 'home',
    momentum: 204,
    volume: 8800,
    competition: 'low',
    region: 'Global',
    detectedAt: hoursAgo(52),
    peakInDays: 20,
    series: [30, 31, 34, 38, 43, 49, 55, 62, 69, 77, 85, 92, 97, 100],
    why: 'A specific measurable attribute with rising volume and no page that actually measures it. Attribute-specific searches are cheap to win and convert unusually well.',
    sources: ['Google Trends', 'Amazon question volume', 'r/smallapartments'],
    play: {
      kind: 'affiliate',
      headline: 'Actually measure the decibels, because nobody has',
      audience: 'Studio flat and open-plan dwellers who cook while someone else sleeps or works',
      steps: [
        {
          title: 'Measure eight models with a sound meter',
          detail:
            'Same distance, same mode, published method. Primary measurement is unbeatable by AI content.',
        },
        {
          title: 'Separate fan noise from the beeping',
          detail: 'The end-of-cycle beep is the real complaint. Note which models let you mute it.',
        },
        {
          title: 'Publish the table plus the method',
          detail: 'Method transparency is what earns links from larger sites.',
        },
        {
          title: 'Expand to adjacent quiet appliances',
          detail: 'Same audience, same method, more pages. This becomes a small niche site.',
        },
      ],
      angles: [
        'I measured eight air fryers with a sound meter',
        'The beep is louder than the fan, and only three models let you mute it',
        'Quietest appliances for a studio flat, measured',
      ],
      monetization: {
        model: 'Affiliate plus display',
        estimate: '€250 to €1,200 per month',
        note: 'Small volume but almost no competition. Excellent first project.',
      },
      firstPost:
        'Every listing says "quiet". None publish a number. I put a sound meter 50cm from eight air fryers and measured them in the same mode. The loudest is 71dB. And on five of them, the end-of-cycle beep is louder than the fan.',
      keywords: [
        'silent air fryer under 60db',
        'quietest air fryer measured',
        'air fryer noise level db',
        'mute air fryer beep',
      ],
    },
  },
  {
    id: 'sig-sourdough-kit',
    keyword: 'sourdough starter kit berlin',
    niche: 'food',
    momentum: 231,
    volume: 6400,
    competition: 'low',
    region: 'Germany',
    detectedAt: hoursAgo(29),
    peakInDays: 15,
    series: [26, 28, 31, 35, 40, 46, 53, 60, 68, 76, 84, 91, 97, 100],
    why: 'A local, low-competition term with buying intent in the query itself. Small volume, but the intent is a purchase rather than research.',
    sources: ['Google Trends Berlin', 'Instagram local tags', 'Etsy search volume'],
    play: {
      kind: 'local',
      headline: 'Sell a physical kit locally, no shipping, no warehouse',
      audience: 'Berliners who follow bread accounts and want to start this weekend',
      steps: [
        {
          title: 'Assemble ten kits by hand',
          detail:
            'Starter, jar, scraper, one printed card. Ten units validates demand without inventory risk.',
        },
        {
          title: 'Sell via local pickup only',
          detail: 'Kills shipping cost and creates the scarcity that makes local listings convert.',
        },
        {
          title: 'Put a QR to a video on the card',
          detail: 'Support burden collapses and the video becomes the top-of-funnel asset.',
        },
        {
          title: 'Add a bakery collaboration',
          detail: 'A named local bakery starter is the differentiator no online seller can copy.',
        },
      ],
      angles: [
        'Ten starter kits, Berlin pickup only, this weekend',
        'Your first loaf in five days, from a starter that is already alive',
        'Why a mail-order starter arrives half dead',
      ],
      monetization: {
        model: 'Physical product, local pickup',
        estimate: '€300 to €1,500 per month',
        note: 'Lowest tech, fastest cash, hardest to scale. Good if you want revenue this week.',
      },
      firstPost:
        'I have ten sourdough starter kits ready, Berlin pickup only. The starter is already active, so your first loaf is five days away instead of three weeks. Jar, scraper, and a card with a QR to the video.',
      keywords: [
        'sourdough starter kit berlin',
        'sauerteig starter kaufen berlin',
        'sourdough starter pickup',
        'sauerteig anstellgut berlin',
      ],
    },
  },
  {
    id: 'sig-dog-dna',
    keyword: 'dog dna test accuracy comparison',
    niche: 'pets',
    momentum: 162,
    volume: 29400,
    competition: 'medium',
    region: 'Global',
    detectedAt: hoursAgo(60),
    peakInDays: 24,
    series: [40, 41, 44, 47, 51, 56, 61, 67, 73, 80, 86, 92, 97, 100],
    why: 'Two providers disagreed publicly about breed accuracy and owners started comparing. Comparison intent on a €100 product means high affiliate value per visit.',
    sources: ['Google Trends', 'r/dogs', 'Provider press releases'],
    play: {
      kind: 'affiliate',
      headline: 'Send the same dog to three labs and publish the disagreement',
      audience: 'Mixed-breed owners deciding which €100 test to buy',
      steps: [
        {
          title: 'Test one dog with three providers',
          detail: 'Identical sample, three results. The disagreement is the story and the traffic.',
        },
        {
          title: 'Explain reference panel size',
          detail:
            'Accuracy comes from the breed database, not the chemistry. Explaining that once earns the ranking.',
        },
        {
          title: 'Cover the health-marker caveat',
          detail: 'Screening is not diagnosis. Vets link to content that says this clearly.',
        },
        {
          title: 'Keep a live results table',
          detail:
            'Add reader-submitted results over time. User data turns one article into a moat.',
        },
      ],
      angles: [
        'One dog, three DNA tests, three different answers',
        'Why breed accuracy is about database size, not the lab',
        'What the health markers can and cannot tell you',
      ],
      monetization: {
        model: 'Affiliate on a high-value product',
        estimate: '€400 to €2,200 per month',
        note: 'Evergreen once ranked. Reader-submitted results keep it fresh with no extra spend.',
      },
      firstPost:
        'I swabbed the same dog three times and sent the samples to three different companies. I got three different breed breakdowns. Here is why that happens, and which number in the fine print actually predicts accuracy.',
      keywords: [
        'dog dna test accuracy comparison',
        'best dog dna test 2026',
        'dog dna test different results',
        'dog breed test reliability',
      ],
    },
  },
  {
    id: 'sig-steam-deck-dock',
    keyword: 'steam deck oled dock diy',
    niche: 'gaming',
    momentum: 173,
    volume: 15900,
    competition: 'medium',
    region: 'Global',
    detectedAt: hoursAgo(70),
    peakInDays: 18,
    series: [38, 39, 42, 45, 49, 54, 59, 65, 71, 78, 85, 91, 96, 100],
    why: 'Official dock supply is tight and third-party options behave inconsistently. Compatibility confusion is reliably monetisable.',
    sources: ['r/SteamDeck', 'Google Trends', 'AliExpress listing velocity'],
    play: {
      kind: 'content',
      headline: 'Build the compatibility table the community keeps asking for',
      audience: 'Handheld owners who want desktop mode without paying for the first-party dock',
      steps: [
        {
          title: 'Test six cheap hubs',
          detail:
            'Resolution, refresh, ethernet, whether it wakes from sleep. Sleep-wake is the failure everyone hits.',
        },
        {
          title: 'Document the exact failure modes',
          detail:
            'Not "works" or "does not work" but what specifically breaks. That precision is the value.',
        },
        {
          title: 'Include a full parts list with prices',
          detail:
            'Hub, cable, stand, total. Total cost against the official dock is the shareable number.',
        },
        {
          title: 'Maintain it as a living page',
          detail: 'Hardware pages die when stale. Monthly retest keeps the ranking.',
        },
      ],
      angles: [
        'Six cheap hubs tested: four break on sleep-wake',
        'Desktop mode for €31 instead of €89',
        'The exact spec line that predicts whether a hub will work',
      ],
      monetization: {
        model: 'Affiliate plus display',
        estimate: '€300 to €1,400 per month',
        note: 'Hardware compatibility pages need upkeep but hold rankings for a long time.',
      },
      firstPost:
        'I bought six cheap USB-C hubs to avoid the €89 official dock. Two work properly. Four fail the same way: they will not re-detect the display after sleep. Here is the spec line that predicts it.',
      keywords: [
        'steam deck oled dock diy',
        'steam deck usb c hub compatibility',
        'cheap steam deck dock alternative',
        'steam deck dock sleep issue',
      ],
    },
  },
  {
    id: 'sig-depot-alternative',
    keyword: 'depot alternative gebühren vergleich',
    niche: 'finance',
    momentum: 148,
    volume: 33800,
    competition: 'medium',
    region: 'Germany',
    detectedAt: hoursAgo(80),
    peakInDays: 30,
    series: [45, 46, 48, 51, 54, 58, 63, 68, 74, 80, 86, 92, 97, 100],
    why: 'A large bank adjusted custody fees and switching intent rose across German comparison terms. Financial switching intent has the highest affiliate payouts of any consumer niche.',
    sources: ['Google Trends Germany', 'Finanzfluss comments', 'Bank press releases'],
    play: {
      kind: 'affiliate',
      headline: 'Build a switching cost calculator, not another comparison table',
      audience: 'German retail investors with €10k to €150k paying custody fees they just noticed',
      steps: [
        {
          title: 'Compute total cost over ten years',
          detail:
            'Custody plus order fees plus spread. The ten-year number is what triggers the switch.',
        },
        {
          title: 'Document the transfer process',
          detail:
            'Depotübertrag mechanics, timing, tax basis carry-over. This is the actual blocker.',
        },
        {
          title: 'Be explicit about affiliate incentives',
          detail: 'German finance audiences punish hidden incentives hard. Disclose prominently.',
        },
        {
          title: 'Ship the calculator as the page',
          detail: 'An interactive tool earns links and repeat visits that an article never will.',
        },
      ],
      angles: [
        'What your custody fee actually costs over ten years',
        'Depotübertrag step by step, including the tax basis question',
        'Every broker fee, disclosed incentives included',
      ],
      monetization: {
        model: 'Broker referral',
        estimate: '€1,500 to €8,000 per month',
        note: 'Highest payouts in the list, also the highest trust bar. Slow build, strong ceiling.',
      },
      firstPost:
        'Eine Depotgebühr von 0,2 Prozent klingt nach nichts. Auf 80.000 Euro über zehn Jahre sind es vier Zahlen. Ich habe einen Rechner gebaut, der die Gesamtkosten vergleicht, inklusive Orderkosten und Spread.',
      keywords: [
        'depot alternative gebühren vergleich',
        'depotübertrag anleitung',
        'günstigstes depot 2026',
        'depotgebühren sparen',
      ],
    },
  },
  {
    id: 'sig-cat-fountain',
    keyword: 'cat water fountain filter refill',
    niche: 'pets',
    momentum: 139,
    volume: 41000,
    competition: 'high',
    region: 'Global',
    detectedAt: hoursAgo(90),
    peakInDays: 28,
    series: [48, 49, 51, 54, 57, 61, 66, 71, 76, 82, 88, 93, 97, 100],
    why: 'Consumable-refill searches recur monthly forever. Lower excitement, but the traffic never decays and repeat purchase rates are the highest in the pet category.',
    sources: ['Amazon subscribe-and-save data', 'Google Trends', 'r/cats'],
    play: {
      kind: 'affiliate',
      headline: 'Win the boring recurring search instead of the exciting one',
      audience: 'Fountain owners hunting the right refill filter every four to six weeks',
      steps: [
        {
          title: 'Build a model-to-filter lookup',
          detail:
            'The entire search is "which filter fits mine". A lookup table answers it in one screen.',
        },
        {
          title: 'Test third-party fit honestly',
          detail: 'Generic packs are a third of the price. Say which actually seal and which leak.',
        },
        {
          title: 'Answer the replacement interval question',
          detail:
            'Manufacturers overstate frequency. An evidence-based interval is genuinely useful and highly shared.',
        },
        {
          title: 'Push subscribe-and-save',
          detail:
            'Recurring commissions on a consumable is the closest thing to passive income here.',
        },
      ],
      angles: [
        'Which filter fits your fountain, one table',
        'Generic filters at a third of the price: which ones actually seal',
        'You are replacing filters twice as often as you need to',
      ],
      monetization: {
        model: 'Consumable affiliate with subscriptions',
        estimate: '€300 to €1,600 per month',
        note: 'Unglamorous and durable. Traffic recurs on a monthly cycle by design.',
      },
      firstPost:
        'Finding the right refill filter for a cat fountain should take ten seconds and instead takes twenty minutes. I built one table: your model, the filter that fits, the generic that also fits, and the one that leaks.',
      keywords: [
        'cat water fountain filter refill',
        'which filter fits my cat fountain',
        'generic cat fountain filters',
        'how often replace fountain filter',
      ],
    },
  },
  {
    id: 'sig-japan-nomad',
    keyword: 'japan digital nomad visa requirements',
    niche: 'travel',
    momentum: 187,
    volume: 22300,
    competition: 'medium',
    region: 'Global',
    detectedAt: hoursAgo(100),
    peakInDays: 26,
    series: [42, 43, 46, 49, 53, 58, 63, 69, 75, 81, 87, 93, 97, 100],
    why: 'A visa category opened and official documentation is thin and partly untranslated. Immigration paperwork gaps are consistently high-value, high-trust content.',
    sources: ['Google Trends', 'Nomad List forum', 'Immigration bureau updates'],
    play: {
      kind: 'content',
      headline: 'Document one real application end to end',
      audience: 'Remote workers earning above the income threshold who are actually considering it',
      steps: [
        {
          title: 'List every document with a real example',
          detail:
            'Income proof format is where applications fail. Show an accepted example, redacted.',
        },
        {
          title: 'Clarify the insurance requirement',
          detail:
            'Coverage minimums are ambiguous in the official text. Name policies that satisfy them.',
        },
        {
          title: 'Publish a real timeline',
          detail:
            'Submission to decision, dated. Timelines are the most-cited element of visa content.',
        },
        {
          title: 'Monetise with insurance affiliate',
          detail: 'Required purchase, decent commission, genuinely helpful placement.',
        },
      ],
      angles: [
        'Every document, with a redacted example of what got accepted',
        'The insurance minimum, and three policies that meet it',
        'Submitted to approved: the real timeline, dated',
      ],
      monetization: {
        model: 'Insurance and service affiliate',
        estimate: '€400 to €2,000 per month',
        note: 'Needs updating when rules change, but ranks fast because so little exists.',
      },
      firstPost:
        'The official page tells you what you need but not what an accepted version looks like, and income proof is where most applications fail. Here is every document I submitted, redacted, plus the dated timeline from submission to approval.',
      keywords: [
        'japan digital nomad visa requirements',
        'japan nomad visa income proof',
        'japan nomad visa insurance',
        'japan digital nomad visa timeline',
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Berlin. City-level signals: small volumes, thin competition, and the kind of
  // administrative friction that only exists in one place — which is exactly why
  // nobody has bothered to rank for it.
  // ---------------------------------------------------------------------------

  {
    id: 'sig-anmeldung-termin',
    keyword: 'anmeldung termin berlin bekommen',
    niche: 'home',
    momentum: 318,
    volume: 46300,
    competition: 'low',
    region: 'Berlin',
    detectedAt: hoursAgo(7),
    peakInDays: 31,
    series: [38, 40, 44, 47, 52, 58, 63, 69, 76, 82, 88, 93, 97, 100],
    why: 'Bürgeramt slots are released in bursts and disappear within minutes, so the query is not "how do I register" but "how do I get a slot at all". Berlin absorbs tens of thousands of new arrivals a quarter and the frustration is structural, not seasonal.',
    sources: ['Google Trends Berlin', 'r/berlin', 'Berlin Service Portal release patterns'],
    play: {
      kind: 'local',
      headline: 'Sell the slot, not the explanation',
      audience:
        'People who moved to Berlin in the last month, need an Anmeldung within two weeks, and have already failed to find an appointment',
      steps: [
        {
          title: 'Log when slots actually appear',
          detail:
            'Check the portal on a schedule for two weeks and record every release. Two weeks of dated observations is more than any existing page has.',
        },
        {
          title: 'Publish the pattern for free',
          detail:
            'A post naming the hours slots land ranks almost immediately, because every competing page just says keep refreshing.',
        },
        {
          title: 'Charge for the alert, not the article',
          detail:
            'A Telegram or email ping the moment a slot opens is the part people pay for, and it costs almost nothing to run once the checker exists.',
        },
        {
          title: 'Bundle the English paperwork pack',
          detail:
            'Wohnungsgeberbestätigung template plus the registration form translated field by field. One-off purchase attached to a recurring alert.',
        },
      ],
      angles: [
        'The hours Berlin actually releases Bürgeramt slots, logged for 14 days',
        'Anmeldung in English: every field, plus the landlord confirmation template',
        'Why refreshing at 9am is the worst possible strategy',
      ],
      monetization: {
        model: 'Paid alerts plus a template pack',
        estimate: '€800 to €4,000 per month',
        note: 'Recurring by nature — this city has not fixed the problem in fifteen years. Keep the alert cheap and monthly, the pack one-off.',
      },
      firstPost:
        'I checked the Berlin appointment portal every hour for two weeks and logged every slot release. They do not appear at 9am when everyone is refreshing, and there is a pattern nobody has written down. Here it is, with the Anmeldung form translated field by field and the landlord confirmation template you will also need.',
      keywords: [
        'anmeldung termin berlin bekommen',
        'bürgeramt termin berlin sofort',
        'wohnungsgeberbestätigung vorlage',
        'anmeldung berlin english',
      ],
    },
  },
  {
    id: 'sig-mietspiegel-check',
    keyword: 'mietspiegel berlin mieterhöhung prüfen',
    niche: 'finance',
    momentum: 264,
    volume: 31800,
    competition: 'low',
    region: 'Berlin',
    detectedAt: hoursAgo(11),
    peakInDays: 23,
    series: [26, 29, 31, 36, 42, 49, 57, 64, 72, 80, 87, 92, 96, 100],
    why: 'A revised rent index landed and every landlord letter that follows it becomes a search. People are checking a number against a table they cannot read, with real money attached — the highest-intent local query there is.',
    sources: ['Google Trends Berlin', 'r/berlin', 'Berlin Mietspiegel publication'],
    play: {
      kind: 'product',
      headline: 'Turn the rent table into a two-minute answer',
      audience:
        'Berlin tenants holding a rent increase letter who want to know whether it is lawful before they reply',
      steps: [
        {
          title: 'Rebuild the table as a form',
          detail:
            'Postcode, size, year built, fittings in — permitted range out. The fact that the official version is an unreadable PDF is the entire opportunity.',
        },
        {
          title: 'Show the working',
          detail:
            'Print the comparison and the paragraph it comes from. A checkable answer is both more persuasive and safer than a verdict.',
        },
        {
          title: 'End on a letter, not a number',
          detail:
            'A polite objection template with the calculation attached converts far better than a result screen. The user came here to reply to someone.',
        },
        {
          title: 'Monetise the escalation',
          detail:
            'Tenant association referral plus a paid document check for the complicated cases. Free calculator, paid follow-through.',
        },
      ],
      angles: [
        'Is your Berlin rent increase legal? Three numbers, one answer',
        'The rent index in plain German, without opening the PDF',
        'The objection letter that gets an increase withdrawn',
      ],
      monetization: {
        model: 'Association referral plus paid document check',
        estimate: '€1,200 to €6,000 per month',
        note: 'One-off intent per user but enormous volume, and it refreshes with every index revision. Never phrase the output as legal advice — state the rule and cite it.',
      },
      firstPost:
        'Der neue Mietspiegel ist da und die Tabelle ist praktisch unlesbar. Ich habe sie in ein Formular gebaut: Postleitzahl, Größe, Baujahr, Ausstattung rein — heraus kommt die zulässige Spanne, die Rechnung dazu und ein Widerspruchsschreiben, falls die Erhöhung darüber liegt.',
      keywords: [
        'mietspiegel berlin mieterhöhung prüfen',
        'mieterhöhung widerspruch vorlage',
        'mietspiegel berlin tabelle erklärt',
        'ortsübliche vergleichsmiete berechnen',
      ],
    },
  },
  {
    id: 'sig-kita-gutschein',
    keyword: 'kita gutschein berlin antrag online',
    niche: 'home',
    momentum: 176,
    volume: 19400,
    competition: 'low',
    region: 'Berlin',
    detectedAt: hoursAgo(20),
    peakInDays: 38,
    series: [44, 45, 48, 51, 55, 59, 63, 68, 74, 80, 86, 91, 96, 100],
    why: 'Two separate processes — the voucher from the district and the place from the nursery — run on different clocks, and parents discover the deadline late. Two systems and one panicking audience is a guide, not a blog post.',
    sources: ['Google Trends Berlin', 'r/berlin', 'Berlin Jugendamt guidance'],
    play: {
      kind: 'local',
      headline: 'One timeline that covers the voucher and the place together',
      audience: 'Berlin parents nine to twelve months away from needing childcare',
      steps: [
        {
          title: 'Draw the two tracks on one calendar',
          detail:
            'Voucher application on one line, nursery waiting lists on the other, counted backwards from the start date. Nobody publishes them together.',
        },
        {
          title: 'Write the enquiry message',
          detail:
            'A short German message parents can send to twenty nurseries at once, with the fields to fill in marked. This is the asset that gets shared.',
        },
        {
          title: 'Map the districts honestly',
          detail:
            'Which districts process quickly and which do not, with dates from real parents. Specificity is what makes this outrank the official page.',
        },
        {
          title: 'Monetise with listings and a tracker',
          detail:
            'Nurseries with open places will pay to be found. A paid deadline tracker suits parents who are twelve months out.',
        },
      ],
      angles: [
        'The Berlin childcare timeline, counted backwards from your start date',
        'The message to send twenty nurseries, in German, ready to paste',
        'Which districts actually process a voucher quickly',
      ],
      monetization: {
        model: 'Sponsored listings plus a paid deadline tracker',
        estimate: '€500 to €2,500 per month',
        note: 'Long window and a calm audience — this is a compounding page rather than a spike, and it renews with every new intake year.',
      },
      firstPost:
        'Kita-Gutschein und Kita-Platz sind zwei getrennte Prozesse mit zwei verschiedenen Fristen, und das merken die meisten zu spät. Ich habe beide auf einen Zeitplan gelegt, rückwärts gerechnet vom Betreuungsbeginn, mit der Anfrage-Nachricht zum Kopieren.',
      keywords: [
        'kita gutschein berlin antrag online',
        'kita platz berlin warteliste',
        'kita gutschein bearbeitungszeit bezirk',
        'kita anfrage vorlage berlin',
      ],
    },
  },
  {
    id: 'sig-wohnung-mappe',
    keyword: 'bewerbungsmappe wohnung berlin vorlage',
    niche: 'home',
    momentum: 231,
    volume: 16800,
    competition: 'low',
    region: 'Berlin',
    detectedAt: hoursAgo(14),
    peakInDays: 26,
    series: [31, 33, 37, 40, 46, 52, 58, 65, 72, 79, 86, 92, 97, 100],
    why: 'Viewings here now run dozens of applicants deep, so the search has moved from finding a flat to winning the one you already saw. Competitive desperation with a deadline converts better than curiosity.',
    sources: ['Google Trends Berlin', 'r/berlin', 'Google results thinness'],
    play: {
      kind: 'product',
      headline: 'Sell the folder that wins the viewing',
      audience:
        'People who just stood in a Berlin viewing queue with forty other applicants and want to be the one who gets called',
      steps: [
        {
          title: 'Assemble the complete folder',
          detail:
            'Cover sheet, SCHUFA, three payslips, employer letter, previous landlord confirmation, ID. Say what each one must show, not just that it is needed.',
        },
        {
          title: 'Give it a one-page cover sheet',
          detail:
            'A single page an agent can read in ten seconds is what actually separates applicants. Design it and give it away as a template.',
        },
        {
          title: 'Translate for the international applicant',
          detail:
            'Most competing pages assume a German employment history. Cover freelancers and new arrivals, in English, and you own a segment nobody addresses.',
        },
        {
          title: 'Monetise the pack, refer the credit check',
          detail:
            'Paid editable template bundle plus a credit report affiliate — a document everyone in this queue has to buy anyway.',
        },
      ],
      angles: [
        'The one-page cover sheet that gets you called back',
        'The Berlin flat application folder, complete, in German and English',
        'Applying as a freelancer: what to send instead of payslips',
      ],
      monetization: {
        model: 'Template pack plus credit report affiliate',
        estimate: '€700 to €3,500 per month',
        note: 'Buyers are mid-panic and price-insensitive. Keep the free version genuinely complete or the paid pack looks like a hostage fee.',
      },
      firstPost:
        'Bei der letzten Besichtigung standen vierzig Leute in der Schlange. Entschieden hat am Ende nicht das Einkommen, sondern die Mappe. Hier ist die komplette Liste, was hineingehört, plus das einseitige Deckblatt, das die Maklerin in zehn Sekunden lesen kann — auch als englische Version für Freiberufler.',
      keywords: [
        'bewerbungsmappe wohnung berlin vorlage',
        'mieterselbstauskunft vorlage',
        'schufa auskunft wohnung berlin',
        'wohnungsbewerbung freiberufler unterlagen',
      ],
    },
  },
  {
    id: 'sig-freelancer-steuer',
    keyword: 'freiberufler steuererklärung berlin elster',
    niche: 'finance',
    momentum: 208,
    volume: 24900,
    competition: 'medium',
    region: 'Berlin',
    detectedAt: hoursAgo(9),
    peakInDays: 15,
    series: [33, 35, 38, 43, 49, 56, 62, 70, 77, 84, 90, 95, 98, 100],
    why: 'Deadline-driven, and this city holds an unusually large population of freelancers who work entirely in English but must file entirely in German. A language gap plus a hard date is a reliable payer.',
    sources: ['Google Trends Berlin', 'r/berlin', 'r/germany'],
    play: {
      kind: 'content',
      headline: 'File it once on camera, in English, with the German fields on screen',
      audience:
        'English-speaking freelancers registered in Berlin facing their first or second tax return',
      steps: [
        {
          title: 'Record one complete filing',
          detail:
            'Screen recording of the real portal, every field, with the German label and the English explanation side by side. Nobody has shipped this well.',
        },
        {
          title: 'Handle the two questions everyone asks',
          detail:
            'Which expenses actually count, and what happens with VAT under the small-business rule. These two carry most of the search volume.',
        },
        {
          title: 'Publish a deadline and penalty page',
          detail:
            'Dates, extensions, and what late actually costs. Short, factual, and it ranks for a term people search in a hurry.',
        },
        {
          title: 'Monetise with tool affiliate plus a checklist',
          detail:
            'Filing tools pay well and recur annually. A paid expense-category checklist for freelancers converts alongside it.',
        },
      ],
      angles: [
        'Filing a German tax return in English: every field, on screen',
        'What a Berlin freelancer can actually deduct, with the German terms',
        'Deadlines, extensions and what being late really costs',
      ],
      monetization: {
        model: 'Filing tool affiliate plus a paid checklist',
        estimate: '€900 to €4,500 per month',
        note: 'Annual and repeatable, but the window is genuinely narrow — after the deadline the traffic goes to almost nothing until next spring.',
      },
      firstPost:
        'I filed my German tax return as a freelancer in Berlin and recorded the whole thing. Every field, with the German label and what it actually means in English, plus the two questions everyone gets stuck on: which expenses count, and what the small-business VAT rule does to your invoices.',
      keywords: [
        'freiberufler steuererklärung berlin elster',
        'freelancer tax return germany english',
        'kleinunternehmerregelung umsatzsteuer freelancer',
        'betriebsausgaben freiberufler liste',
      ],
    },
  },
  {
    id: 'sig-padel-berlin',
    keyword: 'padel platz berlin buchen',
    niche: 'fitness',
    momentum: 364,
    volume: 12700,
    competition: 'low',
    region: 'Berlin',
    detectedAt: hoursAgo(4),
    peakInDays: 11,
    series: [14, 16, 19, 24, 30, 37, 45, 54, 63, 73, 82, 90, 96, 100],
    why: 'Courts opened faster than anyone built booking software for them, and every operator runs a different system. Fragmented supply against a vertical demand curve is a directory, not an article.',
    sources: ['Google Trends Berlin', 'r/berlin', 'Instagram location tags'],
    play: {
      kind: 'product',
      headline: 'Be the one page that shows every court and who has space tonight',
      audience:
        'Berliners who want to play this week and are currently checking six separate sites',
      steps: [
        {
          title: 'List every court with the real detail',
          detail:
            'Location, indoor or outdoor, price per hour, whether racket rental exists, and which app it books through. Twenty minutes per venue, once.',
        },
        {
          title: 'Add tonight availability',
          detail:
            'Even a manually refreshed "who has space this evening" beats every operator site, because none of them know about each other.',
        },
        {
          title: 'Solve the fourth player',
          detail:
            'The real blocker is not the court, it is finding four people. A simple match board is the reason people come back weekly.',
        },
        {
          title: 'Monetise listings and referrals',
          detail:
            'Operators pay to be listed once you send bookings. Racket and shoe affiliate covers the rest.',
        },
      ],
      angles: [
        'Every padel court in Berlin, with prices, on one page',
        'Who has a free court tonight',
        'Need a fourth? The Berlin padel match board',
      ],
      monetization: {
        model: 'Operator listings plus booking referral',
        estimate: '€400 to €2,200 per month',
        note: 'Short window: as operators consolidate onto one booking platform, the aggregation gap closes. Move now or not at all.',
      },
      firstPost:
        'Six different websites, four different booking apps, and none of them tell you where there is a free court tonight. So I listed every padel court in Berlin on one page — price, indoor or outdoor, rackets or not — and added a board for finding a fourth player.',
      keywords: [
        'padel platz berlin buchen',
        'padel berlin preise vergleich',
        'padel mitspieler berlin finden',
        'padel halle berlin indoor',
      ],
    },
  },
  {
    id: 'sig-berlin-builder-nights',
    keyword: 'ai hackathon berlin anmelden',
    niche: 'ai-tools',
    momentum: 402,
    volume: 8900,
    competition: 'low',
    region: 'Berlin',
    detectedAt: hoursAgo(3),
    peakInDays: 7,
    series: [10, 12, 15, 19, 25, 32, 41, 50, 61, 72, 82, 90, 96, 100],
    why: 'Every demo night and hackathon in this city produces a burst of people looking for the next one, and no single calendar covers them. Recurring attention at nearly zero content cost, and the audience is the most valuable one there is: people who ship.',
    sources: ['Google Trends Berlin', 'r/berlin', 'Hacker News', 'Product Hunt'],
    play: {
      kind: 'content',
      headline: 'Own the calendar nobody maintains',
      audience:
        'Builders, founders and engineers in Berlin who keep hearing about events after they happened',
      steps: [
        {
          title: 'Start with one honest weekly list',
          detail:
            'Every AI and builder event in the city, dated, with whether it is worth going. An opinion is what makes a listing page readable.',
        },
        {
          title: 'Publish the day after, not the week before',
          detail:
            'Short write-ups of what actually got demoed. That is the content organisers link to, which is how the calendar becomes the default.',
        },
        {
          title: 'Turn it into one email',
          detail:
            'A Thursday email is the whole product. The website is just the archive that makes people subscribe.',
        },
        {
          title: 'Monetise sponsorship, then hiring',
          detail:
            'Tooling companies pay to reach this list. A jobs section works once it passes a few thousand subscribers, not before.',
        },
      ],
      angles: [
        'Every AI event in Berlin this week, and which one to actually attend',
        'What got demoed last night',
        'The Berlin builder calendar nobody was maintaining',
      ],
      monetization: {
        model: 'Newsletter sponsorship plus a paid job board',
        estimate: '€300 to €2,000 per month',
        note: 'Slow to monetise and it lives or dies on you showing up weekly. The upside is the audience quality, not the size.',
      },
      firstPost:
        'I kept hearing about Berlin AI events the day after they happened, so I started a list. Everything on this week, dated, with a note on whether it is worth your evening — and a write-up of what actually got demoed the night before.',
      keywords: [
        'ai hackathon berlin anmelden',
        'ai meetup berlin diese woche',
        'berlin tech events kalender',
        'berlin startup demo night',
      ],
    },
  },
  {
    id: 'sig-berghain-guide',
    keyword: 'berghain einlass tipps',
    niche: 'travel',
    momentum: 142,
    volume: 58600,
    competition: 'high',
    region: 'Berlin',
    detectedAt: hoursAgo(26),
    peakInDays: 44,
    series: [58, 60, 63, 65, 69, 73, 77, 81, 85, 89, 93, 96, 98, 100],
    portable: false,
    why: 'Permanent volume with a summer lift, and the single most-searched Berlin question by visitors. It is here as a counter-example: enormous interest with no gap left in it, which is why the ranking pushes it down rather than up.',
    sources: ['Google Trends Berlin', 'r/berlin', 'YouTube search suggest'],
    play: {
      kind: 'affiliate',
      headline: 'The honest version of a topic everyone has already written badly',
      audience: 'Visitors planning a first Berlin weekend who have read four contradictory guides',
      steps: [
        {
          title: 'Lead with what is not true',
          detail:
            'Most of this genre is invented. A page that names the myths and says plainly that there is no dress code formula is differentiated by honesty alone.',
        },
        {
          title: 'Go wide, not deep',
          detail:
            'One club cannot carry a business. Cover the whole night — where to go first, what closes when, how to get home — and the door question becomes the entry point.',
        },
        {
          title: 'Be useful at 2am',
          detail:
            'Transport, cash, cloakroom, phone camera rules. Practical detail is what earns the return visit and the share.',
        },
        {
          title: 'Monetise indirectly',
          detail:
            'City pass and accommodation affiliate, plus a paid weekend itinerary. There is no product to sell at the door itself.',
        },
      ],
      angles: [
        'No, there is no dress code formula',
        'A Berlin night that does not depend on getting into one club',
        'The 2am practicalities nobody writes about',
      ],
      monetization: {
        model: 'City guide affiliate plus a paid itinerary',
        estimate: '€200 to €1,500 per month',
        note: 'Crowded and getting worse. Included deliberately: high volume with no opening is not a play, and the feed should show you that rather than hide it.',
      },
      firstPost:
        'Almost everything written about getting into Berlin clubs is invented, including the dress code rules. Here is what is actually true, what nobody tells you about 2am transport and cash, and a night plan that does not fall apart if one door says no.',
      keywords: [
        'berghain einlass tipps',
        'berlin club guide first time',
        'berlin nightlife weekend plan',
        'berlin clubs no dress code myth',
      ],
    },
  },
];

export function getSignalById(id: string): Signal | undefined {
  return SIGNALS.find((signal) => signal.id === id);
}
