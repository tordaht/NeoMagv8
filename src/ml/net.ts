/**
 * A small multilayer perceptron, implemented from first principles.
 *
 * Written by hand rather than pulled from a library for three reasons that
 * matter to this project: the weight initialisation is seeded, so a run is
 * reproducible; it has no CDN dependency that can silently fail to load; and
 * the gradients are checkable, which `tests/net.test.ts` does numerically.
 *
 * Architecture: fully connected, ReLU hidden layers, single sigmoid output
 * trained with binary cross-entropy and Adam.
 */

import { createRng, type Rng } from '../core/rng.js';

export interface MLPOptions {
  seed: number | string;
  learningRate: number;
  /** L2 penalty applied to weights (not biases). */
  weightDecay: number;
  beta1: number;
  beta2: number;
  epsilon: number;
}

export const DEFAULT_MLP_OPTIONS: MLPOptions = {
  seed: 'mlp',
  learningRate: 0.01,
  weightDecay: 1e-5,
  beta1: 0.9,
  beta2: 0.999,
  epsilon: 1e-8,
};

export interface TrainingSample {
  input: Float64Array;
  /** Binary label. */
  target: number;
}

export interface BatchReport {
  loss: number;
  accuracy: number;
  size: number;
}

interface Layer {
  inputSize: number;
  outputSize: number;
  /** Row-major: `weights[o * inputSize + i]`. */
  weights: Float64Array;
  biases: Float64Array;
  gradWeights: Float64Array;
  gradBiases: Float64Array;
  mWeights: Float64Array;
  vWeights: Float64Array;
  mBiases: Float64Array;
  vBiases: Float64Array;
  /** Cached forward values, needed by backward. */
  input: Float64Array;
  preActivation: Float64Array;
  activation: Float64Array;
}

/** He initialisation, appropriate for ReLU, drawn from the seeded generator. */
function initLayer(inputSize: number, outputSize: number, rng: Rng): Layer {
  const weights = new Float64Array(inputSize * outputSize);
  const scale = Math.sqrt(2 / inputSize);
  for (let i = 0; i < weights.length; i++) weights[i] = rng.gauss() * scale;
  return {
    inputSize,
    outputSize,
    weights,
    biases: new Float64Array(outputSize),
    gradWeights: new Float64Array(inputSize * outputSize),
    gradBiases: new Float64Array(outputSize),
    mWeights: new Float64Array(inputSize * outputSize),
    vWeights: new Float64Array(inputSize * outputSize),
    mBiases: new Float64Array(outputSize),
    vBiases: new Float64Array(outputSize),
    input: new Float64Array(inputSize),
    preActivation: new Float64Array(outputSize),
    activation: new Float64Array(outputSize),
  };
}

function sigmoid(z: number): number {
  return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z));
}

export class MLP {
  readonly options: MLPOptions;
  readonly sizes: number[];
  private readonly layers: Layer[];
  private accumulated = 0;
  private stepCount = 0;

  /**
   * @param sizes Layer widths from input to output, e.g. `[12, 10, 1]`.
   *   The final width must be 1 — this is a binary classifier.
   */
  constructor(sizes: number[], options: Partial<MLPOptions> = {}) {
    if (sizes.length < 2) throw new Error('MLP needs at least an input and an output layer');
    if (sizes[sizes.length - 1] !== 1) throw new Error('MLP output layer must have width 1');
    this.sizes = [...sizes];
    this.options = { ...DEFAULT_MLP_OPTIONS, ...options };
    const rng = createRng(this.options.seed);
    this.layers = [];
    for (let i = 0; i < sizes.length - 1; i++) {
      this.layers.push(initLayer(sizes[i], sizes[i + 1], rng));
    }
  }

  get inputSize(): number {
    return this.sizes[0];
  }

  get updates(): number {
    return this.stepCount;
  }

  /** Runs the network and returns the output probability. */
  predict(input: Float64Array): number {
    let signal = input;
    for (let l = 0; l < this.layers.length; l++) {
      const layer = this.layers[l];
      layer.input.set(signal);
      const isLast = l === this.layers.length - 1;
      for (let o = 0; o < layer.outputSize; o++) {
        let sum = layer.biases[o];
        const row = o * layer.inputSize;
        for (let i = 0; i < layer.inputSize; i++) sum += layer.weights[row + i] * signal[i];
        layer.preActivation[o] = sum;
        layer.activation[o] = isLast ? sigmoid(sum) : Math.max(0, sum);
      }
      signal = layer.activation;
    }
    return signal[0];
  }

