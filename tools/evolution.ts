/**
 * Long-run diagnostics for the language itself.
 *
 * `sample.ts` shows what the colony says; this shows whether the language is
 * actually changing. It reports vocabulary growth, whether coined words spread
 * or die, how far the lexicon has drifted from the founding core, whether
 * spatially separated groups develop different vocabularies, and whether the
 * heritable traits are under selection.
 *
 *   npx tsx tools/evolution.ts [--seconds 3600] [--seed neomag]
 */

import { Simulation } from '../src/sim/simulation.js';
import type { Bacterium } from '../src/core/types.js';
import { lexicalOverlap } from '../src/lang/lexicon.js';

function flag(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

/** Groups agents by proximity with a single-link sweep. */
function spatialClusters(agents: Bacterium[], radius: number): Bacterium[][] {
  const remaining = new Set(agents);
  const clusters: Bacterium[][] = [];
  while (remaining.size > 0) {
    const seed = remaining.values().next().value as Bacterium;
    remaining.delete(seed);
    const cluster = [seed];
    const queue = [seed];
    while (queue.length > 0) {
      const current = queue.pop() as Bacterium;
      for (const candidate of [...remaining]) {
        if (Math.hypot(candidate.x - current.x, candidate.y - current.y) <= radius) {
          remaining.delete(candidate);
          cluster.push(candidate);
          queue.push(candidate);
        }
      }
    }
    clusters.push(cluster);
  }
  return clusters.sort((a, b) => b.length - a.length);
}

function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}

function main(): void {
  const seconds = Number(flag('seconds', '3600'));
  const seed = flag('seed', 'neomag');
  const sim = new Simulation({ world: { seed } });
  const dt = 1 / 30;
  const steps = Math.round(seconds / dt);

  const coinedAt = new Map<string, number>();
  sim.subscribe((event) => {
    if (event.type === 'coined') coinedAt.set(event.lexemeId, sim.world.time);
  });

  const timeline: string[] = [];
  const sampleEvery = Math.round(steps / 8);

  for (let i = 0; i < steps; i++) {
    sim.tick(dt);
    if (i > 0 && i % sampleEvery === 0) {
      const stats = sim.stats();
      timeline.push(
        `${String(Math.round(stats.time)).padStart(5)}s  ` +
          `pop=${String(stats.population).padStart(3)}  ` +
          `vocab=${stats.meanVocabulary.toFixed(1).padStart(5)}  ` +
          `lexicon=${String(stats.lexiconSize).padStart(4)} (+${stats.coinedWords})  ` +
          `comp=${(stats.comprehensionRate * 100).toFixed(1).padStart(5)}%  ` +
          `cohesion=${stats.cohesion.toFixed(3)}  ` +
          `gen=${stats.generation}`,
      );
    }
  }

  const agents = sim.world.bacteria;
  console.info(`seed=${seed}  ${seconds}s\n`);
  console.info('--- timeline ---');
  for (const row of timeline) console.info(row);

  // --- how far the language has moved from where it started -----------------
  const coreIds = new Set(sim.core.map((lexeme) => lexeme.id));
  const known = new Map<string, number>();
  for (const agent of agents) {
    for (const id of agent.vocabulary.ids()) known.set(id, (known.get(id) ?? 0) + 1);
  }
  const coreSurviving = [...coreIds].filter((id) => (known.get(id) ?? 0) > agents.length * 0.2);
  const coined = [...known.entries()].filter(([id]) => sim.lexicon.get(id)?.coined);
  const establishedCoinages = coined.filter(([, count]) => count > agents.length * 0.2);

  console.info('\n--- lexical turnover ---');
  console.info(
    `founding core: ${coreSurviving.length}/${sim.core.length} words still held by >20% of the colony`,
  );
  console.info(
    `coinages: ${coinedAt.size} minted, ${coined.length} still known by anyone, ` +
      `${establishedCoinages.length} established (>20% of the colony)`,
  );
  const established = establishedCoinages
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([id, count]) => {
      const lexeme = sim.lexicon.get(id);
      const age = sim.world.time - (coinedAt.get(id) ?? 0);
      return `${lexeme?.form} (${((count / agents.length) * 100).toFixed(0)}%, ${age.toFixed(0)}s old)`;
    });
  console.info(established.join(', ') || '(none established)');

  // --- do isolated groups diverge? ------------------------------------------
  const clusters = spatialClusters(agents, sim.world.config.hearingRadius);
  const big = clusters.filter((cluster) => cluster.length >= 4);
  console.info('\n--- dialects ---');
  console.info(
    `${clusters.length} spatial clusters (${big.length} with >=4 members): ` +
      clusters
        .slice(0, 6)
        .map((c) => c.length)
        .join(', '),
  );

  if (big.length >= 2) {
    const within: number[] = [];
    for (const cluster of big) {
      for (let i = 0; i < cluster.length; i++) {
        for (let j = i + 1; j < cluster.length; j++) {
          within.push(lexicalOverlap(cluster[i].vocabulary, cluster[j].vocabulary));
        }
      }
    }
    const between: number[] = [];
    for (let a = 0; a < big.length; a++) {
      for (let b = a + 1; b < big.length; b++) {
        for (const one of big[a]) {
          for (const other of big[b]) {
            between.push(lexicalOverlap(one.vocabulary, other.vocabulary));
          }
        }
      }
    }
    console.info(
      `within-cluster overlap ${mean(within).toFixed(3)} vs between-cluster ` +
        `${mean(between).toFixed(3)}  →  divergence ${(mean(within) - mean(between)).toFixed(3)}`,
    );
  } else {
    console.info('one connected group — no separated dialects to compare');
  }

  // --- are the traits under selection? --------------------------------------
  console.info('\n--- traits (founders vs now) ---');
  const now = {
    curiosity: mean(agents.map((a) => a.traits.curiosity)),
    sociability: mean(agents.map((a) => a.traits.sociability)),
    optimism: mean(agents.map((a) => a.traits.optimism)),
    verbosity: mean(agents.map((a) => a.traits.verbosity)),
    humor: mean(agents.map((a) => a.traits.humor)),
  };
  // Founders were drawn uniformly, so the expected starting mean is the midpoint
  // of each trait's draw range.
  const founding = {
    curiosity: 0.55,
    sociability: 0.575,
    optimism: 0.5,
    verbosity: 0.55,
    humor: 0.45,
  };
  for (const key of Object.keys(now) as (keyof typeof now)[]) {
    const drift = now[key] - founding[key];
    console.info(
      `${key.padEnd(12)} ${founding[key].toFixed(2)} → ${now[key].toFixed(2)}  ` +
        `(${drift >= 0 ? '+' : ''}${drift.toFixed(3)})`,
    );
  }

  const stats = sim.stats();
  console.info('\n--- final ---');
  console.info(
    `population=${stats.population} generation=${stats.generation} ` +
      `comprehension=${(stats.comprehensionRate * 100).toFixed(1)}% ` +
      `cohesion=${stats.cohesion.toFixed(3)} incongruity=${(stats.incongruityRate * 100).toFixed(1)}%`,
  );
  console.info(
    `model: valAcc=${(stats.model.validationAccuracy * 100).toFixed(1)}% ` +
      `baseline=${(stats.model.baselineAccuracy * 100).toFixed(1)}%`,
  );
}

main();
