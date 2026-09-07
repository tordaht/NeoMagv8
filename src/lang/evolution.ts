/**
 * Lexical innovation and decay.
 *
 * New words are *derived*, not spliced. The previous implementation built
 * vocabulary with `word1.slice(0, -1) + word2.slice(1)`, which produces strings
 * that are not Turkish and cannot be inflected; here a coinage is a real
 * derivational suffix applied to a word the agent already knows, so the result
 * has a part of speech, a meaning related to its parent, and inflects
 * correctly for the rest of the run.
 *
 * Innovation on its own is noise. What makes it evolution is the other half:
 * `decay` removes words that have not been paying their way, so a coinage
 * survives only if it spreads and is understood.
 */

import type { Rng } from '../core/rng.js';
import type { Bacterium } from '../core/types.js';
import { deriveLexeme, derivationsFor, type DerivationSuffix } from './morphology.js';
import type { Lexeme, Lexicon } from './lexicon.js';

/** Human-readable gloss for a coined word, for the inspector panel. */
const GLOSS_TEMPLATE: Record<DerivationSuffix, (parent: string) => string> = {
  lIk: (parent) => `${parent}-ness`,
  CI: (parent) => `${parent}-er`,
  lI: (parent) => `with ${parent}`,
  sIz: (parent) => `without ${parent}`,
  lAn: (parent) => `to become ${parent}`,
  lAş: (parent) => `to turn into ${parent}`,
  mA: (parent) => `act of ${parent}`,
  '(y)Iş': (parent) => `manner of ${parent}`,
};

export interface Coinage {
  lexeme: Lexeme;
  parent: Lexeme;
  suffix: DerivationSuffix;
}

/**
 * Attempts one coinage by `agent`. Returns null when it has no word confident
 * enough to build on, or when the derived form already exists.
 */
export function coinWord(
  agent: Bacterium,
  lexicon: Lexicon,
  rng: Rng,
  time: number,
): Coinage | null {
  // Only well-established words are productive; you do not derive from a word
  // you barely know.
  const candidates: Lexeme[] = [];
  const weights: number[] = [];
  for (const [id, memory] of agent.vocabulary.entries()) {
    if (memory.strength < 0.5) continue;
    const lexeme = lexicon.get(id);
    if (lexeme?.pos !== 'noun' && lexeme?.pos !== 'adj' && lexeme?.pos !== 'verb') continue;
    if (derivationsFor(lexeme.pos).length === 0) continue;
    candidates.push(lexeme);
    weights.push(memory.strength);
  }
  if (candidates.length === 0) return null;

  const parent = rng.weighted(candidates, weights);
  const options = derivationsFor(parent.pos);
  const suffix = rng.pick(options);
  const derived = deriveLexeme(parent.form, suffix, parent.flags);

  if (lexicon.find(derived.form)) return null;

  const lexeme = lexicon.define(
    {
      form: derived.form,
      pos: derived.pos,
      field: parent.field,
      gloss: GLOSS_TEMPLATE[suffix](parent.gloss),
      flags: derived.flags,
    },
    { coined: true, bornAt: time, origin: [parent.id] },
  );

  // The coiner knows its own word well; everyone else has to hear it.
  agent.vocabulary.learn(lexeme.id, time, 0.8);
  return { lexeme, parent, suffix };
}

/**
 * Passive forgetting across the population. Applied on a slow cadence so that
 * words which stop being used — including failed coinages — leave the language.
 */
export function decayVocabularies(agents: readonly Bacterium[], amount: number): void {
  for (const agent of agents) agent.vocabulary.decay(amount);
}

/**
 * Draws the colony's founding language: the subset of the seed lexicon that
 * this particular colony happens to use.
 *
 * A founding population speaks *one* language with individual variation, not
 * a random sample each. Seeding every founder independently from the whole
 * lexicon gave a pairwise overlap of about 0.06 — nobody understood anybody,
 * every word failed, strengths collapsed, and the language died inside a few
 * simulated minutes. Drawing a shared core first is what makes the starting
 * state a language at all.
 */
export function drawCoreLexicon(lexicon: Lexicon, rng: Rng, size: number): Lexeme[] {
  const pool = lexicon.all().filter((lexeme) => !lexeme.coined);
  const byPos = new Map<string, Lexeme[]>();
  for (const lexeme of rng.shuffle([...pool])) {
    const bucket = byPos.get(lexeme.pos) ?? [];
    bucket.push(lexeme);
    byPos.set(lexeme.pos, bucket);
  }

  // The core has to be able to fill every slot the grammar can ask for, so the
  // parts of speech are quota'd rather than sampled uniformly.
  const quotas: [string, number][] = [
    ['noun', Math.round(size * 0.45)],
    ['verb', Math.round(size * 0.35)],
    ['adj', Math.round(size * 0.15)],
    ['interj', Math.max(1, Math.round(size * 0.05))],
  ];

  const core: Lexeme[] = [];
  for (const [pos, quota] of quotas) core.push(...(byPos.get(pos) ?? []).slice(0, quota));

  // Verbs must cover every argument structure the frames require.
  const verbs = byPos.get('verb') ?? [];
  for (const valency of ['intransitive', 'transitive', 'dative', 'ditransitive'] as const) {
    if (core.some((lexeme) => lexeme.pos === 'verb' && lexeme.valency === valency)) continue;
    const rescue = verbs.find((lexeme) => lexeme.valency === valency);
    if (rescue) core.push(rescue);
  }
  return core;
}

/**
 * Gives a founder most of the colony's core plus a few idiosyncratic extras.
 *
 * The shared core makes mutual comprehension possible; the individual
 * variation and the differing strengths are what selection and drift then act
 * on, and what later separates spatially isolated groups into dialects.
 */
export function seedVocabulary(
  agent: Bacterium,
  core: readonly Lexeme[],
  lexicon: Lexicon,
  rng: Rng,
  options: { coreShare?: number; extras?: number } = {},
): void {
  const coreShare = options.coreShare ?? 0.85;
  const extras = options.extras ?? 3;

  for (const lexeme of core) {
    if (!rng.bool(coreShare)) continue;
    agent.vocabulary.learn(lexeme.id, 0, rng.range(0.5, 0.9));
  }

  const outside = lexicon
    .all()
    .filter((lexeme) => !lexeme.coined && !core.includes(lexeme));
  for (const lexeme of rng.shuffle([...outside]).slice(0, extras)) {
    agent.vocabulary.learn(lexeme.id, 0, rng.range(0.3, 0.6));
  }
}