  /**
   * Forward and backward pass for a single sample; gradients accumulate until
   * `step()` is called. Returns the binary cross-entropy loss.
   */
  accumulate(input: Float64Array, target: number): number {
    const probability = this.predict(input);
    const clamped = Math.min(1 - 1e-7, Math.max(1e-7, probability));
    const loss = -(target * Math.log(clamped) + (1 - target) * Math.log(1 - clamped));

    // Sigmoid + BCE collapse to this gradient at the output pre-activation.
    let delta = new Float64Array([probability - target]);

    for (let l = this.layers.length - 1; l >= 0; l--) {
      const layer = this.layers[l];
      const nextDelta = new Float64Array(layer.inputSize);

      for (let o = 0; o < layer.outputSize; o++) {
        const d = delta[o];
        if (d === 0) continue;
        const row = o * layer.inputSize;
        layer.gradBiases[o] += d;
        for (let i = 0; i < layer.inputSize; i++) {
          layer.gradWeights[row + i] += d * layer.input[i];
          nextDelta[i] += layer.weights[row + i] * d;
        }
      }

      if (l > 0) {
        // Chain through the previous layer's ReLU.
        const previous = this.layers[l - 1];
        for (let i = 0; i < nextDelta.length; i++) {
          if (previous.preActivation[i] <= 0) nextDelta[i] = 0;
        }
      }
      delta = nextDelta;
    }

    this.accumulated += 1;
    return loss;
  }

  /** Applies an Adam update using the accumulated gradients, then clears them. */
  step(): void {
    if (this.accumulated === 0) return;
    const { learningRate, weightDecay, beta1, beta2, epsilon } = this.options;
    this.stepCount += 1;
    const scale = 1 / this.accumulated;
    const bias1 = 1 - Math.pow(beta1, this.stepCount);
    const bias2 = 1 - Math.pow(beta2, this.stepCount);

    for (const layer of this.layers) {
      for (let k = 0; k < layer.weights.length; k++) {
        const gradient = layer.gradWeights[k] * scale + weightDecay * layer.weights[k];
        layer.mWeights[k] = beta1 * layer.mWeights[k] + (1 - beta1) * gradient;
        layer.vWeights[k] = beta2 * layer.vWeights[k] + (1 - beta2) * gradient * gradient;
        const mHat = layer.mWeights[k] / bias1;
        const vHat = layer.vWeights[k] / bias2;
        layer.weights[k] -= (learningRate * mHat) / (Math.sqrt(vHat) + epsilon);
        layer.gradWeights[k] = 0;
      }
      for (let o = 0; o < layer.biases.length; o++) {
        const gradient = layer.gradBiases[o] * scale;
        layer.mBiases[o] = beta1 * layer.mBiases[o] + (1 - beta1) * gradient;
        layer.vBiases[o] = beta2 * layer.vBiases[o] + (1 - beta2) * gradient * gradient;
        const mHat = layer.mBiases[o] / bias1;
        const vHat = layer.vBiases[o] / bias2;
        layer.biases[o] -= (learningRate * mHat) / (Math.sqrt(vHat) + epsilon);
        layer.gradBiases[o] = 0;
      }
    }
    this.accumulated = 0;
  }

  /** Accumulates over a mini-batch and applies one update. */
  trainBatch(samples: readonly TrainingSample[]): BatchReport {
    if (samples.length === 0) return { loss: 0, accuracy: 0, size: 0 };
    let loss = 0;
    let correct = 0;
    for (const sample of samples) {
      loss += this.accumulate(sample.input, sample.target);
      const predicted = this.predict(sample.input) >= 0.5 ? 1 : 0;
      if (predicted === sample.target) correct += 1;
    }
    this.step();
    return { loss: loss / samples.length, accuracy: correct / samples.length, size: samples.length };
  }

  /** Loss and accuracy on held-out samples, with no weight update. */
  evaluate(samples: readonly TrainingSample[]): BatchReport {
    if (samples.length === 0) return { loss: 0, accuracy: 0, size: 0 };
    let loss = 0;
    let correct = 0;
    for (const sample of samples) {
      const probability = this.predict(sample.input);
      const clamped = Math.min(1 - 1e-7, Math.max(1e-7, probability));
      loss += -(sample.target * Math.log(clamped) + (1 - sample.target) * Math.log(1 - clamped));
      if ((probability >= 0.5 ? 1 : 0) === sample.target) correct += 1;
    }
    return { loss: loss / samples.length, accuracy: correct / samples.length, size: samples.length };
  }

  /** Flat copy of every parameter — used by the numerical gradient check. */
  parameters(): { get(): number; set(value: number): void; grad(): number }[] {
    const handles: { get(): number; set(value: number): void; grad(): number }[] = [];
    for (const layer of this.layers) {
      for (let k = 0; k < layer.weights.length; k++) {
        handles.push({
          get: () => layer.weights[k],
          set: (value: number) => {
            layer.weights[k] = value;
          },
          grad: () => layer.gradWeights[k],
        });
      }
      for (let o = 0; o < layer.biases.length; o++) {
        handles.push({
          get: () => layer.biases[o],
          set: (value: number) => {
            layer.biases[o] = value;
          },
          grad: () => layer.gradBiases[o],
        });
      }
    }
    return handles;
  }

  /** Discards accumulated gradients without updating weights. */
  zeroGrad(): void {
    for (const layer of this.layers) {
      layer.gradWeights.fill(0);
      layer.gradBiases.fill(0);
    }
    this.accumulated = 0;
  }
}
