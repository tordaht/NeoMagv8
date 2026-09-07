/**
 * The composition root.
 *
 * `World` knows ecology, `src/lang` knows language, `src/ml` knows learning;
 * this module is the only place that knows about all three. Keeping the wiring
 * here is what stops the three from drifting into three unrelated programs
 * again — every subsystem is reachable from exactly one call path, and the
 * tests exercise that path.
 */

import { createRng, type Rng } from '../core/rng.js';
import { World, type WorldConfig } from '../core/world.js';
import type { Bacterium, Utterance, WorldEvent, WorldSnapshot } from '../core/types.js';
import { FEATURE_COUNT, observableFeatures, receive } from '../lang/comprehension.js';
import {
  coinWord,
  decayVocabularies,
  drawCoreLexicon,
  seedVocabulary,
} from '../lang/evolution.js';
import { chooseIntent, urgencyOf, type Intent } from '../lang/intent.js';
import { Lexicon, type Lexeme } from '../lang/lexicon.js';
import { chooseCandidate, generateCandidates, type Candidate } from '../lang/speaker.js';
import type { Field } from '../lang/seed.js';
import { ComprehensionModel, type ModelMetrics } from '../ml/model.js';

export interface SimulationOptions {
  world: Partial<WorldConfig>;
  /** Size of the colony's shared founding lexicon. */
  coreLexiconSize: number;
  /** Probability a given founder knows each core word. */
  coreShare: number;
  /** Whether the model is allowed to steer utterance choice once warmed up. */
  modelEnabled: boolean;
  /** Coinage attempts per agent per second, scaled by curiosity. */
  coinRate: number;
  /** Seconds between passive forgetting sweeps. */
  decayInterval: number;
  decayAmount: number;
  /** How many recent utterances to retain for the transcript. */
  transcriptSize: number;
  /** Maximum listeners a single utterance reaches. */
  maxAudience: number;
}

export const DEFAULT_SIMULATION_OPTIONS: SimulationOptions = {
  world: {},
  coreLexiconSize: 34,
  coreShare: 0.85,
  modelEnabled: true,
  coinRate: 0.004,
  decayInterval: 20,
  decayAmount: 0.012,
  transcriptSize: 120,
  maxAudience: 4,
};

export interface SimulationStats extends WorldSnapshot {
  model: ModelMetrics;
  modelEnabled: boolean;
  /** Share of utterances whose framing clashed with the speaker's situation. */
  incongruityRate: number;
  meanIncongruity: number;
}

export class Simulation {
  readonly options: SimulationOptions;
  readonly world: World;
  readonly lexicon: Lexicon;
  readonly model: ComprehensionModel;
  readonly transcript: Utterance[] = [];
  /** The colony's founding lexicon; kept for the inspector and for metrics. */
  readonly core: Lexeme[];

  private readonly rng: Rng;
  private nextUtteranceId = 1;
  private decayTimer = 0;
  private incongruitySum = 0;
  private incongruityHits = 0;

  constructor(options: Partial<SimulationOptions> = {}) {
    this.options = { ...DEFAULT_SIMULATION_OPTIONS, ...options };
    this.world = new World(this.options.world);
    this.lexicon = new Lexicon();
    // A generator of its own, forked from the world seed, so that toggling the
    // model does not shift the world's random stream and break comparability.
    this.rng = createRng(`${String(this.world.config.seed)}::lang`);
    this.model = new ComprehensionModel({
      inputSize: FEATURE_COUNT,
      seed: `${String(this.world.config.seed)}::model`,
    });

    this.core = drawCoreLexicon(this.lexicon, this.rng, this.options.coreLexiconSize);
    for (const agent of this.world.bacteria) {
      seedVocabulary(agent, this.core, this.lexicon, this.rng, {
        coreShare: this.options.coreShare,
      });
    }
    this.world.onSpeak = (speaker, listeners) => this.speak(speaker, listeners);
  }

