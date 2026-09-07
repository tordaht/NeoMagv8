/**
 * The comprehension model: an online learner that predicts whether an
 * utterance will be understood, and is then used to choose between candidate
 * utterances.
 *
 * Two things make this a real demonstration rather than a decorative one:
 *
 *  - **A held-out split.** Every fifth observation is routed to a validation
 *    set the network never trains on, so the reported accuracy is honest.
 *  - **A measurable effect.** Once warmed up, the model ranks the speaker's
 *    candidate utterances. `tools/experiment.ts` runs the simulation with the
 *    model on and off under identical seeds and reports the difference in
 *    comprehension rate.
 *
 * Before warm-up the model reports itself as not ready and the simulation
 * falls back to a heuristic — it never pretends to be trained when it is not.
 */

import { MLP, type TrainingSample } from './net.js';

export interface ModelOptions {
  seed: number | string;
  inputSize: number;
  hiddenSize: number;
  learningRate: number;
  /** Ring-buffer capacity for training samples. */
  replayCapacity: number;
  /** Maximum held-out samples retained for validation. */
  holdoutCapacity: number;
  /** Observations between weight updates. */
  trainEvery: number;
  batchSize: number;
  /** Observations required before predictions are trusted. */
  warmupSamples: number;
}

export const DEFAULT_MODEL_OPTIONS: Omit<ModelOptions, 'inputSize'> = {
  seed: 'comprehension',
  hiddenSize: 24,
  learningRate: 0.015,
  replayCapacity: 3000,
  holdoutCapacity: 500,
  trainEvery: 6,
  batchSize: 32,
  warmupSamples: 200,
};

export interface ModelMetrics {
  ready: boolean;
  observed: number;
  updates: number;
  trainLoss: number;
  trainAccuracy: number;
  validationLoss: number;
  validationAccuracy: number;
  /** Accuracy of always predicting the majority class — the honest baseline. */
  baselineAccuracy: number;
  /**
   * Area under the ROC curve on the held-out set: the probability that a
   * randomly chosen understood utterance scores above a randomly chosen
   * misunderstood one. 0.5 is chance.
   *
   * This is the metric that matters here. The model's job is to *rank* a
   * speaker's candidate utterances, not to classify one at a 0.5 threshold, and
   * on a near-balanced problem thresholded accuracy can sit a fraction above
   * the majority baseline while the ranking is clearly informative.
   */
  validationAuc: number;
  positiveRate: number;
}

export interface MetricPoint {
  observed: number;
  trainLoss: number;
  validationAccuracy: number;
  baselineAccuracy: number;
}

export class ComprehensionModel {
  readonly options: ModelOptions;
  private readonly net: MLP;
  private readonly replay: TrainingSample[] = [];
  private readonly holdout: TrainingSample[] = [];
  private replayCursor = 0;
  private observed = 0;
  private positives = 0;
  private sinceUpdate = 0;
  private trainLoss = 0;
  private trainAccuracy = 0;
  private validationLoss = 0;
  private validationAccuracy = 0;
  private validationAuc = 0.5;
  private rngState = 0x2545f491;

  readonly history: MetricPoint[] = [];

  constructor(options: Partial<ModelOptions> & { inputSize: number }) {
    this.options = { ...DEFAULT_MODEL_OPTIONS, ...options };
    this.net = new MLP([this.options.inputSize, this.options.hiddenSize, 1], {
      seed: this.options.seed,
      learningRate: this.options.learningRate,
    });
  }

  /** True once enough evidence has accumulated for predictions to be used. */
  get ready(): boolean {
    return this.observed >= this.options.warmupSamples;
  }

  /** Predicted probability that the utterance lands. */
  predict(features: Float64Array): number {
    return this.net.predict(features);
  }

  /**
   * Records one observed outcome. Every fifth sample is held out; the rest go
   * into the replay ring and drive periodic mini-batch updates.
   */
  observe(features: Float64Array, understood: boolean): void {
    const sample: TrainingSample = { input: features, target: understood ? 1 : 0 };
    this.observed += 1;
    if (understood) this.positives += 1;

    if (this.observed % 5 === 0) {
      this.holdout.push(sample);
      if (this.holdout.length > this.options.holdoutCapacity) this.holdout.shift();
      return;
    }

    if (this.replay.length < this.options.replayCapacity) {
      this.replay.push(sample);
    } else {
      this.replay[this.replayCursor] = sample;
      this.replayCursor = (this.replayCursor + 1) % this.options.replayCapacity;
    }

    this.sinceUpdate += 1;
    if (this.sinceUpdate >= this.options.trainEvery && this.replay.length >= this.options.batchSize) {
      this.sinceUpdate = 0;
      this.train();
    }
  }

  /** Small xorshift used only to draw mini-batch indices; keeps runs repeatable. */
  private nextIndex(bound: number): number {
    let x = this.rngState;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.rngState = x >>> 0;
    return this.rngState % bound;
  }

  private train(): void {
    const batch: TrainingSample[] = [];
    for (let i = 0; i < this.options.batchSize; i++) {
      batch.push(this.replay[this.nextIndex(this.replay.length)]);
    }
    const report = this.net.trainBatch(batch);
    this.trainLoss = report.loss;
    this.trainAccuracy = report.accuracy;

    if (this.holdout.length >= 20) {
      const validation = this.net.evaluate(this.holdout);
      this.validationLoss = validation.loss;
      this.validationAccuracy = validation.accuracy;
      this.validationAuc = this.areaUnderRoc();
    }

    if (this.net.updates % 10 === 0) {
      this.history.push({
        observed: this.observed,
        trainLoss: this.trainLoss,
        validationAccuracy: this.validationAccuracy,
        baselineAccuracy: this.baselineAccuracy(),
      });
      if (this.history.length > 400) this.history.shift();
    }
  }

  /**
   * AUC by the rank-sum identity, with ties averaged. Cheap enough to run on
   * every evaluation because the held-out set is capped at a few hundred rows.
   */
  private areaUnderRoc(): number {
    const scored = this.holdout
      .map((sample) => ({ score: this.net.predict(sample.input), target: sample.target }))
      .sort((a, b) => a.score - b.score);

    let positives = 0;
    let negatives = 0;
    let rankSum = 0;
    for (let i = 0; i < scored.length; ) {
      // Average the ranks across a run of equal scores.
      let j = i;
      while (j < scored.length && scored[j].score === scored[i].score) j++;
      const averageRank = (i + 1 + j) / 2;
      for (let k = i; k < j; k++) {
        if (scored[k].target === 1) {
          positives++;
          rankSum += averageRank;
        } else {
          negatives++;
        }
      }
      i = j;
    }
    if (positives === 0 || negatives === 0) return 0.5;
    return (rankSum - (positives * (positives + 1)) / 2) / (positives * negatives);
  }

  /** Majority-class accuracy on the held-out set — what "no model" would score. */
  private baselineAccuracy(): number {
    if (this.holdout.length === 0) return 0;
    let positives = 0;
    for (const sample of this.holdout) positives += sample.target;
    const rate = positives / this.holdout.length;
    return Math.max(rate, 1 - rate);
  }

  metrics(): ModelMetrics {
    return {
      ready: this.ready,
      observed: this.observed,
      updates: this.net.updates,
      trainLoss: this.trainLoss,
      trainAccuracy: this.trainAccuracy,
      validationLoss: this.validationLoss,
      validationAccuracy: this.validationAccuracy,
      baselineAccuracy: this.baselineAccuracy(),
      validationAuc: this.validationAuc,
      positiveRate: this.observed === 0 ? 0 : this.positives / this.observed,
    };
  }
}
