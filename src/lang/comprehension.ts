/**
 * Comprehension, learning and transmission — the selection step of the
 * language evolution loop.
 *
 * `groundTruthScore` is the world's rule for whether a listener understands an
 * utterance. It reads the listener's internal state, which the *speaker*
 * cannot see; `observableFeatures` therefore exposes only what a speaker could
 * plausibly perceive (its own confidence in the words, the bond, the distance,
 * how elaborate the sentence is). The model in `src/ml` is trained on those
 * observable features against the ground-truth outcome, so it is learning a
 * genuinely partial-information problem rather than being handed the answer.
 */

import type { Rng } from '../core/rng.js';
import type { Bacterium } from '../core/types.js';
import type { Lexicon } from './lexicon.js';
import type { Candidate } from './speaker.js';

export const FEATURE_COUNT = 15;

/** Energy at which a listener is fully attentive. */
const COMFORTABLE_ENERGY = 1.2;

/**
 * Baseline comprehension from context and delivery, independent of the words:
 * an agent can tell that a neighbour is distressed without parsing the clause.
 */
const PRAGMATIC_FLOOR = 0.15;

/** Smoothing for the pairwise communication-success estimate. */
const BOND_RATE = 0.15;

/**
 * Spreading activation applied to same-field words when an utterance lands.
 * Small — roughly a thirtieth of a direct reinforcement — but applied far more
 * often, which is what lets a vocabulary of thirty-plus words persist.
 */
const PRIMING = 0.006;

export interface ChannelContext {
  bond: number;
  distance: number;
  hearingRadius: number;
  energyCap: number;
}

/** Mean strength the listener assigns to the utterance's content words. */
function listenerFamiliarity(listener: Bacterium, lexemeIds: string[]): number {
  if (lexemeIds.length === 0) return 0.5;
  let total = 0;
  for (const id of lexemeIds) total += listener.vocabulary.strengthOf(id);
  return total / lexemeIds.length;
}

/** Listener's average grasp of the field the utterance is about. */
function fieldFamiliarity(listener: Bacterium, lexicon: Lexicon, field: string): number {
  let total = 0;
  let count = 0;
  for (const [id, memory] of listener.vocabulary.entries()) {
    const lexeme = lexicon.get(id);
    if (!lexeme || lexeme.field !== field) continue;
    total += memory.strength;
    count++;
  }
  return count === 0 ? 0 : total / count;
}

/**
 * Probability that `listener` understands `candidate`.
 *
 * Shared vocabulary dominates; topic familiarity and social bond help at the
 * margin; attention, morphological complexity and distance scale the result.
 * A small floor stands for what gets across from context and delivery even
 * when the words do not land.
 *
 * The constants are calibrated, not guessed: comprehension feeds back into
 * word strength, which feeds back into comprehension, so the system settles at
 * a fixed point. An earlier setting put that point near 0.23, where the
 * majority-class baseline was 81% and the model had nothing to learn; these
 * values put it near 0.5, which is both a livelier colony and a balanced
 * classification problem.
 */
export function groundTruthScore(
  listener: Bacterium,
  candidate: Candidate,
  lexicon: Lexicon,
  ctx: ChannelContext,
): number {
  const known = listenerFamiliarity(listener, candidate.clause.lexemeIds);
  const field = fieldFamiliarity(listener, lexicon, candidate.field);
  // Normalised against a comfortable energy level, not the hard cap: agents
  // spend their lives near 0.8, so dividing by the cap made everyone permanently
  // inattentive.
  const attention = 0.75 + 0.25 * Math.min(1, listener.energy / COMFORTABLE_ENERGY);
  // Every extra suffix is another thing that can be misparsed.
  const complexity = 1 / (1 + 0.07 * candidate.clause.suffixCount);
  const proximity = 1 - 0.15 * Math.min(1, ctx.distance / ctx.hearingRadius);

  const raw =
    PRAGMATIC_FLOOR +
    (0.6 * known + 0.15 * field + 0.1 * ctx.bond) * attention * complexity * proximity;
  return Math.min(1, Math.max(0, raw));
}

/**
 * The speaker's-eye view of the same situation, as a fixed-length vector.
 *
 * Deliberately excludes anything about the listener's vocabulary: a speaker
 * cannot read minds, and a model given that would be measuring nothing.
 */
