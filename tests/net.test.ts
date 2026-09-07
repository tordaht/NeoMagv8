import { describe, expect, it } from 'vitest';
import { MLP, type TrainingSample } from '../src/ml/net.js';
import { createRng } from '../src/core/rng.js';

/** XOR is the standard proof that a network is doing more than a linear fit. */
const XOR: TrainingSample[] = [
  { input: new Float64Array([0, 0]), target: 0 },
  { input: new Float64Array([0, 1]), target: 1 },
  { input: new Float64Array([1, 0]), target: 1 },
  { input: new Float64Array([1, 1]), target: 0 },
];

describe('MLP', () => {
  it('rejects malformed architectures', () => {
    expect(() => new MLP([4])).toThrow();
    expect(() => new MLP([4, 3, 2])).toThrow(/width 1/);
  });

  it('learns XOR', () => {
    const net = new MLP([2, 8, 1], { seed: 'xor', learningRate: 0.05 });
    const before = net.evaluate(XOR);
    for (let epoch = 0; epoch < 3000; epoch++) net.trainBatch(XOR);
    const after = net.evaluate(XOR);

    expect(after.accuracy).toBe(1);
    expect(after.loss).toBeLessThan(before.loss);
    expect(after.loss).toBeLessThan(0.05);
  });

  it('is deterministic given a seed', () => {
    const a = new MLP([3, 5, 1], { seed: 'same' });
    const b = new MLP([3, 5, 1], { seed: 'same' });
    const c = new MLP([3, 5, 1], { seed: 'different' });
    const input = new Float64Array([0.2, 0.7, 0.4]);

    expect(a.predict(input)).toBe(b.predict(input));
    expect(a.predict(input)).not.toBe(c.predict(input));

    const sample: TrainingSample[] = [{ input, target: 1 }];
    for (let i = 0; i < 50; i++) {
      a.trainBatch(sample);
      b.trainBatch(sample);
    }
    expect(a.predict(input)).toBe(b.predict(input));
  });

  it('matches numerically estimated gradients', () => {
    const net = new MLP([4, 6, 1], { seed: 'grad', weightDecay: 0 });
    const rng = createRng('grad-input');
    const input = new Float64Array([rng.next(), rng.next(), rng.next(), rng.next()]);
    const target = 1;

    const lossAt = (): number => {
      const probability = net.predict(input);
      const clamped = Math.min(1 - 1e-7, Math.max(1e-7, probability));
      return -(target * Math.log(clamped) + (1 - target) * Math.log(1 - clamped));
    };

    net.zeroGrad();
    net.accumulate(input, target);
    const handles = net.parameters();
    const analytic = handles.map((handle) => handle.grad());

    const epsilon = 1e-6;
    let checked = 0;
    for (let i = 0; i < handles.length; i += 7) {
      const handle = handles[i];
      const original = handle.get();

      handle.set(original + epsilon);
      const up = lossAt();
      handle.set(original - epsilon);
      const down = lossAt();
      handle.set(original);

      const numeric = (up - down) / (2 * epsilon);
      expect(numeric).toBeCloseTo(analytic[i], 5);
      checked++;
    }
    expect(checked).toBeGreaterThan(3);
  });

  it('separates a noisy linear problem better than chance on held-out data', () => {
    const rng = createRng('sep');
    const make = (n: number): TrainingSample[] => {
      const out: TrainingSample[] = [];
      for (let i = 0; i < n; i++) {
        const a = rng.next();
        const b = rng.next();
        const c = rng.next();
        // Label depends on a real signal plus noise, so perfect accuracy is
        // impossible and an over-fitting model would be caught by the split.
        const score = 0.7 * a - 0.5 * b + 0.2 * c + rng.gauss() * 0.15;
        out.push({ input: new Float64Array([a, b, c]), target: score > 0.1 ? 1 : 0 });
      }
      return out;
    };
    const train = make(600);
    const test = make(200);

    const net = new MLP([3, 8, 1], { seed: 'sep-net', learningRate: 0.02 });
    for (let epoch = 0; epoch < 60; epoch++) {
      for (let i = 0; i < train.length; i += 32) net.trainBatch(train.slice(i, i + 32));
    }

    expect(net.evaluate(test).accuracy).toBeGreaterThan(0.85);
    expect(net.updates).toBeGreaterThan(0);
  });
});
