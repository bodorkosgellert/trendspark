# TrendSpark — Product Requirements Document

**Version:** 1.0 (hackathon build)
**Status:** Implemented, front-end complete, data seeded, purchases simulated
**Platform:** iOS / Android / Web (Expo, React Native, Expo Router)
**Audience for this doc:** hackathon judges, reviewers of this repository, future contributors

---

## 1. Summary

TrendSpark turns rising search demand into a same-day money play for one person working alone.

Every morning the app delivers a 60-second spoken briefing over the three hottest signals in the
niches the user tracks. Below the briefing sits a ranked radar feed of rising keywords. Signal data —
momentum, volume, competition, decay window, why it is rising — is free. The **playbook** for each
signal (concrete steps, angles, monetization path, ready-to-post copy) costs one credit.

Two payment rails, deliberately separated:

- **Humans** buy consumable credit packs or a plan through the app store.
- **Machines** hit an x402-priced HTTP API and pay per request in stablecoin.

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
4. **The unit of value is small.** One actionable playbook is worth roughly €1 to an indie hacker.
   Card networks make a €1 charge uneconomic, so nobody sells at that unit — they force a
   subscription instead, and churn accordingly.

## 3. Target user

| Segment | Trigger | What they want |
| --- | --- | --- |
| Solo creator / faceless-channel operator | Needs a topic that will still be rising when the video ships | A content angle plus a script hook, today |
| Indie hacker / micro-SaaS builder | Watching for an unserved integration or tool gap | A validated demand number and a scoped v1 |
| Side-hustler / reseller | Wants a product or local service with rising intent | A sourcing/positioning play with an honest margin note |

Explicitly **not** the target: SEO agencies, in-house marketing teams, enterprise intent-data buyers.
That was the earlier B2B framing and it was dropped; it changes the pricing rail and the copy.

## 4. Goals and non-goals

**Goals**

- G1 — A user can hear what changed in their market in under 60 seconds, hands-free.
- G2 — A user can go from "this is rising" to "here is my first post" in under two minutes.
- G3 — Monetize per unit of value (one playbook), not per month, while remaining store-compliant.
- G4 — Make the machine-readable lane a first-class product surface, not a footnote.

**Non-goals (this version)**

