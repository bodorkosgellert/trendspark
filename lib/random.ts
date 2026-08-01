/**
 * Deterministic randomness helpers.
 *
 * Anything derived rather than observed in TrendSpark is generated from a stable
 * seed — usually a signal id — so a curve looks identical on every render, every
 * session and every device. Never swap these for Math.random: a chart that moves
 * between renders is worse than no chart.
 */

export function hashId(id: string): number {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Small deterministic PRNG. Same seed always yields the same sequence. */
export function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
