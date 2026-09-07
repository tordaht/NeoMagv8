/**
 * Paired A/B experiment: does the comprehension model actually help?
 *
 * This replaces `run_experiments.py`, whose two arms were bit-identical — it
 * ran the same random walk with the same seed and differed only in a config
 * key the simulation never read, so every MLflow metric it logged was
 * meaningless.
 *
 * Here both arms run the *same* world seed and the model trains identically in
 * both; the only difference is whether its predictions are allowed to choose
 * between the speaker's candidate utterances. Differences are therefore
 * attributable to the model, and the paired t-statistic says whether they are
 * distinguishable from noise.
 *
 *   npx tsx tools/experiment.ts [--seeds 8] [--seconds 900] [--out results.json]
 */

import { writeFileSync } from 'node:fs';
import { Simulation } from '../src/sim/simulation.js';

interface ArmResult {
  comprehension: number;
  meanVocabulary: number;
  cohesion: number;
  lexiconSize: number;
  coinedWords: number;
  population: number;
  utterances: number;
  validationAccuracy: number;
  baselineAccuracy: number;
}

/**
 * Runs one arm. Comprehension is measured over the *second half* only, so the
 * warm-up period — during which both arms behave identically by construction —
 * does not dilute the effect.
 */
function runArm(seed: string, seconds: number, modelEnabled: boolean): ArmResult {
  const sim = new Simulation({ world: { seed }, modelEnabled });
  const dt = 1 / 30;
  const steps = Math.round(seconds / dt);
  const half = Math.floor(steps / 2);

  let baselineUnderstood = 0;
  let baselineAudience = 0;
  for (let i = 0; i < steps; i++) {
    sim.tick(dt);
    if (i === half) {
      baselineUnderstood = sim.world.comprehendedCount;
      baselineAudience = sim.world.audienceCount;
    }
  }

  const understood = sim.world.comprehendedCount - baselineUnderstood;
  const audience = sim.world.audienceCount - baselineAudience;
  const stats = sim.stats();

  return {
    comprehension: audience === 0 ? 0 : understood / audience,
    meanVocabulary: stats.meanVocabulary,
    cohesion: stats.cohesion,
    lexiconSize: stats.lexiconSize,
    coinedWords: stats.coinedWords,
    population: stats.population,
    utterances: stats.utterances,
    validationAccuracy: stats.model.validationAccuracy,
    baselineAccuracy: stats.model.baselineAccuracy,
  };
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(values.reduce((acc, v) => acc + (v - m) ** 2, 0) / (values.length - 1));
}

/** Paired t-statistic for the per-seed differences. */
function pairedT(differences: number[]): number {
  const sd = stdDev(differences);
  if (sd === 0) return 0;
  return mean(differences) / (sd / Math.sqrt(differences.length));
}

function flag(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

function main(): void {
  const seedCount = Number(flag('seeds', '8'));
  const seconds = Number(flag('seconds', '900'));
  const out = flag('out', '');

  const rows: { seed: string; control: ArmResult; treatment: ArmResult }[] = [];
  for (let i = 0; i < seedCount; i++) {
    const seed = `exp-${i}`;
    // Identical world seed in both arms — this is the pairing.
    const control = runArm(seed, seconds, false);
    const treatment = runArm(seed, seconds, true);
    rows.push({ seed, control, treatment });
    process.stdout.write(
      `${seed}: control=${(control.comprehension * 100).toFixed(1)}%  ` +
        `model=${(treatment.comprehension * 100).toFixed(1)}%\n`,
    );
  }

  const differences = rows.map((row) => row.treatment.comprehension - row.control.comprehension);
  const t = pairedT(differences);
  const controlMean = mean(rows.map((row) => row.control.comprehension));
  const treatmentMean = mean(rows.map((row) => row.treatment.comprehension));

  const summary = {
    seeds: seedCount,
    secondsPerRun: seconds,
    metric: 'comprehension rate over the second half of each run',
    control: { mean: controlMean, sd: stdDev(rows.map((r) => r.control.comprehension)) },
    treatment: { mean: treatmentMean, sd: stdDev(rows.map((r) => r.treatment.comprehension)) },
    meanDifference: mean(differences),
    sdDifference: stdDev(differences),
    pairedT: t,
    // Two-sided 0.05 critical value for small n; enough to say "distinguishable
    // from noise" without pulling in a stats dependency.
    significantAt05: Math.abs(t) > 2.365,
    modelValidationAccuracy: mean(rows.map((r) => r.treatment.validationAccuracy)),
    modelBaselineAccuracy: mean(rows.map((r) => r.treatment.baselineAccuracy)),
    rows,
  };

  console.info('\n=== paired comparison ===');
  console.info(`control   comprehension: ${(controlMean * 100).toFixed(2)}%`);
  console.info(`treatment comprehension: ${(treatmentMean * 100).toFixed(2)}%`);
  console.info(
    `difference: ${(summary.meanDifference * 100).toFixed(2)} pp  ` +
      `(sd ${(summary.sdDifference * 100).toFixed(2)} pp, t=${t.toFixed(2)}, ` +
      `n=${seedCount}) → ${summary.significantAt05 ? 'significant' : 'not significant'} at 0.05`,
  );
  console.info(
    `model held-out accuracy: ${(summary.modelValidationAccuracy * 100).toFixed(1)}% ` +
      `vs majority baseline ${(summary.modelBaselineAccuracy * 100).toFixed(1)}%`,
  );

  if (out) {
    writeFileSync(out, JSON.stringify(summary, null, 2));
    console.info(`\nwrote ${out}`);
  }
}

main();
