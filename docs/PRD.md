# TrendSpark — Product Requirements Document

**Version:** 1.1 (hackathon build — open access, pay-after)
**Status:** Implemented, front-end complete, data seeded, contributions simulated
**Platform:** iOS / Android / Web (Expo, React Native, Expo Router)
**Audience for this doc:** hackathon judges, reviewers of this repository, future contributors

---

## 1. Summary

TrendSpark turns rising search demand into a same-day money play for one person working alone.

Every morning the app delivers a 60-second spoken briefing over the three hottest signals in the
niches the user tracks. Below the briefing sits a ranked radar feed of rising keywords, a dated
watchlist for keywords worth waiting on, and a history view of every signal the radar has flagged
with the date it broke out.

**Nothing in the app is locked.** Every signal, playbook, timeline and briefing is open on every
account from first launch. Payment happens afterwards, at an amount the user chooses, including zero.

Two payment models, deliberately separated:

- **People** decide what it was worth after the fact, on a fixed ladder of store price points.
- **Machines** hit an x402-priced HTTP API and pay per request in stablecoin, because software cannot
  make a fairness judgement and does not need the goodwill.

---

## 2. Problem

Trend data exists and is cheap. Acting on it is not.

1. **Insight is not a deliverable.** Exploding Topics, Google Trends and Bombora sell a number.
   A solo creator sees "+412%" and still does not know what to publish, build or sell today.
2. **Windows close.** A breakout keyword is worth acting on for days, not months. Monthly SaaS
   dashboards do not create urgency and are not checked daily.
3. **Existing tooling is priced for agencies.** Exploding Topics API is an add-on to a $249/mo plan,
   with request packages from $1,000/mo, and it explicitly cannot serve geo/keyword lookups. Bombora
   is enterprise-contract priced. There is no consumer-priced product in this category.
4. **The unit of value is small and unpredictable.** One actionable playbook is worth roughly €1 to an
   indie hacker — and sometimes nothing at all, because the signal did not convert. Card networks make
   a €1 charge uneconomic, so nobody sells at that unit; they force a subscription and churn
   accordingly. Charging in advance for something whose value is only knowable afterwards is the
   mismatch this build attacks.

## 3. Target user

| Segment                                  | Trigger                                                      | What they want                                         |
| ---------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| Solo creator / faceless-channel operator | Needs a topic that will still be rising when the video ships | A content angle plus a script hook, today              |
| Indie hacker / micro-SaaS builder        | Watching for an unserved integration or tool gap             | A validated demand number and a scoped v1              |
| Side-hustler / reseller                  | Wants a product or local service with rising intent          | A sourcing/positioning play with an honest margin note |

Explicitly **not** the target: SEO agencies, in-house marketing teams, enterprise intent-data buyers.
That was the earlier B2B framing and it was dropped; it changes the pricing rail and the copy.

## 4. Goals and non-goals

**Goals**

- G1 — A user can hear what changed in their market in under 60 seconds, hands-free.
- G2 — A user can go from "this is rising" to "here is my first post" in under two minutes.
- G3 — Let the user set the price after they know what it was worth, while staying store-compliant.
- G4 — Make the machine-readable lane a first-class product surface, not a footnote.
- G5 — Let a user verify a signal in a primary source without leaving the flow, and browse what the
  radar flagged weeks or months ago.

**Non-goals (this version)**

