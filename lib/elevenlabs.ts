import { Platform } from 'react-native';

/**
 * ElevenLabs text-to-speech.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ADD YOUR HACKATHON KEY HERE (single place):
 *   .env  →  EXPO_PUBLIC_ELEVENLABS_API_KEY=sk_...
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * With no key the briefing player runs on its own timeline and shows the
 * transcript, so the app is fully demoable offline. As soon as the key exists,
 * real audio is generated and played instead. Note that EXPO_PUBLIC_ vars ship
 * inside the bundle, which is fine for a hackathon demo and must move behind a
 * server route before any real release.
 */
const API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY ?? '';

const ENDPOINT = 'https://api.elevenlabs.io/v1/text-to-speech';

/** In-app voice choice mapped to ElevenLabs public voice ids. */
export const VOICE_MAP: Record<string, string> = {
  analyst: 'JBFqnCBsd6RMkjVDRZzb',
  anchor: 'onwK4e9ZLuTAKqWW03F9',
  coach: 'XrExE9yKIg1WjnnlVkGX',
};

export function isVoiceConfigured(): boolean {
  return API_KEY.length > 0;
}

async function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('error', () => reject(new Error('Could not read audio')));
    reader.addEventListener('loadend', () => {
      const { result } = reader;
      resolve(typeof result === 'string' ? result : '');
    });
    reader.readAsDataURL(blob);
  });
}

/**
 * Returns a playable URI for the spoken briefing, or null when no key is set or
 * the request fails. Callers fall back to the synthetic timeline.
 */
export async function synthesizeBriefing(text: string, voice: string): Promise<string | null> {
  if (!isVoiceConfigured()) return null;

  const voiceId = VOICE_MAP[voice] ?? VOICE_MAP.analyst;

  try {
    const response = await fetch(`${ENDPOINT}/${voiceId}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.4, similarity_boost: 0.75, speed: 1.05 },
      }),
    });

    if (!response.ok) return null;

    const blob = await response.blob();
    if (Platform.OS === 'web') {
      return URL.createObjectURL(blob);
    }
    return await blobToDataUri(blob);
  } catch {
    return null;
  }
}
