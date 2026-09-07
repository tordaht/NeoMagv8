import { describe, expect, it } from 'vitest';
import { Simulation, type SimulationOptions } from '../src/sim/simulation.js';
import type { Utterance } from '../src/core/types.js';

const DT = 1 / 30;

function run(seconds: number, options: Partial<SimulationOptions> = {}) {
  const sim = new Simulation(options);
  const utterances: Utterance[] = [];
  const coined: string[] = [];
  sim.subscribe((event) => {
    if (event.type === 'utterance') utterances.push(event.utterance);
    if (event.type === 'coined') coined.push(event.form);
  });
  for (let i = 0; i < Math.round(seconds / DT); i++) sim.tick(DT);
  return { sim, utterances, coined };
}

describe('simulation', () => {
  it('actually reaches the language layer', () => {
    // The defect this replaces: a second `generateBacteriaResponse` declaration
    // shadowed the real one, so the entire language engine was unreachable and
    // every reply came from a five-string list. If the wiring ever breaks
    // again, this fails.
    const { utterances } = run(200, { world: { seed: 'reachable' } });
    expect(utterances.length).toBeGreaterThan(200);
    expect(new Set(utterances.map((u) => u.text)).size).toBeGreaterThan(50);
  });

  it('produces utterances that depend on the speaker, not on a fixed list', () => {
    const { utterances } = run(300, { world: { seed: 'variety' } });

    const distinct = new Set(utterances.map((u) => u.text));
    const acts = new Set(utterances.map((u) => u.act));
    const speakers = new Set(utterances.map((u) => u.speakerId));

    expect(distinct.size).toBeGreaterThan(80);
    expect(acts.size).toBeGreaterThanOrEqual(6);
    expect(speakers.size).toBeGreaterThan(10);

    // No single sentence dominates the transcript.
    const counts = new Map<string, number>();
    for (const u of utterances) counts.set(u.text, (counts.get(u.text) ?? 0) + 1);
    const commonest = Math.max(...counts.values());
    expect(commonest / utterances.length).toBeLessThan(0.12);
  });

  it('ties what is said to the speaker situation', () => {
    const { utterances } = run(400, { world: { seed: 'situated' } });
    const distress = utterances.filter((u) => u.act === 'complain' || u.act === 'request');
    const generous = utterances.filter((u) => u.act === 'offer');
    expect(distress.length).toBeGreaterThan(10);
    expect(generous.length).toBeGreaterThan(10);

    const meanUrgency = (list: Utterance[]): number =>
      list.reduce((acc, u) => acc + u.urgency, 0) / list.length;
    // Complaints come from hungrier cells than offers do.
    expect(meanUrgency(distress)).toBeGreaterThan(meanUrgency(generous) + 0.1);
  });

  it('emits well-formed Turkish', () => {
    const { utterances } = run(300, { world: { seed: 'wellformed' } });
    for (const utterance of utterances) {
      expect(utterance.text).toMatch(/^[A-ZÇĞİÖŞÜ]/);
      expect(utterance.text).toMatch(/[.!?]$/);
      expect(utterance.text).not.toMatch(/undefined|NaN|\{|\}|\bnull\b/);
      // No doubled spaces or stray separators from the realiser.
      expect(utterance.text).not.toMatch(/ {2}|,,| ,/);
    }
  });

  it('is reproducible from a seed', () => {
    const a = run(150, { world: { seed: 'repeat' } });
    const b = run(150, { world: { seed: 'repeat' } });
    const c = run(150, { world: { seed: 'repeat-other' } });

    const script = (r: typeof a): string =>
      r.utterances.map((u) => `${u.speakerId}:${u.text}`).join('\n');

    expect(script(a)).toBe(script(b));
    expect(script(a)).not.toBe(script(c));
  });

  it('keeps a shared language alive instead of letting it collapse', () => {
    // Independent per-founder seeding drove pairwise overlap to 0.06 and
    // comprehension to 4.5%; the colony stopped understanding itself.
    const { sim } = run(600, { world: { seed: 'cohesion' } });
    const stats = sim.stats();
    expect(stats.population).toBeGreaterThan(10);
    expect(stats.cohesion).toBeGreaterThan(0.35);
    expect(stats.comprehensionRate).toBeGreaterThan(0.35);
    expect(stats.meanVocabulary).toBeGreaterThan(12);
  });

  it('does not let the language contract over a long run', () => {
    // A flat decay, an over-steep retrieval weight and a single fixed topic per
    // speech act combined to shrink the colony's vocabulary from 37 words to 9
    // over a simulated hour, with 8 of 35 founding words and 1 of 63 coinages
    // surviving. Consolidation-scaled decay, a gentler retrieval exponent and
    // semantic priming hold it steady instead.
    const early = run(400, { world: { seed: 'contraction' } });
    const earlyVocabulary = early.sim.stats().meanVocabulary;

    const late = run(1800, { world: { seed: 'contraction' } });
    const stats = late.sim.stats();

    expect(earlyVocabulary).toBeGreaterThan(25);
    // Allowed to drift, not to collapse.
    expect(stats.meanVocabulary).toBeGreaterThan(earlyVocabulary * 0.7);
    expect(stats.lexiconSize).toBeGreaterThan(late.sim.core.length * 2);

    // Coinages must be able to establish themselves, not just be minted.
    const population = late.sim.world.bacteria.length;
    const holders = new Map<string, number>();
    for (const agent of late.sim.world.bacteria) {
      for (const id of agent.vocabulary.ids()) holders.set(id, (holders.get(id) ?? 0) + 1);
    }
    const established = [...holders.entries()].filter(
      ([id, count]) => late.sim.lexicon.get(id)?.coined && count > population * 0.2,
    );
    expect(established.length).toBeGreaterThan(2);
  });

  it('grows the lexicon by derivation', () => {
    const { sim, coined } = run(600, { world: { seed: 'innovation' } });
    expect(coined.length).toBeGreaterThan(3);
    expect(sim.stats().lexiconSize).toBeGreaterThan(sim.core.length);

    for (const form of coined) {
      // Turkish orthography only — the old system spliced stems into strings
      // like "enerjücre" that no morphology could inflect.
      expect(form).toMatch(/^[a-zçğıöşü]+$/);
      expect(form.length).toBeGreaterThan(2);
    }
  });

  it('trains the model on real outcomes and reports honest metrics', () => {
    const { sim } = run(500, { world: { seed: 'model' } });
    const metrics = sim.stats().model;
    expect(metrics.observed).toBeGreaterThan(1000);
    expect(metrics.updates).toBeGreaterThan(50);
    expect(metrics.ready).toBe(true);
    // A balanced problem: if the positive rate were near 0 or 1 the accuracy
    // would be meaningless.
    expect(metrics.positiveRate).toBeGreaterThan(0.25);
    expect(metrics.positiveRate).toBeLessThan(0.85);
    expect(metrics.validationAccuracy).toBeGreaterThan(0.5);
    // Ranking quality is the metric that matters: the model chooses between a
    // speaker's candidates rather than classifying one at a 0.5 threshold.
    expect(metrics.validationAuc).toBeGreaterThan(0.53);
    expect(metrics.validationAuc).toBeLessThanOrEqual(1);
  });

  it('does not claim the model is ready before it is', () => {
    const sim = new Simulation({ world: { seed: 'warmup' } });
    expect(sim.stats().model.ready).toBe(false);
    for (let i = 0; i < 30; i++) sim.tick(DT);
    const early = sim.stats().model;
    if (early.observed < sim.model.options.warmupSamples) expect(early.ready).toBe(false);
  });

  it('caps the transcript so a long run does not grow without bound', () => {
    const { sim } = run(400, { world: { seed: 'transcript' } });
    expect(sim.transcript.length).toBeLessThanOrEqual(sim.options.transcriptSize);
    expect(sim.transcript.length).toBeGreaterThan(10);
  });

  it('lets the player teach the colony a word', () => {
    const sim = new Simulation({ world: { seed: 'teaching' } });
    for (let i = 0; i < Math.round(60 / DT); i++) sim.tick(DT);

    const agent = sim.world.bacteria[0];
    const before = sim.lexicon.size;
    const reply = sim.talkTo(agent.id, 'fotosentez nedir');

    const taught = sim.lexicon.find('fotosentez');
    expect(taught).toBeDefined();
    expect(sim.lexicon.size).toBe(before + 1);
    expect(agent.vocabulary.knows(taught!.id)).toBe(true);
    if (reply) expect(reply.text).toMatch(/[.!?]$/);
  });

  it('ignores talkTo for an agent that is not alive', () => {
    const sim = new Simulation({ world: { seed: 'missing' } });
    expect(sim.talkTo('nobody', 'merhaba')).toBeNull();
  });
});
