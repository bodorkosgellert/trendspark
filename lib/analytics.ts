import {
  capture,
  initPreviewAnalytics,
  initProjectAnalytics,
  isProjectAnalyticsConfigured,
  stopProjectAnalytics,
} from '@/lib/posthog';
import { usePrefsStore } from '@/lib/store/usePrefsStore';

/**
 * The only events TrendSpark sends, and the reason each one exists.
 *
 * This list is short on purpose. Every event here answers a question that
 * changes what gets built next; anything that would only make a chart look
 * busy is left out.
 *
 * - `app_opened` / `return_day` — the whole thesis in one number. A daily
 *   briefing that nobody plays on a second day is not a product.
 * - `onboarding_completed`, `city_changed` — is the typed city lens used at all,
 *   and which cities do people ask for that the catalog does not know.
 * - `briefing_started` / `briefing_finished` — a 60-second briefing that people
 *   abandon at second 15 is a script problem, not a data problem.
 * - `signal_opened`, `signal_tracked`, `signal_dismissed` — the ranking's own
 *   scoreboard, and the training labels for keyword vetting.
 * - `outcome_saved` — the only evidence a play ever earned anything.
 * - `contribution_confirmed` / `contribution_skipped` / `checkout_opened` — what
 *   pay-after actually converts at, which is the riskiest number in the model.
 * - `email_submitted` — the one way a user can be reached again.
 * - `emergence_checked` — whether "how early am I" is a question people open, and
 *   how often the Hacker News probe finds anything for a keyword at all.
 */
export type AnalyticsEvent =
  | 'app_opened'
  | 'return_day'
  | 'onboarding_completed'
  | 'city_changed'
  | 'briefing_started'
  | 'briefing_finished'
  | 'signal_opened'
  | 'signal_tracked'
  | 'signal_dismissed'
  | 'playbook_regenerated'
  | 'copy_used'
  | 'outcome_saved'
  | 'checkout_opened'
  | 'contribution_confirmed'
  | 'contribution_skipped'
  | 'email_submitted'
  | 'emergence_checked'
  | 'analytics_opted_in';

export type AnalyticsProps = Record<string, string | number | boolean | null>;

export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  capture(event, props);
}

/** Called once at startup. Sends nothing until the user has opted in. */
export function startAnalytics(): void {
  initPreviewAnalytics();
  if (usePrefsStore.getState().analyticsConsent === 'granted') {
    initProjectAnalytics();
  }
}

export function applyAnalyticsConsent(granted: boolean): void {
  if (!granted) {
    stopProjectAnalytics();
    return;
  }
  initProjectAnalytics();
  track('analytics_opted_in');
}

export function analyticsAvailable(): boolean {
  return isProjectAnalyticsConfigured();
}

/** Waits for persisted prefs before reading consent or counting the day. */
export function beginAnalytics(): () => void {
  const run = () => {
    startAnalytics();
    trackAppOpen();
  };

  if (usePrefsStore.persist.hasHydrated()) {
    run();
    return () => undefined;
  }
  return usePrefsStore.persist.onFinishHydration(run);
}

/**
 * Records that the app was used today and reports how many distinct days this
 * device has used it. Day counting is done on-device rather than in PostHog so
 * the number survives a cleared cookie and stays right even if analytics is off.
 */
export function trackAppOpen(): void {
  const { activeDays, noteActiveDay } = usePrefsStore.getState();
  const today = new Date().toISOString().slice(0, 10);
  const seenToday = activeDays.includes(today);
  const dayCount = seenToday ? activeDays.length : activeDays.length + 1;

  if (!seenToday) noteActiveDay(today);

  track('app_opened', { day_count: dayCount, first_open_today: !seenToday });
  if (!seenToday && dayCount >= 2) {
    track('return_day', { day_count: dayCount });
  }
}
