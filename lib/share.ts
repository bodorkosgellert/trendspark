import { Platform, Share } from 'react-native';

export type ShareResult = 'copied' | 'shared' | 'failed';

/** Copies on web, opens the native share sheet elsewhere. No extra dependency. */
export async function shareText(text: string, title?: string): Promise<ShareResult> {
  try {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return 'copied';
      }
      return 'failed';
    }
    await Share.share({ message: text, title });
    return 'shared';
  } catch {
    return 'failed';
  }
}
