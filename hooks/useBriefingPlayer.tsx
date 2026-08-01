import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type AudioPlayer, createAudioPlayer } from 'expo-audio';

import type { BriefingLine, BriefingScript } from '@/lib/briefing';
import { isVoiceConfigured, synthesizeBriefing } from '@/lib/elevenlabs';

export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'done';

const TICK_MS = 100;

interface BriefingPlayer {
  state: PlayerState;
  positionMs: number;
  durationMs: number;
  progress: number;
  activeLine: BriefingLine | null;
  activeIndex: number;
  isLive: boolean;
  toggle: () => void;
  restart: () => void;
  skipTo: (lineIndex: number) => void;
}

/**
 * Drives briefing playback. When an ElevenLabs key is configured the real audio
 * is generated and the timeline follows the player clock. Otherwise the same
 * transcript is walked on a synthetic clock, so the screen behaves identically
 * with or without network access.
 */
export function useBriefingPlayer(script: BriefingScript, voiceId: string): BriefingPlayer {
  const [state, setState] = useState<PlayerState>('idle');
  const [positionMs, setPositionMs] = useState(0);
  const [audioDurationMs, setAudioDurationMs] = useState(0);

  const playerRef = useRef<AudioPlayer | null>(null);
  const positionRef = useRef(0);
  const lastTickRef = useRef(0);

  const durationMs = audioDurationMs > 0 ? audioDurationMs : script.durationMs;

  const releasePlayer = useCallback(() => {
    playerRef.current?.remove();
    playerRef.current = null;
    setAudioDurationMs(0);
  }, []);

  useEffect(() => releasePlayer, [releasePlayer]);

  // Switching voice invalidates any generated audio.
  useEffect(() => {
    releasePlayer();
    setState('idle');
    positionRef.current = 0;
    setPositionMs(0);
  }, [voiceId, releasePlayer]);

  useEffect(() => {
    if (state !== 'playing') return undefined;

    lastTickRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      const player = playerRef.current;
      if (player) {
        if (player.duration > 0) setAudioDurationMs(player.duration * 1000);
        positionRef.current = player.currentTime * 1000;
      } else {
        positionRef.current += delta;
      }

      const limit = playerRef.current?.duration
        ? playerRef.current.duration * 1000
        : script.durationMs;

      if (positionRef.current >= limit) {
        positionRef.current = limit;
        setPositionMs(limit);
        setState('done');
        return;
      }
      setPositionMs(positionRef.current);
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [state, script.durationMs]);

  const start = useCallback(async () => {
    positionRef.current = 0;
    setPositionMs(0);

    if (isVoiceConfigured()) {
      setState('loading');
      const uri = await synthesizeBriefing(script.text, voiceId);
      if (uri) {
        const player = createAudioPlayer({ uri });
        playerRef.current = player;
        player.play();
      }
    }

    setState('playing');
  }, [script.text, voiceId]);

  const toggle = useCallback(() => {
    if (state === 'loading') return;

    if (state === 'playing') {
      playerRef.current?.pause();
      setState('paused');
      return;
    }

    if (state === 'paused') {
      playerRef.current?.play();
      setState('playing');
      return;
    }

    if (state === 'done') {
      const player = playerRef.current;
      if (player) {
        void player.seekTo(0);
        player.play();
        positionRef.current = 0;
        setPositionMs(0);
        setState('playing');
        return;
      }
    }

    void start();
  }, [state, start]);

  const restart = useCallback(() => {
    const player = playerRef.current;
    positionRef.current = 0;
    setPositionMs(0);
    if (player) {
      void player.seekTo(0);
      player.play();
      setState('playing');
      return;
    }
    void start();
  }, [start]);

  const skipTo = useCallback(
    (lineIndex: number) => {
      const line = script.lines[lineIndex];
      if (!line) return;
      const ratio = script.durationMs > 0 ? line.startMs / script.durationMs : 0;
      const target = ratio * durationMs;
      positionRef.current = target;
      setPositionMs(target);
      const player = playerRef.current;
      if (player) void player.seekTo(target / 1000);
      if (state !== 'playing') setState('playing');
    },
    [script.lines, script.durationMs, durationMs, state],
  );

  const activeIndex = useMemo(() => {
    const ratio = durationMs > 0 ? positionMs / durationMs : 0;
    const scaled = ratio * script.durationMs;
    const index = script.lines.findIndex(
      (line) => scaled >= line.startMs && scaled < line.startMs + line.durationMs,
    );
    if (index >= 0) return index;
    return state === 'done' ? script.lines.length - 1 : 0;
  }, [positionMs, durationMs, script.lines, script.durationMs, state]);

  return {
    state,
    positionMs,
    durationMs,
    progress: durationMs > 0 ? Math.min(1, positionMs / durationMs) : 0,
    activeLine: script.lines[activeIndex] ?? null,
    activeIndex,
    isLive: playerRef.current !== null,
    toggle,
    restart,
    skipTo,
  };
}