export function observableFeatures(
  speaker: Bacterium,
  listener: Bacterium,
  candidate: Candidate,
  ctx: ChannelContext,
): Float64Array {
  const ids = candidate.clause.lexemeIds;
  let minStrength = 1;
  let reliability = 0;
  for (const id of ids) {
    const memory = speaker.vocabulary.get(id);
    const strength = memory?.strength ?? 0;
    if (strength < minStrength) minStrength = strength;
    reliability += memory && memory.uses > 0 ? memory.successes / memory.uses : 0.5;
  }
  if (ids.length === 0) minStrength = 0;

  const features = new Float64Array(FEATURE_COUNT);
  features[0] = candidate.meanStrength;
  features[1] = minStrength;
  features[2] = ids.length === 0 ? 0.5 : reliability / ids.length;
  features[3] = Math.min(1, candidate.clause.suffixCount / 6);
  features[4] = Math.min(1, candidate.clause.text.split(' ').length / 6);
  features[5] = Math.min(1, ids.length / 4);
  features[6] = ctx.bond;
  features[7] = Math.min(1, ctx.distance / ctx.hearingRadius);
  features[8] = Math.min(1, listener.energy / ctx.energyCap);
  features[9] = Math.min(1, speaker.energy / ctx.energyCap);
  features[10] = candidate.register;
  features[11] = speaker.traits.verbosity;
  // The speaker's lifetime hit rate: a useful prior before it knows anything
  // specific about this listener.
  features[12] = speaker.vocabulary.successRate();
  // How much the listener knows, as a coarse proxy. A cell's size tracks its
  // vocabulary, so this is observable from outside; it is not the listener's
  // strength on *these* words, which stays hidden.
  features[13] = Math.min(1, listener.vocabulary.size() / 60);
  features[14] = Math.min(1, speaker.vocabulary.size() / 60);
  return features;
}

export interface ReceiveResult {
  understood: boolean;
  score: number;
  /** Lexeme ids the listener acquired from this utterance. */
  acquired: string[];
}

/**
 * Delivers an utterance to one listener: rolls comprehension, reinforces both
 * parties' vocabularies, updates the social bond and — the horizontal
 * transmission step — may teach the listener a word it did not have.
 */
export function receive(
  speaker: Bacterium,
  listener: Bacterium,
  candidate: Candidate,
  lexicon: Lexicon,
  ctx: ChannelContext,
  rng: Rng,
  time: number,
): ReceiveResult {
  const score = groundTruthScore(listener, candidate, lexicon, ctx);
  const understood = rng.bool(score);
  const ids = candidate.clause.lexemeIds;

  // Selection: words that carried a successful utterance get stronger for both
  // speaker and listener; words that failed weaken and eventually drop out.
  for (const id of ids) {
    speaker.vocabulary.reinforce(id, understood);
    if (listener.vocabulary.knows(id)) listener.vocabulary.reinforce(id, understood);
  }

  // Spreading activation: talking about food keeps the rest of the food
  // vocabulary alive on both sides of the exchange.
  if (understood) {
    for (const party of [speaker, listener]) {
      for (const [id] of party.vocabulary.entries()) {
        if (ids.includes(id)) continue;
        if (lexicon.get(id)?.field === candidate.field) party.vocabulary.prime(id, PRIMING);
      }
    }
  }

  // Cross-situational learning: an unfamiliar word is inferable when the rest
  // of the sentence lands, so acquisition scales with how much did land.
  const acquired: string[] = [];
  const context = listenerFamiliarity(listener, ids.filter((id) => listener.vocabulary.knows(id)));
  const chance = listener.traits.curiosity * (0.12 + 0.55 * (understood ? context : context * 0.4));
  for (const id of ids) {
    if (listener.vocabulary.knows(id)) continue;
    if (rng.bool(chance)) {
      listener.vocabulary.learn(id, time, 0.3);
      acquired.push(id);
    } else if (!listener.curiousAbout.includes(id)) {
      listener.curiousAbout.push(id);
      if (listener.curiousAbout.length > 6) listener.curiousAbout.shift();
    }
  }
  // A word once acquired is no longer an open question.
  if (acquired.length > 0) {
    listener.curiousAbout = listener.curiousAbout.filter((id) => !acquired.includes(id));
  }

  // The bond is an exponential moving average of how well this pair actually
  // communicates, not a counter. An additive +0.06/-0.02 version saturated at 1
  // for almost every pair within a minute, which both flattened its effect on
  // comprehension and destroyed the only strongly predictive feature the
  // speaker could observe.
  const bond = ctx.bond + ((understood ? 1 : 0) - ctx.bond) * BOND_RATE;
  const clamped = Math.min(1, Math.max(0, bond));
  listener.bonds.set(speaker.id, clamped);
  speaker.bonds.set(listener.id, clamped);

  if (understood) {
    speaker.understood += 1;
    listener.understood += 1;
  } else {
    speaker.misunderstood += 1;
  }

  return { understood, score, acquired };
}
