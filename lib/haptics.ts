import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Web vibration, where it exists.
 *
 * `navigator.vibrate` is Android Chrome only: iOS Safari has never shipped it and
 * desktop browsers have nothing to vibrate, so this is a silent no-op almost
 * everywhere. It also requires a user gesture, which is why it is only ever
 * called from a press handler. Cross-origin iframes block it too, so the Bilt
 * preview will not buzz even on Android.
 */
function webVibrate(pattern: number | number[]) {
  const nav = (globalThis as { navigator?: { vibrate?: (value: number | number[]) => boolean } })
    .navigator;
  try {
    nav?.vibrate?.(pattern);
  } catch {
    // Some browsers throw instead of returning false. Never break a tap over it.
  }
}

/**
 * Plain tap. Deliberately silent on web: a buzz on every chip and every
 * navigation is noise, and Android's vibration motor is much blunter than the
 * iOS taptic engine.
 */
export function tapFeedback() {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * One notch of a value changing — a rung on the amount ladder, a step on a
 * slider. This one does fire on web, because feeling the notches is most of what
 * makes dragging an amount feel like a physical control.
 */
export function stepFeedback() {
  if (Platform.OS === 'web') {
    webVibrate(6);
    return;
  }
  void Haptics.selectionAsync();
}

/** Something completed: a contribution recorded, a result saved. */
export function successFeedback() {
  if (Platform.OS === 'web') {
    webVibrate([12, 45, 20]);
    return;
  }
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
