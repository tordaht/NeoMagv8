/**
 * Shared simulation types.
 *
 * Kept free of behaviour so the ecology (`world.ts`), the language layer
 * (`src/lang`) and the model (`src/ml`) can all depend on them without
 * depending on each other.
 */

import type { Vocabulary } from '../lang/lexicon.js';
import type { Field } from '../lang/seed.js';

/**
 * Heritable personality. Each value is in [0, 1] and is passed to offspring
 * with a small mutation, so traits are themselves under selection.
 */
export interface Traits {
  /** Willingness to adopt unfamiliar words. */
  curiosity: number;
  /** How often the agent initiates speech, and how strongly it clusters. */
  sociability: number;
  /** Affective colouring of what it says. */
  optimism: number;
  /** How many content words it packs into an utterance. */
  verbosity: number;
  /** Tolerance for saying something incongruous with its own state. */
  humor: number;
}

export type SpeechAct =
  | 'greet'
  | 'request'
  | 'complain'
  | 'inform'
  | 'offer'
  | 'ask'
  | 'warn'
  | 'reflect'
  | 'celebrate';

/** A produced utterance plus everything needed to score and explain it. */
export interface Utterance {
  id: number;
  time: number;
  speakerId: string;
  speakerName: string;
  text: string;
  act: SpeechAct;
  field: Field;
  /** Content lexemes actually used, in order. */
  lexemeIds: string[];
  /** Number of inflectional suffixes realised — morphological complexity. */
  suffixCount: number;
  /** 0 = blunt and concrete, 1 = elaborate and abstract. */
  register: number;
  /** The speaker's real need level at the time, in [0, 1]. */
  urgency: number;
  /**
   * Mismatch between how the utterance is framed and the speaker's actual
   * situation. High values are where the comedy lives: philosophising while
   * starving is funny; philosophising while comfortable is not.
   */
  incongruity: number;
  audience: AudienceOutcome[];
}

export interface AudienceOutcome {
  listenerId: string;
  listenerName: string;
  understood: boolean;
  /** Ground-truth comprehension score in [0, 1]. */
  score: number;
  /** What the model predicted before the utterance was produced, if enabled. */
  predicted: number | null;
}

export interface Bacterium {
  id: string;
  name: string;
  generation: number;
  bornAt: number;
  age: number;
  energy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  traits: Traits;
  vocabulary: Vocabulary;
  /** Social bond strength per peer id, in [0, 1]. */
  bonds: Map<string, number>;
  /** Seconds until this agent may speak again. */
  speechTimer: number;
  lastUtterance: string | null;
  /** Lexeme ids heard but not yet acquired — the agent's open questions. */
  curiousAbout: string[];
  /** Simulation time of the most recent division, for celebration intents. */
  lastDivision: number;
  spoken: number;
  understood: number;
  misunderstood: number;
  alive: boolean;
}

export type DeathCause = 'starvation' | 'age' | 'crowding';

export type WorldEvent =
  | { type: 'utterance'; utterance: Utterance }
  | { type: 'birth'; child: Bacterium; parentId: string }
  | { type: 'death'; id: string; name: string; cause: DeathCause }
  | { type: 'coined'; lexemeId: string; form: string; byId: string; byName: string };

export interface EnvironmentState {
  /** Shared nutrient pool. */
  nutrients: number;
  /** Metabolic waste; suppresses uptake until it decays. */
  waste: number;
}

/** Everything the UI and the metrics pipeline read each frame. */
export interface WorldSnapshot {
  time: number;
  tick: number;
  population: number;
  births: number;
  deaths: number;
  generation: number;
  environment: EnvironmentState;
  meanEnergy: number;
  meanVocabulary: number;
  lexiconSize: number;
  coinedWords: number;
  utterances: number;
  comprehensionRate: number;
  /** Mean pairwise lexical overlap — 1 is one language, 0 is mutual silence. */
  cohesion: number;
}
