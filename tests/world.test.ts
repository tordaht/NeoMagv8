import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, World } from '../src/core/world.js';
import { createRng, hashSeed } from '../src/core/rng.js';

const DT = 1 / 30;

function run(world: World, seconds: number): void {
  for (let i = 0; i < Math.round(seconds / DT); i++) world.tick(DT);
}

describe('rng', () => {
  it('is reproducible for a given seed and differs between seeds', () => {
    const a = createRng('seed-a');
    const b = createRng('seed-a');
    const c = createRng('seed-b');
    const drawA = Array.from({ length: 20 }, () => a.next());
    const drawB = Array.from({ length: 20 }, () => b.next());
    const drawC = Array.from({ length: 20 }, () => c.next());
    expect(drawA).toEqual(drawB);
    expect(drawA).not.toEqual(drawC);
  });

  it('stays inside its declared ranges', () => {
    const rng = createRng(7);
    for (let i = 0; i < 5000; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      expect(rng.int(5)).toBeLessThan(5);
      const ranged = rng.range(2, 3);
      expect(ranged).toBeGreaterThanOrEqual(2);
      expect(ranged).toBeLessThan(3);
    }
  });

  it('respects weights, including the all-zero case', () => {
    const rng = createRng('weights');
    const counts = { a: 0, b: 0 };
    for (let i = 0; i < 2000; i++) counts[rng.weighted(['a', 'b'] as const, [9, 1])] += 1;
    expect(counts.a).toBeGreaterThan(counts.b * 4);
    expect(['a', 'b']).toContain(rng.weighted(['a', 'b'] as const, [0, 0]));
  });

  it('hashes seeds stably', () => {
    expect(hashSeed('neomag')).toBe(hashSeed('neomag'));
    expect(hashSeed('neomag')).not.toBe(hashSeed('neomag2'));
  });
});

describe('world', () => {
  it('reproduces a run exactly from the same seed', () => {
    const fingerprint = (world: World): string =>
      world.bacteria
        .map((b) => `${b.id}:${b.x.toFixed(6)}:${b.y.toFixed(6)}:${b.energy.toFixed(6)}`)
        .join('|');

    const a = new World({ seed: 'determinism' });
    const b = new World({ seed: 'determinism' });
    run(a, 120);
    run(b, 120);
    expect(fingerprint(a)).toBe(fingerprint(b));

    const c = new World({ seed: 'determinism-2' });
    run(c, 120);
    expect(fingerprint(c)).not.toBe(fingerprint(a));
  });

  it('reaches an equilibrium instead of collapsing', () => {
    // The regression this guards: the previous engine spiked to 25 agents in
    // one simulated second and hit zero by the fifth.
    for (const seed of ['inv-1', 'inv-2', 'inv-3']) {
      const world = new World({ seed });
      run(world, 1200);
      expect(world.bacteria.length).toBeGreaterThan(5);
      expect(world.bacteria.length).toBeLessThanOrEqual(DEFAULT_CONFIG.maxPopulation);
    }
  });

  it('holds population steady over a long horizon', () => {
    const world = new World({ seed: 'long-horizon' });
    run(world, 600);
    const samples: number[] = [];
    for (let i = 0; i < Math.round(1800 / DT); i++) {
      world.tick(DT);
      if (i % 300 === 0) samples.push(world.bacteria.length);
    }
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const spread = Math.max(...samples) - Math.min(...samples);
    expect(mean).toBeGreaterThan(20);
    expect(mean).toBeLessThan(DEFAULT_CONFIG.softCapacity + 15);
    // Damped oscillation around the fixed point, not a runaway.
    expect(spread).toBeLessThan(mean);
  });

  it('keeps environment and agent state physically sensible', () => {
    const world = new World({ seed: 'bounds' });
    // Violations are accumulated rather than asserted per tick: one expect()
    // per agent per tick is hundreds of thousands of assertions and dominates
    // the suite's runtime without checking anything extra.
    const violations: string[] = [];
    for (let i = 0; i < Math.round(900 / DT); i++) {
      world.tick(DT);
      const env = world.environment;
      if (env.nutrients < 0 || env.nutrients > DEFAULT_CONFIG.nutrientCapacity + 1e-6) {
        violations.push(`nutrients=${env.nutrients} at tick ${i}`);
      }
      if (env.waste < 0) violations.push(`waste=${env.waste} at tick ${i}`);
      for (const agent of world.bacteria) {
        if (agent.energy > DEFAULT_CONFIG.energyCap + 1e-9) {
          violations.push(`energy=${agent.energy} at tick ${i}`);
        }
        if (agent.x < 0 || agent.x > DEFAULT_CONFIG.width) {
          violations.push(`x=${agent.x} at tick ${i}`);
        }
        if (agent.y < 0 || agent.y > DEFAULT_CONFIG.height) {
          violations.push(`y=${agent.y} at tick ${i}`);
        }
      }
      if (violations.length > 0) break;
    }
    expect(violations).toEqual([]);
  });

  it('turns over generations rather than freezing the founders', () => {
    const world = new World({ seed: 'generations' });
    run(world, 1200);
    expect(world.births).toBeGreaterThan(20);
    expect(world.deaths).toBeGreaterThan(10);
    expect(world.maxGeneration).toBeGreaterThan(1);
  });

  it('emits birth and death events', () => {
    const world = new World({ seed: 'events' });
    let births = 0;
    let deaths = 0;
    world.subscribe((event) => {
      if (event.type === 'birth') births++;
      if (event.type === 'death') deaths++;
    });
    run(world, 600);
    expect(births).toBe(world.births);
    expect(deaths).toBe(world.deaths);
  });

  it('finds neighbours within the hearing radius, nearest first', () => {
    const world = new World({ seed: 'neighbours', initialPopulation: 6 });
    const [first] = world.bacteria;
    const near = world.neighbours(first, 1e6);
    expect(near).toHaveLength(world.bacteria.length - 1);
    const distances = near.map((peer) => Math.hypot(peer.x - first.x, peer.y - first.y));
    expect([...distances].sort((a, b) => a - b)).toEqual(distances);
    expect(world.neighbours(first, 0)).toHaveLength(0);
  });
});
