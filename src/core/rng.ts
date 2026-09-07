/**
 * Deterministic pseudo-random number generation.
 *
 * Every stochastic decision in the simulation goes through an instance of this
 * generator. `Math.random()` must never be called from `src/core`, `src/lang`
 * or `src/ml` — reproducibility (same seed, same run) is a hard requirement of
 * the experiment pipeline and of the regression tests.
 */

export interface Rng {
  /** Uniform float in [0, 1). */
  next(): number;
  /** Uniform integer in [0, n). */
  int(n: number): number;
  /** Uniform float in [min, max). */
  range(min: number, max: number): number;
  /** True with probability `p`. */
  bool(p: number): boolean;
  /** Uniform element of a non-empty array. */
  pick<T>(items: readonly T[]): T;
  /** Element of `items` chosen proportionally to `weights`. */
  weighted<T>(items: readonly T[], weights: readonly number[]): T;
  /** Standard normal sample (Box–Muller). */
  gauss(): number;
  /** In-place Fisher–Yates shuffle; returns the same array. */
  shuffle<T>(items: T[]): T[];
  /** A fresh independent generator, useful for isolating subsystems. */
  fork(salt: number): Rng;
  /** Current internal state, so a run can be checkpointed. */
  state(): number;
}

/** Hashes an arbitrary string into a 32-bit seed. */
export function hashSeed(text: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * mulberry32 — small, fast, and good enough for simulation work. Chosen over
 * `Math.random()` because its state is explicit and therefore reproducible.
 */
export function createRng(seed: number | string): Rng {
  let s = (typeof seed === 'string' ? hashSeed(seed) : seed >>> 0) || 0x9e3779b9;

  const next = (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  let spare: number | null = null;

  const rng: Rng = {
    next,
    int: (n) => Math.floor(next() * n),
    range: (min, max) => min + next() * (max - min),
    bool: (p) => next() < p,
    pick: (items) => {
      if (items.length === 0) throw new Error('rng.pick: empty array');
      return items[Math.floor(next() * items.length)];
    },
    weighted: (items, weights) => {
      if (items.length === 0) throw new Error('rng.weighted: empty array');
      let total = 0;
      for (let i = 0; i < items.length; i++) total += Math.max(0, weights[i] ?? 0);
      if (total <= 0) return items[Math.floor(next() * items.length)];
      let roll = next() * total;
      for (let i = 0; i < items.length; i++) {
        roll -= Math.max(0, weights[i] ?? 0);
        if (roll <= 0) return items[i];
      }
      return items[items.length - 1];
    },
    gauss: () => {
      if (spare !== null) {
        const value = spare;
        spare = null;
        return value;
      }
      let u = 0;
      let v = 0;
      let magnitude = 0;
      do {
        u = next() * 2 - 1;
        v = next() * 2 - 1;
        magnitude = u * u + v * v;
      } while (magnitude === 0 || magnitude >= 1);
      const scale = Math.sqrt((-2 * Math.log(magnitude)) / magnitude);
      spare = v * scale;
      return u * scale;
    },
    shuffle: (items) => {
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      return items;
    },
    fork: (salt) => createRng((s ^ Math.imul(salt + 1, 0x9e3779b9)) >>> 0),
    state: () => s,
  };

  return rng;
}
