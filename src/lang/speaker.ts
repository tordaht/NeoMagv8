/**
 * Production: turning an intent into a sentence.
 *
 * The pipeline is intent → frame → lexeme selection → morphological
 * realisation → style. Crucially, lexemes come from the *speaker's own*
 * vocabulary weighted by how well it knows them and how often they have
 * worked before, so two agents with different histories say different things
 * for the same reason — which is what makes the language evolve.
 *
 * Several candidates are produced per turn and handed to a scorer. With the
 * model disabled the scorer falls back to mean word strength; with it enabled
 * the network predicts which candidate the listener is most likely to
 * understand. That difference is the measurable effect in `tools/experiment.ts`.
 */

import type { Rng } from '../core/rng.js';
import type { Bacterium } from '../core/types.js';
import {
  FRAMES,
  realizeFrame,
  type BuiltClause,
  type Frame,
  type PickRequest,
} from './grammar.js';
import { incongruityOf, type Intent } from './intent.js';
import type { Lexeme, Lexicon } from './lexicon.js';
import type { Field } from './seed.js';

export interface Candidate {
  clause: BuiltClause;
  frame: Frame;
  register: number;
  incongruity: number;
  /** Modal semantic field of the content words actually used. */
  field: Field;
  /** Mean strength of the content words, in [0, 1]. */
  meanStrength: number;
}

/**
 * Builds the lexeme chooser for one speaker.
 *
 * Words are weighted by `strength²` so a firmly held word dominates a
 * half-learned one, and — when the frame asks for a word that has to carry
 * meaning — by the speaker's own past success with it.
 */
function makePicker(agent: Bacterium, lexicon: Lexicon, rng: Rng) {
  const known: { lexeme: Lexeme; strength: number; reliability: number }[] = [];
  for (const [id, memory] of agent.vocabulary.entries()) {
    const lexeme = lexicon.get(id);
    if (!lexeme) continue;
    known.push({
      lexeme,
      strength: memory.strength,
      reliability: memory.uses === 0 ? 1 : 1 + memory.successes / memory.uses,
    });
  }

  return (request: PickRequest): Lexeme | null => {
    const gather = (matchField: boolean) => {
      const options: Lexeme[] = [];
      const weights: number[] = [];
      for (const entry of known) {
        const { lexeme } = entry;
        if (lexeme.pos !== request.pos) continue;
        if (request.exclude.has(lexeme.id)) continue;
        // Argument structure is not negotiable: an intransitive verb in a slot
        // that supplies an object yields an ungrammatical clause, not a quirky
        // one, so there is no relaxed pass for it.
        if (request.valency && !request.valency.includes(lexeme.valency)) continue;
        if (request.valence && !request.valence.includes(lexeme.valence)) continue;
        if (matchField && request.field && lexeme.field !== request.field) continue;
        options.push(lexeme);
        weights.push(
          entry.strength * entry.strength * (request.shared ? entry.reliability : 1),
        );
      }
      return { options, weights };
    };

    let { options, weights } = gather(true);
    // No word in the requested field: reach for an imprecise one instead. The
    // listener's field-match term will penalise it, which is the point.
    if (options.length === 0 && request.allowFieldRelaxation) {
      ({ options, weights } = gather(false));
    }
    if (options.length === 0) return null;
    return rng.weighted(options, weights);
  };
}

/** Most common field among the content words used, defaulting to the intent's. */
function modalField(lexemeIds: string[], lexicon: Lexicon, fallback: Field): Field {
  const counts = new Map<Field, number>();
  for (const id of lexemeIds) {
    const lexeme = lexicon.get(id);
    if (!lexeme) continue;
    counts.set(lexeme.field, (counts.get(lexeme.field) ?? 0) + 1);
  }
  let best: Field = fallback;
  let bestCount = 0;
  for (const [field, count] of counts) {
    if (count > bestCount) {
      best = field;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Applies the speaker's style. Deliberately minimal: personality shows up in
 * *which* frames and words get chosen, not in decoration bolted onto the
 * output. Random interjections and emoji were what made the previous system
 * read as noise.
 */
function applyStyle(text: string, agent: Bacterium, frame: Frame): string {
  if (frame.end === '?') return text;
  if (agent.traits.optimism > 0.72 && frame.end !== '!') return text.replace(/\.$/, '!');
  if (agent.traits.optimism < 0.28 && frame.end === '!') return text.replace(/!$/, '.');
  return text;
}

export interface SpeakerDeps {
  lexicon: Lexicon;
  rng: Rng;
}

/**
 * Produces up to `count` distinct candidate utterances for an intent.
 * Returns an empty array when the speaker's vocabulary cannot fill any frame.
 */
export function generateCandidates(
  agent: Bacterium,
  intent: Intent,
  deps: SpeakerDeps,
  count = 3,
): Candidate[] {
  const { lexicon, rng } = deps;
  const pick = makePicker(agent, lexicon, rng);
  const frames = FRAMES[intent.act];
  if (frames.length === 0) return [];

  // Verbose agents lean toward longer frames.
  const desiredLength = 1 + Math.round(agent.traits.verbosity * 2.5);
  const frameWeights = frames.map(
    (frame) => 1 / (1 + Math.abs(frame.parts.length - desiredLength)),
  );

  const seen = new Set<string>();
  const candidates: Candidate[] = [];
  const attempts = count * 3;

  for (let i = 0; i < attempts && candidates.length < count; i++) {
    const frame = rng.weighted(frames, frameWeights);
    const clause = realizeFrame(frame, {
      pick,
      addresseeName: intent.addresseeName,
    });
    if (!clause || seen.has(clause.text)) continue;
    seen.add(clause.text);

    let strength = 0;
    for (const id of clause.lexemeIds) strength += agent.vocabulary.strengthOf(id);
    const meanStrength = clause.lexemeIds.length === 0 ? 0 : strength / clause.lexemeIds.length;

    candidates.push({
      clause: { ...clause, text: applyStyle(clause.text, agent, frame) },
      frame,
      register: frame.register,
      incongruity: incongruityOf(frame.register, intent.urgency),
      field: modalField(clause.lexemeIds, lexicon, intent.field),
      meanStrength,
    });
  }

  return candidates;
}

/**
 * Picks the candidate the speaker expects to land best.
 *
 * `score` is supplied by the caller so the same production path serves both
 * arms of the experiment: heuristic scoring (mean word strength) versus the
 * trained comprehension model.
 */
export function chooseCandidate(
  candidates: Candidate[],
  score: (candidate: Candidate) => number,
): Candidate | null {
  if (candidates.length === 0) return null;
  let best = candidates[0];
  let bestScore = score(best);
  for (let i = 1; i < candidates.length; i++) {
    const value = score(candidates[i]);
    if (value > bestScore) {
      best = candidates[i];
      bestScore = value;
    }
  }
  return best;
}