- No account system, no server, no sync. All state is on-device.
- No real payment processing. Store purchases are simulated locally.
- No publishing integrations (no posting to YouTube/X/TikTok on the user's behalf).
- No dark mode toggle — the app is dark-locked by design.
- No live trend ingestion. The feed is a 20-signal seeded dataset (see §9).

## 5. Success metrics

| Metric                  | Definition                                                | Target         |
| ----------------------- | --------------------------------------------------------- | -------------- |
| Briefing D1 retention   | Users who play a briefing on two consecutive days         | > 35%          |
| Playbook read rate      | Sessions containing ≥ 1 playbook read                     | > 45%          |
| Helped rate             | Playbooks rated "It helped" / playbooks rated at all      | > 50%          |
| Contribution rate       | Users who pay any non-zero amount within 14 days          | > 4%           |
| Average contribution    | Total contributed / contributing users                    | > €4.00        |
| Revenue per active user | Total contributed / monthly active users                  | > €0.20        |
| Cost coverage           | Total contributed / (run cost + feed cost) for the period | > 1.0          |
| Time to first playbook  | Onboarding complete → first playbook read                 | < 2 min median |

Contribution rate and average contribution are the two numbers that decide whether this model works.
The literature is not encouraging for anonymous digital pay-what-you-want — a controlled field study
found the same product averaging **$0.92** under plain PWYW versus **$5.33** when half the payment went
to charity — so the honest planning assumption is single-digit conversion, and cost coverage is the
metric that actually matters at this scale.

## 6. Product principles

1. **Nothing is locked.** Not the signal, not the playbook, not the briefing. The product has to be
   fully useful before it can ask for anything, because the value is only knowable after use.
2. **Urgency is a feature.** Every signal carries a decay window and a projected decay bar.
3. **No hype.** Copy is flat and specific. The generation prompt bans emoji, exclamation marks and
   encouragement, and asks for honest limitations.
4. **Never fail on stage.** Every network dependency has a working offline path.
5. **The cost is visible.** The Support tab prints what the user's activity actually cost to serve and
   what the shared feed costs per month. Asking for money without showing the bill is a worse ask.
6. **Ask only after value, never before it.** The contribution prompt appears after a run of value
   moments or straight after a user says a playbook helped — the one point where pay-what-you-want
   performs — and at most once a day.

---

## 7. Scope — implemented features

### 7.1 Onboarding — `app/onboarding.tsx`

Single screen, fade transition. Ten niches (`AI & tools`, `Creator economy`, `Fitness`, `Money`,
`Gaming`, `Home & energy`, `Pets`, `Food`, `Travel`, `Wellness`), multi-select, skippable.

- CTA reads "Show me everything" with nothing selected, "Track N areas" otherwise.
- Footer states the access model: everything open from first launch, no card, no trial, no locked tab.
- On confirm: `usePrefsStore.completeOnboarding(niches)` → `/(tabs)`.

**Acceptance:** selecting zero niches must not produce an empty feed — `scopeSignals` falls back to
the full set.

### 7.2 Radar (home) — `app/(tabs)/index.tsx`

- Header: wordmark + `SupportPill` — reads "Open access" until the user has given something, then the
  running total. Tapping it routes to `/contribute`.
- `BriefingHero`: today's top three signals, script preview, duration, play button → `/briefing`.
- A contribution prompt appears inline under the hero when `shouldAsk()` is true (five value moments
  since the last ask, and not asked in the last 24 hours). It is dismissible and never blocks content.
- Filter tabs: **Hottest** (default, by `heatScore`), **Low competition**, **Closing soon**.
- Virtualized feed (`@shopify/flash-list`) of `SignalCard`: keyword, sparkline, momentum badge,
  competition, region, window label, derived theme tags, a free **Track** toggle, and a **Playbook**
  button that opens straight onto the playbook tab.
- Empty state when a filter yields nothing.

**Ranking:** `heatScore(momentum, competition) = momentum × penalty`, penalty `low = 1`,
`medium = 0.72`, `high = 0.45`. High momentum in an uncrowded niche ranks top.

### 7.3 Daily briefing — `app/briefing.tsx`, `lib/briefing.ts`, `hooks/useBriefingPlayer.tsx`

`buildBriefing()` composes a script from the top three signals: time-of-day greeting, one line per
signal (`"First. {keyword}, in {niche}. Up {momentum}% on {volume} searches/mo, {region}.
{competition}, window closes in {n}d. {why}"`), then a closing "if you only act on one" line.
Duration is estimated at 355 ms/word plus 260 ms per pause.

- Waveform animates during playback; progress bar in `m:ss`.
- Transcript lines are tappable and seek; the active line is highlighted.
- A jump button routes to the signal being read.
- Voice is user-selectable: **Analyst**, **Anchor**, **Coach** (mapped to three ElevenLabs voice IDs).
- Unlimited replays, no daily cap. The footer prints the real per-play cost of speech synthesis
  (`RUN_COST_CENTS.briefing`), and once a briefing finishes it offers — not requires — a contribution.

**Degradation:** with no ElevenLabs key the player runs the same script on a synthetic timeline and
the app labels itself "Transcript mode". Every control still works.

### 7.4 Signal detail — `app/signal/[id].tsx`

Three tabs, none of them gated. Opening the screen records the first read via `useSignalStore.open()`,
which is what the Support tab counts.

- **Signal** — interest timeline with a 14 / 30 / 90-day range switch (defaulting to 90 when the
  breakout is older than 24 days), a **First flagged** panel giving the breakout date, the interest
  index then and now and the change since, searches/mo, competition, window in days, "Why now",
  projected-decay bar, and a **Check it yourself** block. When the keyword is tracked, a panel shows
  days tracked, change since tracking began, peak while watching, window left, and a verdict.
- **Playbook** — play kind badge (content / product / affiliate / local), headline, target audience,
  four ordered steps with detail, three angles, monetization model + estimate + honest note. A
  **Regenerate** button appears only when an OpenAI key is present.
- **First move** — ready-to-post copy with a native share / copy action.

Derived theme tags sit under the title; tapping one opens the History tab filtered to that tag.

The header carries a **Track** toggle. The bottom bar carries the only ask on the screen: _"Did this
playbook actually help?"_ with **Not really** and **It helped**. "It helped" routes to `/contribute`;
"Not really" is recorded so a signal people find useless can stop being pushed to the top of the radar.

**Check it yourself — `components/SourceLinks.tsx`, `lib/explore.ts`.** Five deep links per signal
(Google Trends for the region, Google results, Reddit newest-first, YouTube, App Store search) plus the
cited sources themselves, mapped back to a live search where a URL can be constructed — subreddits,
Trends, Hacker News, GitHub, Product Hunt, Pinterest, Amazon, Etsy, Steam, X, Upwork. Links open in the
device browser via `Linking.openURL`; nothing is embedded in a web view. The block states plainly that
interest indexes are rescaled per request, so the number the user sees will not match ours exactly.

### 7.5 My plays — `app/(tabs)/plays.tsx`

Toggle between **Read** (playbooks already opened, count) and **Watching** (tracked keywords, count),
each with an empty state routing back to Radar.

Watching is the observation loop: tracking records the moment it started (`WatchEntry.startedAt`), so
each row can answer "has this kept climbing since I first saw it?" A row shows change since tracking
began, an `accelerating` / `holding` / `cooling` status, days left in the window, a 30-day timeline
with a dashed marker at the point tracking started, and a verdict sentence. This exists so a user can
wait out a spike instead of acting on the first thing that moves — which is the honest answer to
"expressed interest is not willingness to pay".

Pre-rise history is generated deterministically from the signal id in `lib/watch.ts`
(`buildHistory`), because the seeded feed only carries 14 points. When the live pipeline in §9.3 lands,
`buildHistory` is the single function that gets replaced by stored daily observations.

### 7.6 History — `app/(tabs)/history.tsx`, `lib/archive.ts`, `lib/tags.ts`

Answers "what trended two weeks ago, or three months ago, and how did it age?"

Every signal carries a breakout date. `lib/data/history.ts` seeds one number per signal —
`FLAGGED_DAYS_AGO`, spread from 5 to 84 days — and everything else is computed from that signal's own
curve: the index at breakout, the index now, the change since, and a stage of `Just broke out` /
`Running a while` / `Long climb`. That one map is the whole migration surface for real observations.

- **Period filters:** All time · This week · 1–3 weeks ago · 3–6 weeks ago · 2–3 months ago.
- **Tag filters:** derived, multi-select, OR-combined. Tapping a tag on a card or on a signal detail
  filters the list.
- **Cards** show the breakout label, interest then → now, the change since flagged, a timeline with a
  dashed marker at the breakout day, the tag row, and volume + window.
- A headline states how many of the filtered signals are still well above where they were flagged.

**Stated limitation, in the UI.** The header notes that this view has survivorship bias by
construction — decayed signals leave the live feed, so what remains looks better than the true hit
rate — and that curves before the tracked window are reconstructed. Overclaiming a hit rate here is
the fastest way to lose a technical reviewer.

**Tags — `lib/tags.ts`.** Tags are derived, not authored, so a new signal is taggable the moment it
enters the feed. Twelve regex theme rules run over keyword + reason + headline + target keywords
(`AI`, `Audio`, `Video`, `Gear`, `Supplements`, `Sleep`, `Rules & admin`, `DIY`, `Money`, `Comparison`,
`Energy`, `Seasonal`), plus structural tags for non-global region, `Open field` (low competition),
`Short window` (≤ 10 days) and the play kind. Capped at six per signal, cached by signal id.

### 7.7 Support — `app/(tabs)/support.tsx`

The money screen, and it opens with what the user got rather than what they owe.

- Total contributed, and what share of their own serving cost that covers. Zero is stated as a
  legitimate answer, not a nag.
- **What you have used:** playbooks read, briefings played, keywords tracked.
- **What that cost:** their all-time run cost, and the shared feed cost per month, with the reason the
  two are different — the feed costs the same whatever the user count, so a small number of people
  paying covers everyone, and only speech synthesis has a real per-use cost.
- **Keep it running:** three recurring amounts (€1.99 / €4.99 / €9.99) that unlock nothing at all. The
  copy says so explicitly. Tapping an active tier stops it.
- Link to the machine-access lane, and the contribution history.

### 7.8 Contribute — `app/contribute.tsx`

The amount picker, reached from the pill, the prompt, the Support tab, the end of a briefing, or "It
helped" on a playbook.

- A usage recap and the run cost, so the ask is anchored on something real.
- **Pick an amount** — `AmountDial` steps along the ladder with −/+ controls, a fill bar and four
  presets. The caption shows roughly what reaches the developer after store fees.
- **Share of an outcome** — the user picks what the app made them (€0 to €5,000, self-reported) and
  what fraction to pass back (1 / 2 / 3 / 5 / 10%). The product is snapped to the nearest available
  price point. An info panel states that TrendSpark cannot see the user's revenue and never asks for
  access to it, so this is a fairness dial and not a commission.
- The zero rung is real: the primary button reads **Not this time** and simply closes.
- A **Why the amounts are fixed** panel explains the store constraint rather than hiding it.

### 7.9 You — `app/(tabs)/you.tsx`

Playbooks read and total contributed, niche tracking editor, voice picker, briefing hour
(6/7/8/9/12/18), breakout-alert switch, live status of the two external services (Connected vs
Transcript mode / Written playbooks), and a demo reset that clears all three stores and returns to
onboarding.

### 7.10 Machine access (x402 lane) — `app/agent.tsx`

Read-only spec surface, reachable from the Support tab.

| Endpoint                         | Price  | Returns                             |
| -------------------------------- | ------ | ----------------------------------- |
| `GET /v1/signals?niche=ai-tools` | $0.002 | Ranked list, metadata only          |
| `GET /v1/signals/{id}`           | $0.01  | Full signal with series and sources |
| `GET /v1/signals/{id}/playbook`  | $0.05  | Generated playbook                  |

Documented flow: unauthenticated request → `402 Payment Required` carrying price and payment address
→ agent pays in stablecoin → retry with payment header → data returned. No account, no card, no
invoice. The screen also states why this is _not_ the consumer checkout (see §8).

---

## 8. Monetization

### 8.1 The model

Nothing is gated. Payment is a judgement the user makes after using the product, at an amount they
choose from a fixed ladder, and zero is a supported answer.

| Item                  | Amounts                                                                   | What it changes |
| --------------------- | ------------------------------------------------------------------------- | --------------- |
| Everything in the app | €0                                                                        | —               |
| One-off contribution  | €0.99 · €1.99 · €2.99 · €4.99 · €7.99 · €11.99 · €19.99 · €29.99 · €49.99 | Nothing         |
| Share of an outcome   | 1–10% of a self-reported result, snapped to the nearest rung              | Nothing         |
| Keep it running       | €1.99 · €4.99 · €9.99 per month                                           | Nothing         |

That last column is the point. No tier buys earlier signals, more playbooks, extra briefings or a
bigger allowance, because the moment it does the app has a paywall again and the ask stops being a
judgement.

### 8.2 Why pay-what-you-want is a ladder and not a text box

A free-text amount cannot exist inside an app.

- **Apple** sells from a fixed set of price points — 900 of them, $0.29 to $10,000, 800 available by
  default — chosen per product in App Store Connect. There is no API for a user-entered amount, so
  every rung above is a separate consumable product.
- **Google Play** requires declared prices for digital goods. Its peer-to-peer tip carve-out does not
  apply here: that exemption requires 100% of the payment to reach a creator and to unlock nothing, and
  a developer contribution inside a commercial app is not that.
- **Both** take 15–30% of anything paid in-app. The app shows the user roughly what actually arrives.

A true amount field needs web checkout, and the routes are uneven: the US storefront has allowed
external purchase links without an entitlement since May 2025 with the commission currently at zero but
under appeal; the EU requires the External Purchase Link entitlement with Core Technology fees of
roughly 12–20% plus mandatory reporting; other storefronts prohibit the link entirely. Not worth the
friction at this stage, so the ladder stays in-app.

### 8.3 Why not revenue share

Rejected on measurement, not on principle.

1. **Causation is unprovable.** Read-only revenue access exists (Stripe Connect, Gumroad OAuth), but
   seeing €4,000 in a user's account does not show that a keyword card caused it. Someone who read six
   playbooks and did the work themselves would be billed for correlation, and they can see that.
2. **Self-reporting collapses when reporting costs money.** Ask "did this earn?" with an invoice
   attached and the answer becomes no.
3. **The cash cycle inverts.** The data bill is monthly and fixed; a share of outcomes arrives quarters
   later, so the operator finances the entire feed. A percentage of a user's external business revenue
   is also not an IAP product, so it would have to be invoiced outside the app.
4. **It is a worse promise.** "You keep 100% — we charge for the signal, not your success" beats "we
   take a cut of what you build" for an audience of one-person businesses.

The share-of-outcome mode in `app/contribute.tsx` is the honest remainder of the idea: the fraction is
an input the user controls, the outcome is whatever they say it is, and the app never claims to have
witnessed it.

### 8.4 Why the economics can survive this

Feed cost is fixed and shared, not per-user. The nightly pass in §9.3 costs under $30/month for the
whole keyword grid regardless of user count. The only real marginal cost is speech synthesis, billed per
character — `RUN_COST_CENTS` puts a briefing at about €0.08 and a playbook at a tenth of a cent.

So the break-even condition is not "most users pay", it is "a few users cover a fixed bill". The Support
tab states both numbers to the user, which is also the strongest argument the app can make for paying.

The honest counterweight: PWYW performs badly in exactly this setting. The field evidence is anonymous
digital buyers averaging near zero without a social or fairness cue, and Panera's pay-what-you-want
cafés closed. Plan for single-digit conversion. If it fails, the fallback is not a paywall on signals —
it is metering the one thing with a real per-use cost (voice) and keeping text open.

### 8.5 Why x402 stays on the machine side

App Store Review Guideline 3.1.1 and Google Play billing policy require IAP for in-app digital goods,
so a stablecoin checkout for unlocking content is a rejection — and with nothing locked there is no
per-use charge to collect from a person anyway. Agents are the opposite case: no fairness judgement to
make, no goodwill to earn, and no card-fee floor, so €0.002 per request is possible. Worth noting that
x402 volume has moved _away_ from the consumer micropayment regime — sub-$1 transactions fell from 46%
to 4% of volume — which reinforces keeping it as an API lane rather than a checkout.

### 8.6 Implementation note

Bilt-managed payments are not enabled on this project, so `useSupportStore.contribute()` and
`setMonthly()` mutate local persisted state and append to the contribution list. Swapping in real IAP
touches only those two actions, and each ladder rung maps to one consumable product id.

---

## 9. Data

### 9.1 Current state — seeded

`lib/data/signals.ts` holds 20 hand-authored signals with full playbooks, spanning all ten niches and
three regions (Global, Europe, Germany), momentum 139–920%. This is the offline fallback and the
demo dataset; it guarantees the app works with no network and no keys.

### 9.2 Signal schema — `lib/types.ts`

```ts
Signal {
  id, keyword, niche: NicheId,
  momentum: number,           // % rise over the tracked window
  volume: number,             // estimated monthly searches
  competition: 'low' | 'medium' | 'high',
  region, detectedAt: ISO, peakInDays: number,
  series: number[],           // 14 normalised interest points, oldest first
  why: string, sources: string[],
  play: Playbook              // kind, headline, audience, steps[], angles[],
                              // monetization, firstPost, keywords[]
}
```

### 9.3 Planned live pipeline (researched, not built)

Two independent signals are required, because neither is sufficient alone:

- **Level → Google Ads Keyword Planner.** Absolute average monthly searches per `keyword × geo`,
  12 months of history, ~100k geo targets down to city and postal code. Data is free with an approved
  developer token; approval is not same-day.
- **Momentum → Google Trends.** The _shape_ of the 0–100 curve over 90 days.

`score = momentum × log(local volume)`, gated on a volume floor. That is the Radar ranking.

Interim source while the Ads token clears: **DataForSEO** — Google Ads endpoint $0.06/queued task
(1,000 keywords per task), Google Trends endpoint $0.0027/queued task (5 keywords per task), $50
minimum top-up.

**Cost model.** Query on a schedule, never per user. A nightly pass over 2,000 keywords × 20 cities
is ~40 Ads tasks (~$2.40) plus ~8,000 Trends tasks (~$22) — **under $30/month for the whole feed,
serving unlimited users.** Cost scales with the keyword × geo grid, not with user count. That is what
makes a €2.99 pack viable.

**Known traps.**

1. Google Trends rescales 0–100 _per request_; Berlin's 100 ≠ Munich's 100. Cross-geo comparison
   requires an absolute anchor, which is why Keyword Planner is mandatory in the pair.
2. City-level long-tail keywords fall below Google's reporting floor and return bucketed ranges. The
   smallest reliable unit is metro/region, not neighbourhood.
3. **Exploding Topics is not a candidate.** $249/mo plan plus $1,000+/mo API packages, commercial
   embedding needs custom pricing, and their own FAQ states the API cannot serve custom keyword or
   geo lookups — i.e. it cannot deliver local interest at all.

Requires a backend for the scheduler and cache; the seeded dataset stays as the fallback.

### 9.4 Source access and cost, per candidate

Researched access terms for the five source categories a demand engine could draw on. "Free" is only
meaningful together with the eligibility column — three of the five are gated by something other than
money.

| Source                                        | Cost                                                                                                                  | Real constraint                                                                                                                                             |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Google Ads API (Keyword Planner)**          | Data free                                                                                                             | Needs an active Ads account + approved developer token; approval is not same-day                                                                            |
| **Google Trends** (unofficial)                | Free                                                                                                                  | Rate-limited, breaks; 0–100 index rescaled per request                                                                                                      |
| **Google Trends API** (official, alpha)       | Not announced                                                                                                         | Application-gated alpha; consistently scaled data is the reason to want it                                                                                  |
| **DataForSEO**                                | $0.06/task Ads, $0.0027/task Trends, $50 min top-up                                                                   | None — this is the interim rail                                                                                                                             |
| **Reddit Data API**                           | Free ≤100 QPM (OAuth) for non-commercial                                                                              | **Commercial use needs approval and is billed $0.24 per 1,000 calls** — TrendSpark is commercial                                                            |
| **X API**                                     | Pay-per-use, $0.005 per post read, capped 2M reads/mo                                                                 | No free tier since Feb 2026; legacy Basic $200/mo and Pro $5,000/mo closed to new signups. Read-heavy trend scanning gets expensive fast                    |
| **TikTok Research API**                       | No fee published                                                                                                      | **Ineligible.** Academic and EU non-profit researchers only; creators, advertisers and commercial users are explicitly excluded                             |
| **Amazon Product Advertising / Creators API** | Free                                                                                                                  | **Chicken-and-egg.** Requires ~10 qualifying Associates sales in a trailing 30 days to keep access; PA-API 5 is being retired in favour of the Creators API |
| **Google Shopping (Content API)**             | Free                                                                                                                  | Merchant-scoped, no public product search, and shuts down 18 Aug 2026 in favour of the Merchant API                                                         |
| **OpenAI / Perplexity citation audits**       | Perplexity Search API $5 per 1,000 requests; Sonar $1/$1 per 1M tokens plus $5–$12 per 1,000 requests by context size | Metered but cheap at scheduled volume; measures citation _presence_, not prompt volume                                                                      |

**Conclusion for v1.** Build on Keyword Planner + Trends via DataForSEO, and add LLM citation audits as
the second axis. Reddit stays a manual research input rather than a product dependency until a
commercial agreement is in place. TikTok and Amazon are out on eligibility, not price.

---

## 10. Architecture

```
Expo Router app  (dark-locked, on-device state)
├── app/(tabs)          Radar · My plays · History · Support · You
├── app/signal/[id]     Signal / Playbook / First move (nothing gated)
├── app/briefing        modal player
├── app/contribute      modal, amount ladder + share-of-outcome
├── app/agent           modal, x402 spec
└── app/onboarding
lib/
├── data/signals.ts     20 seeded signals (offline fallback)
├── data/history.ts     FLAGGED_DAYS_AGO — the one seeded breakout date per signal
├── data/catalog.ts     niches, contribution ladder, monthly tiers, run costs, feed cost
├── feed.ts             scopeSignals · rankByHeat · topSignals
├── archive.ts          buildArchive · periodOf · flaggedLabel · stillClimbingCount
├── tags.ts             tagsFor · allTags · hasTag (derived theme tags)
├── explore.ts          trendsUrl · exploreLinks · sourceUrl · openExternal
├── format.ts           heatScore · windowLabel/Tone · formatMomentum/Volume · euro
├── briefing.ts         buildBriefing · formatClock
├── watch.ts            buildHistory · watchStats — replace on live data
├── elevenlabs.ts       TTS, single call site
├── openai.ts           playbook regeneration, single call site
├── palette.ts          hex mirrors of theme tokens for native colour props
└── store/              usePrefsStore · useSignalStore · useSupportStore (zustand + AsyncStorage)
hooks/useBriefingPlayer.tsx   expo-audio playback or synthetic timeline
```

**Persistence:** three zustand stores behind `AsyncStorage` (`trendspark-prefs`,
`trendspark-signals` at version 3, `trendspark-support`). No server, no auth. The signal store migrates
`unlockedIds` → `openedIds` for anyone who used the earlier credit build.

**External services**

| Service    | Env var                          | Endpoint / model                                    | Behaviour with no key                       |
| ---------- | -------------------------------- | --------------------------------------------------- | ------------------------------------------- |
| ElevenLabs | `EXPO_PUBLIC_ELEVENLABS_API_KEY` | `/v1/text-to-speech/{voiceId}`, `eleven_turbo_v2_5` | Synthetic timeline, "Transcript mode" label |
| OpenAI     | `EXPO_PUBLIC_OPENAI_API_KEY`     | `/v1/chat/completions`, `gpt-4o-mini`, JSON mode    | Seeded playbook used, Regenerate hidden     |

`EXPO_PUBLIC_*` values are embedded in the client bundle. Acceptable for a hackathon build; both must
move behind a server route before any public release.

---

## 11. Design

Dark-locked "demand terminal". Near-black canvas and panels, a single acid-lime accent
`oklch(0.86 0.19 122)` reserved for rising momentum, contributions and primary actions; amber for
closing windows; red for decay. Mono-feel digits on every momentum number. Inter 400/500/600/700.

`lib/palette.ts` mirrors the tokens as hex because native colour props (SVG paint, tab-bar tints,
StatusBar, gradients) cannot parse `oklch`.

Accessibility: contrast targets WCAG AA on the dark canvas; momentum is never communicated by colour
alone — the sign and value are always printed.

---

## 12. Risks

| Risk                                                       | Severity | Mitigation                                                                     |
| ---------------------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| Pay-what-you-want converts near zero                       | High     | Fixed shared cost, not per-user; fallback is metering voice, never gating text |
| Contribution prompt reads as begging                       | Medium   | Ask only after value, at most once a day, dismissible, zero always offered     |
| History view implies a hit rate it cannot support          | Medium   | Survivorship bias and reconstructed curves stated in the UI, not just the docs |
| Trends' per-request rescaling makes cross-geo claims wrong | High     | Pair with Keyword Planner absolute volume; never compare raw indices           |
| Google Ads developer token approval delay                  | Medium   | Ship on DataForSEO, migrate later at zero data cost                            |
| Playbook quality varies by model output                    | Medium   | Seeded playbooks as the floor; regeneration is opt-in and additive             |
| Store rejection of a crypto checkout                       | High     | x402 confined to the machine lane; the consumer side has nothing to charge for |
| Local long-tail keywords below reporting floor             | Medium   | Metro/region granularity, volume gate on the feed                              |
| Client-embedded API keys                                   | High     | Proxy both providers server-side before release                                |

## 13. Roadmap after the hackathon

1. **Live feed** — backend, nightly Trends + Keyword Planner job, cached signals, composite score.
2. **Real purchases** — map each ladder rung to a consumable product id and each monthly tier to a
   subscription, then swap the two simulated actions in `useSupportStore`.
3. **Key proxying** — move ElevenLabs and OpenAI behind server routes.
4. **Geo selector** — city/region scoping on Radar, once absolute volumes are anchored.
5. **Breakout push notifications** — the `notifyOnBreakout` preference is stored but not yet wired.
6. **Ship the x402 endpoints** — the agent lane is currently specified, not served.
7. **Real breakout dates** — replace `FLAGGED_DAYS_AGO` and `buildHistory` with stored daily
   observations, which also removes the survivorship caveat from the History tab.

## 14. Demo script (3 minutes)

Radar → play the briefing, 15 seconds of voice → open a signal with a closing window, note that nothing
asks for payment → **Check it yourself**, open Google Trends for the keyword → Playbook tab → First move,
one-tap copy → **It helped** → the Contribute screen: usage recap, the run cost, the amount ladder, then
switch to share-of-outcome → History tab, filter to "3–6 weeks ago" and a tag, and read the survivorship
caveat out loud → close on the x402 machine lane.

## 15. Repository

```sh
npm install
npx expo start          # scan with Expo Go
npm run lint            # oxlint, type-aware
npm run format
```

Optional `.env`:

```
EXPO_PUBLIC_ELEVENLABS_API_KEY=
EXPO_PUBLIC_OPENAI_API_KEY=
```

Both are optional. With neither set the app is fully navigable: the briefing plays on a synthetic
timeline and playbooks come from the seeded dataset.