  subscribe(listener: (event: WorldEvent) => void): () => void {
    return this.world.subscribe(listener);
  }

  tick(dt: number): void {
    this.world.tick(dt);
    this.innovate(dt);

    this.decayTimer += dt;
    if (this.decayTimer >= this.options.decayInterval) {
      this.decayTimer = 0;
      decayVocabularies(this.world.bacteria, this.options.decayAmount);
    }
  }

  /** Occasional derivational coinage, biased toward curious, healthy agents. */
  private innovate(dt: number): void {
    for (const agent of this.world.bacteria) {
      const rate = this.options.coinRate * agent.traits.curiosity * dt;
      if (!this.rng.bool(rate)) continue;
      const coinage = coinWord(agent, this.lexicon, this.rng, this.world.time);
      if (!coinage) continue;
      this.world.emit({
        type: 'coined',
        lexemeId: coinage.lexeme.id,
        form: coinage.lexeme.form,
        byId: agent.id,
        byName: agent.name,
      });
    }
  }

  /**
   * Scores a candidate the way the speaker would: with the trained model when
   * it is ready and enabled, otherwise by how firmly it knows the words.
   */
  private scoreCandidate(
    speaker: Bacterium,
    addressee: Bacterium | null,
    candidate: Candidate,
  ): number {
    if (!this.options.modelEnabled || !this.model.ready || !addressee) {
      return candidate.meanStrength;
    }
    return this.model.predict(this.featuresFor(speaker, addressee, candidate));
  }

  private featuresFor(
    speaker: Bacterium,
    listener: Bacterium,
    candidate: Candidate,
  ): Float64Array {
    return observableFeatures(speaker, listener, candidate, {
      bond: speaker.bonds.get(listener.id) ?? 0,
      distance: Math.hypot(listener.x - speaker.x, listener.y - speaker.y),
      hearingRadius: this.world.config.hearingRadius,
      energyCap: this.world.config.energyCap,
    });
  }

  /** One speech turn. Returns true when something was actually said. */
  private speak(speaker: Bacterium, listeners: Bacterium[]): boolean {
    const intent = chooseIntent(
      speaker,
      {
        listeners,
        wasteStress: Math.min(
          1,
          this.world.environment.waste / (this.world.config.wasteHalfSaturation * 1.5),
        ),
        time: this.world.time,
      },
      this.rng,
    );
    if (!intent) return false;

    const candidates = generateCandidates(speaker, intent, {
      lexicon: this.lexicon,
      rng: this.rng,
    });
    const chosen = chooseCandidate(candidates, (candidate) =>
      this.scoreCandidate(speaker, intent.addressee, candidate),
    );
    if (!chosen) return false;

    const utterance = this.deliver(speaker, chosen, intent, listeners);
    this.record(utterance);
    return true;
  }

  /** Sends a chosen utterance to the audience and learns from every outcome. */
  private deliver(
    speaker: Bacterium,
    candidate: Candidate,
    intent: Intent,
    listeners: Bacterium[],
  ): Utterance {
    const audience = listeners.slice(0, this.options.maxAudience);
    const utterance: Utterance = {
      id: this.nextUtteranceId++,
      time: this.world.time,
      speakerId: speaker.id,
      speakerName: speaker.name,
      text: candidate.clause.text,
      act: intent.act,
      field: candidate.field,
      lexemeIds: candidate.clause.lexemeIds,
      suffixCount: candidate.clause.suffixCount,
      register: candidate.register,
      urgency: intent.urgency,
      incongruity: candidate.incongruity,
      audience: [],
    };

    for (const listener of audience) {
      const features = this.featuresFor(speaker, listener, candidate);
      const predicted = this.model.ready ? this.model.predict(features) : null;
      const result = receive(
        speaker,
        listener,
        candidate,
        this.lexicon,
        {
          bond: speaker.bonds.get(listener.id) ?? 0,
          distance: Math.hypot(listener.x - speaker.x, listener.y - speaker.y),
          hearingRadius: this.world.config.hearingRadius,
          energyCap: this.world.config.energyCap,
        },
        this.rng,
        this.world.time,
      );
      // The model always learns, in both arms of the experiment; only whether
      // its predictions are *used* differs.
      this.model.observe(features, result.understood);

      utterance.audience.push({
        listenerId: listener.id,
        listenerName: listener.name,
        understood: result.understood,
        score: result.score,
        predicted,
      });

      this.world.audienceCount += 1;
      if (result.understood) this.world.comprehendedCount += 1;
    }

    speaker.spoken += 1;
    speaker.lastUtterance = utterance.text;
    this.world.utteranceCount += 1;
    return utterance;
  }

