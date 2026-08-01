import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Haptics are native-only; calling them on web logs noisy warnings. */
export function tapFeedback() {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function successFeedback() {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
