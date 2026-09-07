/**
 * Prints a transcript of a headless run.
 *
 * The direct counterpart of the probe that exposed the old system saying
 * "Evet… / Açım… / Yardım…" to every input: run it after any change to the
 * language layer and read what the colony actually produces.
 *
 *   npx tsx tools/sample.ts [--seconds 400] [--seed neomag] [--lines 30]
 */

import { Simulation } from '../src/sim/simulation.js';
import type { Utterance } from '../src/core/types.js';

function flag(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

function describe(utterance: Utterance): string {
  const hits = utterance.audience.filter((entry) => entry.understood).length;
  const reach = utterance.audience.length;
  const comedy = utterance.incongruity > 0.5 ? ' ✦' : '';
  return (
    `${String(Math.round(utterance.time)).padStart(4)}s  ` +
    `${utterance.speakerName.padEnd(8)} ${utterance.text.padEnd(34)} ` +
    `[${utterance.act}/${utterance.field}] ${hits}/${reach}${comedy}`
  );
}

function main(): void {
  const seconds = Number(flag('seconds', '400'));
  const seed = flag('seed', 'neomag');
  const lines = Number(flag('lines', '30'));

  const sim = new Simulation({ world: { seed } });
  const dt = 1 / 30;
  const all: Utterance[] = [];
  const coinages: string[] = [];
  sim.subscribe((event) => {
    if (event.type === 'utterance') all.push(event.utterance);
    if (event.type === 'coined') {
      coinages.push(`${event.form} (by ${event.byName})`);
    }
  });

  for (let i = 0; i < Math.round(seconds / dt); i++) sim.tick(dt);

  console.info(`seed=${seed}  ${seconds}s  utterances=${all.length}\n`);
  console.info('--- first 10 ---');
  for (const utterance of all.slice(0, 10)) console.info(describe(utterance));
  console.info(`\n--- last ${lines} ---`);
  for (const utterance of all.slice(-lines)) console.info(describe(utterance));

  console.info(`\n--- coined words (${coinages.length}) ---`);
  console.info(coinages.slice(-20).join(', ') || '(none)');

  const stats = sim.stats();
  console.info('\n--- stats ---');
  console.info(
    `population=${stats.population}  meanVocabulary=${stats.meanVocabulary.toFixed(1)}  ` +
      `lexicon=${stats.lexiconSize} (${stats.coinedWords} coined)`,
  );
  console.info(
    `comprehension=${(stats.comprehensionRate * 100).toFixed(1)}%  ` +
      `cohesion=${stats.cohesion.toFixed(3)}  ` +
      `incongruity=${(stats.incongruityRate * 100).toFixed(1)}%`,
  );
  console.info(
    `model: observed=${stats.model.observed} updates=${stats.model.updates} ` +
      `valAcc=${(stats.model.validationAccuracy * 100).toFixed(1)}% ` +
      `baseline=${(stats.model.baselineAccuracy * 100).toFixed(1)}% ` +
      `ready=${stats.model.ready}`,
  );
}

main();