  private record(utterance: Utterance): void {
    this.incongruitySum += utterance.incongruity;
    if (utterance.incongruity > 0.5) this.incongruityHits += 1;
    this.transcript.push(utterance);
    if (this.transcript.length > this.options.transcriptSize) this.transcript.shift();
    this.world.emit({ type: 'utterance', utterance });
  }

  /**
   * Player input. Words the colony does not have are added to the lexicon and
   * taught to the addressed agent, which then replies using its own grammar —
   * so teaching a word actually changes what the colony can later say.
   */
  talkTo(agentId: string, text: string): Utterance | null {
    const agent = this.world.find(agentId);
    if (!agent) return null;

    const tokens = text
      .toLocaleLowerCase('tr')
      .split(/[^\p{L}\p{N}]+/u)
      .filter((token) => token.length > 1);

    const fields = new Map<Field, number>();
    for (const token of tokens) {
      let lexeme = this.lexicon.find(token);
      if (!lexeme) {
        // Longest-prefix match, so an inflected input still lands on its stem.
        for (const candidate of this.lexicon.all()) {
          if (token.startsWith(candidate.form) && candidate.form.length >= 3) {
            if (!lexeme || candidate.form.length > lexeme.form.length) lexeme = candidate;
          }
        }
      }
      if (!lexeme) {
        lexeme = this.lexicon.define(
          { form: token, pos: 'noun', field: 'cognition', gloss: `${token} (taught)` },
          { coined: true, bornAt: this.world.time, origin: ['user'] },
        );
        this.world.emit({
          type: 'coined',
          lexemeId: lexeme.id,
          form: lexeme.form,
          byId: 'user',
          byName: 'Sen',
        });
      }
      agent.vocabulary.learn(lexeme.id, this.world.time, 0.5);
      fields.set(lexeme.field, (fields.get(lexeme.field) ?? 0) + 1);
    }

    // Reply about whatever the player's words were mostly about.
    let topic: Field = 'social';
    let best = 0;
    for (const [field, count] of fields) {
      if (count > best) {
        topic = field;
        best = count;
      }
    }

    const listeners = this.world.neighbours(agent);
    const base = chooseIntent(
      agent,
      { listeners, wasteStress: 0, time: this.world.time },
      this.rng,
    );
    const intent: Intent = {
      act: text.includes('?') ? 'inform' : (base?.act ?? 'greet'),
      field: topic,
      urgency: urgencyOf(agent),
      addressee: null,
      addresseeName: 'Sen',
    };

    const candidates = generateCandidates(agent, intent, {
      lexicon: this.lexicon,
      rng: this.rng,
    });
    const chosen = chooseCandidate(candidates, (candidate) => candidate.meanStrength);
    if (!chosen) return null;

    const utterance = this.deliver(agent, chosen, intent, []);
    this.record(utterance);
    return utterance;
  }

  stats(): SimulationStats {
    const snapshot = this.world.snapshot(this.lexicon.size, this.lexicon.coinedCount);
    const total = this.world.utteranceCount;
    return {
      ...snapshot,
      model: this.model.metrics(),
      modelEnabled: this.options.modelEnabled,
      incongruityRate: total === 0 ? 0 : this.incongruityHits / total,
      meanIncongruity: total === 0 ? 0 : this.incongruitySum / total,
    };
  }
}