- No account system, no server, no sync. All state is on-device.
- No real payment processing. Store purchases are simulated locally.
- No publishing integrations (no posting to YouTube/X/TikTok on the user's behalf).
- No dark mode toggle — the app is dark-locked by design.
- No live trend ingestion. The feed is a 20-signal seeded dataset (see §9).

## 5. Success metrics

| Metric | Definition | Target |
| --- | --- | --- |
| Briefing D1 retention | Users who play a briefing on two consecutive days | > 35% |
| Unlock rate | Sessions containing ≥ 1 playbook unlock | > 20% |
| Credits per paying user per month | Ledger `unlock` entries / paying users | > 6 |
| Free → paid conversion | Users who buy any pack or plan within 7 days | > 5% |
| Time to first unlock | Onboarding complete → first `unlock` ledger entry | < 3 min median |

## 6. Product principles

1. **Signal free, execution paid.** Never paywall the number. Paywall the plan derived from it.
2. **Urgency is a feature.** Every signal carries a decay window and a projected decay bar.
3. **No hype.** Copy is flat and specific. The generation prompt bans emoji, exclamation marks and
   encouragement, and asks for honest limitations.
4. **Never fail on stage.** Every network dependency has a working offline path.
5. **The micropayment must be visible.** The credit pill decrements in the header when you spend.

---

## 7. Scope — implemented features

### 7.1 Onboarding — `app/onboarding.tsx`

Single screen, fade transition. Ten niches (`AI & tools`, `Creator economy`, `Fitness`, `Money`,
`Gaming`, `Home & energy`, `Pets`, `Food`, `Travel`, `Wellness`), multi-select, skippable.

- CTA reads "Show me everything" with nothing selected, "Track N areas" otherwise.
- Footer states the free allowance: two credits, no card.
- On confirm: `usePrefsStore.completeOnboarding(niches)` → `/(tabs)`.

**Acceptance:** selecting zero niches must not produce an empty feed — `scopeSignals` falls back to
the full set.

### 7.2 Radar (home) — `app/(tabs)/index.tsx`

- Header: wordmark + `CreditPill` (tappable, routes to `/paywall`).
- `BriefingHero`: today's top three signals, script preview, duration, play button → `/briefing`.
- Filter tabs: **Hottest** (default, by `heatScore`), **Low competition**, **Closing soon**.
- Virtualized feed (`@shopify/flash-list`) of `SignalCard`: keyword, sparkline, momentum badge,
  competition, region, window label, inline unlock affordance.
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
- Free plan: one full briefing per day (`FREE_BRIEFINGS_PER_DAY = 1`), then the paywall.

**Degradation:** with no ElevenLabs key the player runs the same script on a synthetic timeline and
the app labels itself "Transcript mode". Every control still works.

### 7.4 Signal detail — `app/signal/[id].tsx`

Three tabs.

- **Signal** (always free) — 14-point sparkline, searches/mo, competition, window in days, "Why now"
  narrative, projected-decay progress bar, source tags.
- **Playbook** (1 credit) — play kind badge (content / product / affiliate / local), headline, target
  audience, four ordered steps with detail, three angles, monetization model + estimate + honest note.
  A **Regenerate** button appears only when an OpenAI key is present.
- **First move** (1 credit) — ready-to-post copy with a native share / copy action.

Header carries a save (bookmark) toggle. Locked state shows a blurred panel with
"Unlock playbook · 1 credit" and the guarantee "One credit, yours forever. Signal data stays free."

### 7.5 My plays — `app/(tabs)/plays.tsx`

Toggle between **Unlocked** (permanent, count) and **Saved** (bookmarked, count), each with an empty
state routing back to Radar.

### 7.6 Credits — `app/(tabs)/wallet.tsx`

Balance, plan status, upgrade card for free users, three credit packs, a link to the machine-access
lane, and the activity ledger (last 50 entries, signed and colour-coded). Copy states that unlocked
playbooks never expire.

### 7.7 Paywall — `app/paywall.tsx`

Mode toggle between **Plans** and **One-off credits**, radio selection, perk lists, active/most-picked
badges, and a footer disclosing that billing is through the App Store or Play Store and that
purchases are simulated in this build.

### 7.8 You — `app/(tabs)/you.tsx`

Owned-playbook count and plan, niche tracking editor, voice picker, briefing hour (6/7/8/9/12/18),
breakout-alert switch, live status of the two external services (Connected vs Transcript mode /
Written playbooks), and a demo reset that clears all three stores and returns to onboarding.

### 7.9 Machine access (x402 lane) — `app/agent.tsx`

Read-only spec surface, reachable from Credits.

| Endpoint | Price | Returns |
| --- | --- | --- |
| `GET /v1/signals?niche=ai-tools` | $0.002 | Ranked list, metadata only |
| `GET /v1/signals/{id}` | $0.01 | Full signal with series and sources |
| `GET /v1/signals/{id}/playbook` | $0.05 | Generated playbook |

Documented flow: unauthenticated request → `402 Payment Required` carrying price and payment address
→ agent pays in stablecoin → retry with payment header → data returned. No account, no card, no
invoice. The screen also states why this is *not* the consumer checkout (see §8).

---

## 8. Monetization

### 8.1 Consumer rail (implemented, simulated)

| Item | Price | Contents |
| --- | --- | --- |
| Free | €0 | 2 starting credits, 1 briefing/day |
| Pack — 3 credits | €2.99 | ~€1.00 per playbook |
| Pack — 10 credits | €7.99 | €0.80 per playbook |
| Pack — 30 credits | €17.99 | €0.60 per playbook, best value |
| Weekly plan | €4.99/wk | Unlimited briefing replays, 10 credits/week, signals 12h early |
| Annual plan | €79/yr | Weekly perks, 25 credits/month, early access to new niches |

1 credit = 1 playbook unlock, permanent. Credits are consumable IAP; plans are auto-renewing IAP.

### 8.2 Why this structure

- **Credit packs are the micropayment, made viable.** A €1 card charge loses most of its value to the
  fixed per-transaction fee. Batching into a €2.99–€17.99 pack clears the fee floor while keeping the
  *perceived* unit price under €1.
- **The plan carries the habit.** The briefing is the recurring surface, so it takes the recurring
  charge. Unlocks stay variable because usage is bursty.
- **x402 is not the consumer checkout.** App Store Review Guideline 3.1.1 and Google Play billing
  policy require IAP for in-app digital goods; a stablecoin checkout for unlocking content is a
  rejection. Independently, consumers will not fund a wallet to read a trend playbook. Retaining x402
  strictly as a machine lane keeps both rails correct for their buyer.
- **Rejected: pay-after-conversion / revenue share.** Attribution is unprovable, the cash cycle runs
  months, and it turns a product into an agency.

### 8.3 Implementation note

Bilt-managed payments are not enabled on this project, so `useWalletStore.buyPack()` and
`subscribe()` mutate local persisted state and write a ledger entry. Swapping in real IAP touches only
those two actions.

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
- **Momentum → Google Trends.** The *shape* of the 0–100 curve over 90 days.

`score = momentum × log(local volume)`, gated on a volume floor. That is the Radar ranking.

Interim source while the Ads token clears: **DataForSEO** — Google Ads endpoint $0.06/queued task
(1,000 keywords per task), Google Trends endpoint $0.0027/queued task (5 keywords per task), $50
minimum top-up.

**Cost model.** Query on a schedule, never per user. A nightly pass over 2,000 keywords × 20 cities
is ~40 Ads tasks (~$2.40) plus ~8,000 Trends tasks (~$22) — **under $30/month for the whole feed,
serving unlimited users.** Cost scales with the keyword × geo grid, not with user count. That is what
makes a €2.99 pack viable.

**Known traps.**

1. Google Trends rescales 0–100 *per request*; Berlin's 100 ≠ Munich's 100. Cross-geo comparison
   requires an absolute anchor, which is why Keyword Planner is mandatory in the pair.
2. City-level long-tail keywords fall below Google's reporting floor and return bucketed ranges. The
   smallest reliable unit is metro/region, not neighbourhood.
3. **Exploding Topics is not a candidate.** $249/mo plan plus $1,000+/mo API packages, commercial
   embedding needs custom pricing, and their own FAQ states the API cannot serve custom keyword or
   geo lookups — i.e. it cannot deliver local interest at all.

Requires a backend for the scheduler and cache; the seeded dataset stays as the fallback.

---

## 10. Architecture

```
Expo Router app  (dark-locked, on-device state)
├── app/(tabs)          Radar · My plays · Credits · You
├── app/signal/[id]     Signal / Playbook / First move
├── app/briefing        modal player
├── app/paywall         modal, plans + packs
├── app/agent           modal, x402 spec
└── app/onboarding
lib/
├── data/signals.ts     20 seeded signals (offline fallback)
├── data/catalog.ts     niches, packs, plans, UNLOCK_COST, STARTING_CREDITS
├── feed.ts             scopeSignals · rankByHeat · topSignals
├── format.ts           heatScore · windowLabel/Tone · formatMomentum/Volume · detectedLabel
├── briefing.ts         buildBriefing · formatClock
├── elevenlabs.ts       TTS, single call site
├── openai.ts           playbook regeneration, single call site
├── palette.ts          hex mirrors of theme tokens for native colour props
└── store/              usePrefsStore · useSignalStore · useWalletStore (zustand + AsyncStorage)
hooks/useBriefingPlayer.tsx   expo-audio playback or synthetic timeline
```

**Persistence:** three zustand stores behind `AsyncStorage` (`trendspark-prefs`,
`trendspark-signals`, `trendspark-wallet`). No server, no auth.

**External services**

| Service | Env var | Endpoint / model | Behaviour with no key |
| --- | --- | --- | --- |
| ElevenLabs | `EXPO_PUBLIC_ELEVENLABS_API_KEY` | `/v1/text-to-speech/{voiceId}`, `eleven_turbo_v2_5` | Synthetic timeline, "Transcript mode" label |
| OpenAI | `EXPO_PUBLIC_OPENAI_API_KEY` | `/v1/chat/completions`, `gpt-4o-mini`, JSON mode | Seeded playbook used, Regenerate hidden |

`EXPO_PUBLIC_*` values are embedded in the client bundle. Acceptable for a hackathon build; both must
move behind a server route before any public release.

---

## 11. Design

Dark-locked "demand terminal". Near-black canvas and panels, a single acid-lime accent
`oklch(0.86 0.19 122)` reserved for rising momentum, credits and primary actions; amber for closing
windows; red for decay. Mono-feel digits on every momentum number. Inter 400/500/600/700.

`lib/palette.ts` mirrors the tokens as hex because native colour props (SVG paint, tab-bar tints,
StatusBar, gradients) cannot parse `oklch`.

Accessibility: contrast targets WCAG AA on the dark canvas; momentum is never communicated by colour
alone — the sign and value are always printed.

---

## 12. Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Trends' per-request rescaling makes cross-geo claims wrong | High | Pair with Keyword Planner absolute volume; never compare raw indices |
| Google Ads developer token approval delay | Medium | Ship on DataForSEO, migrate later at zero data cost |
| Playbook quality varies by model output | Medium | Seeded playbooks as the floor; regeneration is opt-in and additive |
| Store rejection of a crypto checkout | High | x402 confined to the machine lane; consumer rail is IAP only |
| Local long-tail keywords below reporting floor | Medium | Metro/region granularity, volume gate on the feed |
| Client-embedded API keys | High | Proxy both providers server-side before release |

## 13. Roadmap after the hackathon

1. **Live feed** — backend, nightly Trends + Keyword Planner job, cached signals, composite score.
2. **Real purchases** — swap simulated wallet actions for consumable + subscription IAP.
3. **Key proxying** — move ElevenLabs and OpenAI behind server routes.
4. **Geo selector** — city/region scoping on Radar, once absolute volumes are anchored.
5. **Breakout push notifications** — the `notifyOnBreakout` preference is stored but not yet wired.
6. **Ship the x402 endpoints** — the agent lane is currently specified, not served.

## 14. Demo script (3 minutes)

Radar → play the briefing, 15 seconds of voice → scroll to a signal with a closing window → unlock,
credit pill ticks down → Playbook tab → First move, one-tap copy → Credits tab for packs and plan →
close on the x402 machine lane.

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
