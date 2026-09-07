/**
 * Deciding *what* an agent wants to say, before deciding how to say it.
 *
 * This is the layer the previous implementation lacked: it selected a template
 * at random, so the utterance had no relationship to the speaker's situation.
 * Here the speech act is a function of energy, neighbours, waste and open
 * questions, and the only randomness is which of the plausible acts wins.
 *
 * It is also where the comedy comes from. Register — how abstract the framing
 * is — is normally suppressed by urgency: a starving cell complains, it does
 * not philosophise. The heritable `humor` trait deliberately breaks that
 * coupling, producing an incongruity the metrics can measure rather than a
 * random absurd word bolted onto a sentence.
 */

import type { Rng } from '../core/rng.js';
import type { Bacterium, SpeechAct } from '../core/types.js';
import type { Field } from './seed.js';

export interface IntentContext {
  /** Peers within hearing range, nearest first. */
  listeners: Bacterium[];
  /** Environmental waste level, normalised to roughly [0, 1]. */
  wasteStress: number;
  time: number;
}

export interface Intent {
  act: SpeechAct;
  field: Field;
  /** The speaker's real need level in [0, 1]; 1 means about to starve. */
  urgency: number;
  addressee: Bacterium | null;
  /**
   * Name used in vocative slots. Separate from `addressee` so the player can be
   * addressed by name without being an agent in the world.
   */
  addresseeName: string | null;
}

/** Energy below which an agent counts as fully urgent. */
const COMFORTABLE_ENERGY = 1.3;

export function urgencyOf(agent: Bacterium): number {
  return Math.min(1, Math.max(0, 1 - agent.energy / COMFORTABLE_ENERGY));
}

/** Default topic field for each act, used when the frame does not pin one. */
const ACT_FIELD: Record<SpeechAct, Field> = {
  greet: 'social',
  request: 'need',
  complain: 'need',
  inform: 'space',
  offer: 'social',
  ask: 'cognition',
  warn: 'environment',
  reflect: 'existence',
  celebrate: 'body',
};

/**
 * Scores every speech act against the agent's current situation and samples
 * one proportionally. Returns null when the agent has nothing worth saying.
 */
export function chooseIntent(
  agent: Bacterium,
  ctx: IntentContext,
  rng: Rng,
): Intent | null {
  const urgency = urgencyOf(agent);
  const { traits } = agent;
  const hasAudience = ctx.listeners.length > 0;

  const strangers = ctx.listeners.filter((peer) => !agent.bonds.has(peer.id));
  const justDivided = ctx.time - agent.lastDivision < 12;

  const weights: Record<SpeechAct, number> = {
    // Distress scales super-linearly: a comfortable cell rarely complains.
    complain: urgency * urgency * 2.5,
    request: hasAudience ? urgency * 2 : 0.05,
    greet: strangers.length > 0 ? traits.sociability * 1.6 : 0.05,
    offer: hasAudience ? Math.max(0, 1 - urgency) * traits.sociability * 1.2 : 0,
    inform: hasAudience ? 0.7 : 0.2,
    ask: agent.curiousAbout.length > 0 ? traits.curiosity * 1.8 : 0.05,
    warn: ctx.wasteStress * 2,
    // Reflection is a luxury of the well-fed …
    reflect: traits.curiosity * (0.3 + 0.9 * (1 - urgency)),
    celebrate: justDivided ? 1.5 : 0,
  };

  // … except for humorous lineages, which reflect precisely when they should
  // be looking for food. This is the incongruity generator.
  if (urgency > 0.55) {
    weights.reflect += traits.humor * urgency * 1.8;
  }

  const acts = Object.keys(weights) as SpeechAct[];
  const values = acts.map((act) => weights[act]);
  const total = values.reduce((a, b) => a + b, 0);
  if (total <= 0.001) return null;

  const act = rng.weighted(acts, values);

  // Address the nearest peer; greetings go to a stranger by preference.
  let addressee: Bacterium | null = null;
  if (hasAudience) {
    addressee = act === 'greet' && strangers.length > 0 ? strangers[0] : ctx.listeners[0];
  }

  return {
    act,
    field: ACT_FIELD[act],
    urgency,
    addressee,
    addresseeName: addressee?.name ?? null,
  };
}

/**
 * How far an utterance's framing overshoots what the speaker's situation calls
 * for. Zero is apt; near one is a cell discussing the nature of existence
 * while it starves.
 *
 * Deliberately one-sided. Under-shooting — being blunt when comfortable — is
 * ordinary, not funny, and scoring it symmetrically flagged every relaxed
 * greeting as comedy.
 */
export function incongruityOf(register: number, urgency: number): number {
  return Math.max(0, register - (1 - urgency));
}
