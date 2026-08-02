import { Platform } from 'react-native';
import type { PostHog } from 'posthog-js';

/**
 * PostHog transport. Two separate init paths, deliberately:
 *
 * 1. `initPreviewAnalytics()` — the Bilt preview passes a key and host in the
 *    iframe URL. That is Bilt's own instrumentation of the preview, not yours.
 * 2. `initProjectAnalytics()` — your project, from EXPO_PUBLIC_POSTHOG_KEY.
 *    Only ever called after the user has opted in, because a persistent
 *    analytics identifier on a device needs consent under §25 TDDDG in Germany
 *    regardless of the technology used to store it.
 *
 * Typed events live in lib/analytics.ts; this file only moves them.
 *
 * posthog-js is web-only. On native this whole module is a no-op — shipping
 * mobile analytics would mean adding posthog-react-native, and the web PWA is
 * where the audience is measured first.
 */
const PROJECT_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const PROJECT_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';

/** Events fired before the library finishes loading are held, not dropped. */
const QUEUE_LIMIT = 40;

interface QueuedEvent {
  event: string;
  props?: Record<string, unknown>;
}

let client: PostHog | null = null;
let loading = false;
let queue: QueuedEvent[] = [];

function onWeb(): boolean {
  return Platform.OS === 'web' && typeof window !== 'undefined';
}

export function isProjectAnalyticsConfigured(): boolean {
  return PROJECT_KEY.length > 0;
}

export function isAnalyticsRunning(): boolean {
  return client !== null;
}

function load(key: string, host: string, options: Record<string, unknown>): void {
  if (loading || client) return;
  loading = true;

  void import('posthog-js')
    .then(({ posthog }) => {
      posthog.init(key, {
        api_host: host,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        ...options,
      });
      client = posthog;
      const pending = queue;
      queue = [];
      pending.forEach((item) => posthog.capture(item.event, item.props));
    })
    .catch(() => {
      loading = false;
    });
}

/** Bilt preview instrumentation: only inside the preview iframe, only with its key. */
export function initPreviewAnalytics(): void {
  if (!onWeb() || window === window.parent) return;

  const params = new URLSearchParams(window.location.search);
  const key = params.get('__ph_key');
  const host = params.get('__ph_host');
  if (!key || !host) return;

  load(key, host, { disable_session_recording: false, session_recording: {} });
}

/**
 * Your own project. Persistence is on purpose: the single metric that decides
 * whether this product works is "did anyone come back on a second day", and a
 * cookieless memory-only setup cannot answer it. That is exactly why it is
 * behind an explicit opt-in.
 */
export function initProjectAnalytics(): void {
  if (!onWeb() || !isProjectAnalyticsConfigured()) return;

  load(PROJECT_KEY, PROJECT_HOST, {
    persistence: 'localStorage+cookie',
    // No session replay: it records everything a user types, which is far more
    // than is needed to count six events.
    disable_session_recording: true,
  });
}

/** Consent withdrawn: stop sending and drop the stored identifier. */
export function stopProjectAnalytics(): void {
  queue = [];
  if (!client) return;
  client.opt_out_capturing();
  client.reset();
}

export function capture(event: string, props?: Record<string, unknown>): void {
  if (!onWeb()) return;

  if (client) {
    client.capture(event, props);
    return;
  }

  if (!loading) return;
  if (queue.length >= QUEUE_LIMIT) return;
  queue.push({ event, props });
}
