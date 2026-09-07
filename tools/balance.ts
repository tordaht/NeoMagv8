/**
 * Ecology tuning harness.
 *
 * Runs the world headless across several seeds and reports whether the
 * population settles instead of exploding or dying out. Used to pick the
 * defaults in `world.ts`; kept in the repo so the numbers can be re-derived
 * rather than guessed at again.
 *
 *   npx tsx tools/balance.ts [--seconds 1200] [--seeds 6]
 */

import { DEFAULT_CONFIG, World, type WorldConfig } from '../src/core/world.js';

interface RunResult {
  seed: string;
  extinct: boolean;
  extinctAt: number | null;
  peak: number;
  final: number;
  meanLate: number;
  cvLate: number;
  meanEnergy: number;
  nutrients: number;
  waste: number;
}

function runOne(seed: string, seconds: number, overrides: Partial<WorldConfig>): RunResult {
  const world = new World({ ...overrides, seed });
  const dt = 1 / 30;
  const steps = Math.round(seconds / dt);
  const lateFrom = Math.floor(steps * 0.6);
  const late: number[] = [];
  let peak = world.bacteria.length;
  let extinctAt: number | null = null;

  for (let i = 0; i < steps; i++) {
    world.tick(dt);
    peak = Math.max(peak, world.bacteria.length);
    if (world.bacteria.length === 0 && extinctAt === null) extinctAt = world.time;
    if (i >= lateFrom && i % 30 === 0) late.push(world.bacteria.length);
  }

  const meanLate = late.reduce((a, b) => a + b, 0) / Math.max(1, late.length);
  const variance =
    late.reduce((acc, value) => acc + (value - meanLate) ** 2, 0) / Math.max(1, late.length);
  const meanEnergy =
    world.bacteria.reduce((acc, agent) => acc + agent.energy, 0) /
    Math.max(1, world.bacteria.length);

  return {
    seed,
    extinct: world.bacteria.length === 0,
    extinctAt,
    peak,
    final: world.bacteria.length,
    meanLate,
    cvLate: meanLate === 0 ? Infinity : Math.sqrt(variance) / meanLate,
    meanEnergy,
    nutrients: world.environment.nutrients,
    waste: world.environment.waste,
  };
}

function main(): void {
  const args = process.argv.slice(2);
  const readFlag = (name: string, fallback: number): number => {
    const index = args.indexOf(`--${name}`);
    return index === -1 ? fallback : Number(args[index + 1]);
  };
  const seconds = readFlag('seconds', 1200);
  const seedCount = readFlag('seeds', 6);

  const rows: RunResult[] = [];
  for (let i = 0; i < seedCount; i++) rows.push(runOne(`balance-${i}`, seconds, {}));

  const pad = (value: string | number, width: number): string => String(value).padStart(width);
  console.info(`Ecology check — ${seconds}s per run, dt=1/30, ${seedCount} seeds`);
  console.info(
    [
      pad('seed', 12),
      pad('peak', 6),
      pad('final', 6),
      pad('mean(late)', 11),
      pad('cv(late)', 9),
      pad('energy', 7),
      pad('nutr', 6),
      pad('waste', 6),
    ].join(' '),
  );
  for (const row of rows) {
    console.info(
      [
        pad(row.seed, 12),
        pad(row.peak, 6),
        pad(row.final, 6),
        pad(row.meanLate.toFixed(1), 11),
        pad(row.cvLate.toFixed(3), 9),
        pad(row.meanEnergy.toFixed(2), 7),
        pad(row.nutrients.toFixed(1), 6),
        pad(row.waste.toFixed(1), 6),
      ].join(' '),
    );
  }

  const extinctions = rows.filter((row) => row.extinct).length;
  const meanPop = rows.reduce((acc, row) => acc + row.meanLate, 0) / rows.length;
  const meanCv = rows.reduce((acc, row) => acc + row.cvLate, 0) / rows.length;
  console.info(
    `\nextinctions=${extinctions}/${rows.length}  mean population=${meanPop.toFixed(1)}  ` +
      `mean CV=${meanCv.toFixed(3)}  (soft capacity=${DEFAULT_CONFIG.softCapacity})`,
  );
  if (extinctions > 0) {
    console.error('FAIL: at least one seed went extinct.');
    process.exitCode = 1;
  }
}

main();
