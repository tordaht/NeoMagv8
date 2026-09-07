/**
 * The simulation core: ecology, movement, birth and death.
 *
 * Two properties are load-bearing and are asserted by the tests:
 *
 *  1. **Determinism.** Every stochastic decision draws from the world's own
 *     seeded generator, so a seed reproduces a run exactly.
 *  2. **Stability.** Nutrient regeneration is logistic and uptake is
 *     Michaelis–Menten, which gives the population a genuine equilibrium
 *     instead of a boom-and-extinction spike.
 *
 * The language layer is deliberately *not* imported here. `World` calls out
 * through `onSpeak`, so the ecology can be tested — and tuned — on its own.
 */

import { Vocabulary } from '../lang/lexicon.js';
import { createRng, type Rng } from './rng.js';
import type {
  Bacterium,
  DeathCause,
  EnvironmentState,
  Traits,
  WorldEvent,
  WorldSnapshot,
} from './types.js';

export interface WorldConfig {
  seed: number | string;
  width: number;
  height: number;
  initialPopulation: number;
  /** Hard ceiling; reproduction stops here regardless of energy. */
  maxPopulation: number;
  /** Density at which reproduction pressure is fully suppressed. */
  softCapacity: number;

  nutrientCapacity: number;
  /** Regeneration rate at an empty pool, in units per second. */
  nutrientRegen: number;
  /** Maximum uptake per agent per second. */
  uptakeMax: number;
  /** Nutrient level at which uptake reaches half of `uptakeMax`. */
  uptakeHalfSaturation: number;
  /** Baseline energy burn per second. */
  maintenance: number;
  energyCap: number;

  reproductionThreshold: number;
  reproductionCost: number;
  /** Hazard rate per second once above the threshold. */
  reproductionRate: number;
  maxAge: number;
  ageJitter: number;

  wasteRate: number;
  wasteDecay: number;
  wasteHalfSaturation: number;

  speed: number;
  hearingRadius: number;
  /** Mean seconds between utterances for an averagely sociable agent. */
  speechInterval: number;
}

export const DEFAULT_CONFIG: WorldConfig = {
  seed: 'neomag',
  width: 900,
  height: 560,
  initialPopulation: 14,
  maxPopulation: 120,
  softCapacity: 60,

  nutrientCapacity: 120,
  nutrientRegen: 6,
  uptakeMax: 0.32,
  uptakeHalfSaturation: 25,
  maintenance: 0.1,
  energyCap: 2.2,

  reproductionThreshold: 1.5,
  reproductionCost: 0.3,
  reproductionRate: 0.35,
  maxAge: 240,
  ageJitter: 60,

  wasteRate: 0.015,
  wasteDecay: 0.15,
  wasteHalfSaturation: 10,

  speed: 26,
  hearingRadius: 130,
  speechInterval: 6,
};

const ONSET = ['b', 'd', 'g', 'k', 'l', 'm', 'n', 'r', 's', 't', 'y', 'z', 'ş', 'ç'];
const NUCLEUS = ['a', 'e', 'ı', 'i', 'o', 'u', 'ö', 'ü'];

/** Builds a pronounceable Turkish-shaped name, e.g. "Mira", "Tozan". */
function coinName(rng: Rng): string {
  const syllables = rng.bool(0.45) ? 3 : 2;
  let name = '';
  for (let i = 0; i < syllables; i++) {
    name += rng.pick(ONSET) + rng.pick(NUCLEUS);
    if (i === syllables - 1 && rng.bool(0.4)) name += rng.pick(['n', 'r', 'l', 's']);
  }
  return name[0].toLocaleUpperCase('tr') + name.slice(1);
}

function randomTraits(rng: Rng): Traits {
  return {
    curiosity: rng.range(0.2, 0.9),
    sociability: rng.range(0.2, 0.95),
    optimism: rng.range(0.1, 0.9),
    verbosity: rng.range(0.2, 0.9),
    humor: rng.range(0.05, 0.85),
  };
}

/** Inherits a trait with bounded Gaussian drift — the mutation operator. */
function mutateTrait(value: number, rng: Rng, sigma = 0.06): number {
  return Math.min(1, Math.max(0, value + rng.gauss() * sigma));
}

/**
 * Called once per speech opportunity. Returning `true` means the agent spoke,
 * which resets its speech timer. Wired up by `createSimulation`.
 */
export type SpeakHandler = (speaker: Bacterium, listeners: Bacterium[], world: World) => boolean;

export class World {
  readonly config: WorldConfig;
  readonly rng: Rng;

  bacteria: Bacterium[] = [];
  environment: EnvironmentState;

  time = 0;
  tickCount = 0;
  births = 0;
  deaths = 0;
  maxGeneration = 0;
  utteranceCount = 0;
  comprehendedCount = 0;
  audienceCount = 0;

  onSpeak: SpeakHandler | null = null;

  private nextId = 0;
  private listeners: ((event: WorldEvent) => void)[] = [];
  /** Per-agent lifespan draw, kept out of `Bacterium` to keep that struct lean. */
  private lifespans = new Map<string, number>();

  constructor(config: Partial<WorldConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rng = createRng(this.config.seed);
    this.environment = { nutrients: this.config.nutrientCapacity * 0.6, waste: 0 };
    for (let i = 0; i < this.config.initialPopulation; i++) this.spawn();
  }

  subscribe(listener: (event: WorldEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((entry) => entry !== listener);
    };
  }

  emit(event: WorldEvent): void {
    for (const listener of this.listeners) listener(event);
  }

  /** Creates a founder agent at a random position. */
  spawn(): Bacterium {
    const rng = this.rng;
    const id = `b${this.nextId++}`;
    const agent: Bacterium = {
      id,
      name: coinName(rng),
      generation: 0,
      bornAt: this.time,
      age: 0,
      energy: rng.range(0.7, 1.1),
      x: rng.range(40, this.config.width - 40),
      y: rng.range(40, this.config.height - 40),
      vx: rng.range(-1, 1),
      vy: rng.range(-1, 1),
      traits: randomTraits(rng),
      vocabulary: new Vocabulary(),
      bonds: new Map(),
      speechTimer: rng.range(0, this.config.speechInterval),
      lastUtterance: null,
      curiousAbout: [],
      lastDivision: -Infinity,
      spoken: 0,
      understood: 0,
      misunderstood: 0,
      alive: true,
    };
    this.lifespans.set(id, this.config.maxAge + rng.gauss() * this.config.ageJitter);
    this.bacteria.push(agent);
    return agent;
  }

  find(id: string): Bacterium | undefined {
    return this.bacteria.find((agent) => agent.id === id);
  }

  /** Peers within hearing range of `agent`, nearest first. */
  neighbours(agent: Bacterium, radius = this.config.hearingRadius): Bacterium[] {
    const found: { peer: Bacterium; distance: number }[] = [];
    const limit = radius * radius;
    for (const peer of this.bacteria) {
      if (peer.id === agent.id || !peer.alive) continue;
      const dx = peer.x - agent.x;
      const dy = peer.y - agent.y;
      const distance = dx * dx + dy * dy;
      if (distance <= limit) found.push({ peer, distance });
    }
    found.sort((a, b) => a.distance - b.distance);
    return found.map((entry) => entry.peer);
  }

  /** Advances the world by `dt` seconds. */
  tick(dt: number): void {
    this.tickCount += 1;
    this.time += dt;

    this.updateEnvironment(dt);
    this.updateAgents(dt);
    this.reap();
    this.reproduce(dt);
    this.converse(dt);
  }

  private updateEnvironment(dt: number): void {
    const { nutrientCapacity, nutrientRegen, wasteDecay } = this.config;
    const env = this.environment;
    // Logistic regrowth: fast when depleted, tapering as the pool fills.
    env.nutrients += nutrientRegen * (1 - env.nutrients / nutrientCapacity) * dt;
    env.nutrients = Math.max(0, Math.min(nutrientCapacity, env.nutrients));
    env.waste = Math.max(0, env.waste - wasteDecay * env.waste * dt);
  }

  /** Uptake suppression from accumulated waste, in (0, 1]. */
  private wasteFactor(): number {
    return 1 / (1 + this.environment.waste / this.config.wasteHalfSaturation);
  }

  private updateAgents(dt: number): void {
    const cfg = this.config;
    const env = this.environment;
    const wasteFactor = this.wasteFactor();
    // Michaelis–Menten: uptake saturates, so a crowd cannot drain the pool
    // faster than it regenerates without also starving itself first.
    const perCapita =
      cfg.uptakeMax * (env.nutrients / (env.nutrients + cfg.uptakeHalfSaturation)) * wasteFactor;

    let demanded = 0;
    for (const agent of this.bacteria) if (agent.alive) demanded += perCapita * dt;
    // Never take more than the pool holds; ration proportionally if we would.
    const ration = demanded > env.nutrients && demanded > 0 ? env.nutrients / demanded : 1;

    for (const agent of this.bacteria) {
      if (!agent.alive) continue;
      agent.age += dt;

      const gained = perCapita * ration * dt;
      agent.energy = Math.min(cfg.energyCap, agent.energy + gained - cfg.maintenance * dt);
      env.nutrients = Math.max(0, env.nutrients - gained);
      env.waste += cfg.wasteRate * dt;

      this.move(agent, dt);
      agent.speechTimer -= dt;
    }
  }

  private move(agent: Bacterium, dt: number): void {
    const rng = this.rng;
    const cfg = this.config;

    // Random tumble, biased toward nearby peers in proportion to sociability.
    agent.vx += rng.gauss() * 0.6;
    agent.vy += rng.gauss() * 0.6;

    if (agent.traits.sociability > 0.35) {
      let cx = 0;
      let cy = 0;
      let count = 0;
      for (const peer of this.bacteria) {
        if (peer.id === agent.id || !peer.alive) continue;
        const dx = peer.x - agent.x;
        const dy = peer.y - agent.y;
        if (dx * dx + dy * dy < cfg.hearingRadius * cfg.hearingRadius) {
          cx += dx;
          cy += dy;
          count++;
        }
      }
      if (count > 0) {
        const pull = 0.02 * agent.traits.sociability;
        agent.vx += (cx / count) * pull * dt;
        agent.vy += (cy / count) * pull * dt;
      }
    }

    const speed = Math.hypot(agent.vx, agent.vy);
    const maxSpeed = 1.6;
    if (speed > maxSpeed) {
      agent.vx = (agent.vx / speed) * maxSpeed;
      agent.vy = (agent.vy / speed) * maxSpeed;
    }

    agent.x += agent.vx * cfg.speed * dt;
    agent.y += agent.vy * cfg.speed * dt;

    // Reflect at the walls so the colony stays in view.
    if (agent.x < 8) {
      agent.x = 8;
      agent.vx = Math.abs(agent.vx);
    } else if (agent.x > cfg.width - 8) {
      agent.x = cfg.width - 8;
      agent.vx = -Math.abs(agent.vx);
    }
    if (agent.y < 8) {
      agent.y = 8;
      agent.vy = Math.abs(agent.vy);
    } else if (agent.y > cfg.height - 8) {
      agent.y = cfg.height - 8;
      agent.vy = -Math.abs(agent.vy);
    }
  }

  private reap(): void {
    const survivors: Bacterium[] = [];
    for (const agent of this.bacteria) {
      let cause: DeathCause | null = null;
      if (agent.energy <= 0) cause = 'starvation';
      else if (agent.age >= (this.lifespans.get(agent.id) ?? this.config.maxAge)) cause = 'age';

      if (cause === null) {
        survivors.push(agent);
        continue;
      }
      agent.alive = false;
      this.deaths += 1;
      this.lifespans.delete(agent.id);
      this.emit({ type: 'death', id: agent.id, name: agent.name, cause });
    }
    this.bacteria = survivors;
  }

  private reproduce(dt: number): void {
    const cfg = this.config;
    if (this.bacteria.length >= cfg.maxPopulation) return;

    // Density dependence: the closer to the soft capacity, the rarer division.
    const crowding = Math.max(0, 1 - this.bacteria.length / cfg.softCapacity);
    if (crowding <= 0) return;

    const hazard = cfg.reproductionRate * crowding * dt;
    const parents = this.bacteria.filter((agent) => agent.energy >= cfg.reproductionThreshold);

    for (const parent of parents) {
      if (this.bacteria.length >= cfg.maxPopulation) break;
      if (!this.rng.bool(hazard)) continue;

      const share = (parent.energy - cfg.reproductionCost) / 2;
      parent.energy = share;
      parent.lastDivision = this.time;

      const rng = this.rng;
      const id = `b${this.nextId++}`;
      const child: Bacterium = {
        id,
        name: coinName(rng),
        generation: parent.generation + 1,
        bornAt: this.time,
        age: 0,
        energy: share,
        x: Math.min(cfg.width - 8, Math.max(8, parent.x + rng.range(-14, 14))),
        y: Math.min(cfg.height - 8, Math.max(8, parent.y + rng.range(-14, 14))),
        vx: rng.range(-1, 1),
        vy: rng.range(-1, 1),
        traits: {
          curiosity: mutateTrait(parent.traits.curiosity, rng),
          sociability: mutateTrait(parent.traits.sociability, rng),
          optimism: mutateTrait(parent.traits.optimism, rng),
          verbosity: mutateTrait(parent.traits.verbosity, rng),
          humor: mutateTrait(parent.traits.humor, rng),
        },
        // Vertical transmission: the child starts from a weakened copy of the
        // parent's vocabulary, so lineages carry dialects.
        vocabulary: parent.vocabulary.inherit(this.time),
        bonds: new Map([[parent.id, 0.5]]),
        speechTimer: rng.range(0, cfg.speechInterval),
        lastUtterance: null,
        curiousAbout: [],
        lastDivision: this.time,
        spoken: 0,
        understood: 0,
        misunderstood: 0,
        alive: true,
      };
      this.lifespans.set(id, cfg.maxAge + rng.gauss() * cfg.ageJitter);
      this.bacteria.push(child);
      this.births += 1;
      this.maxGeneration = Math.max(this.maxGeneration, child.generation);
      this.emit({ type: 'birth', child, parentId: parent.id });
    }
  }

  private converse(_dt: number): void {
    const handler = this.onSpeak;
    if (!handler) return;

    for (const agent of this.bacteria) {
      if (agent.speechTimer > 0 || !agent.alive) continue;
      const listeners = this.neighbours(agent);
      const spoke = handler(agent, listeners, this);
      // Sociable agents speak more often; the interval never drops below 1s.
      const interval = this.config.speechInterval * (1.4 - agent.traits.sociability);
      agent.speechTimer = spoke
        ? Math.max(1, interval * this.rng.range(0.7, 1.3))
        : this.rng.range(0.5, 1.5);
    }
  }

  /** Mean pairwise lexical overlap across a bounded sample of the population. */
  cohesion(sampleSize = 12): number {
    const agents = this.bacteria;
    if (agents.length < 2) return 1;
    const step = Math.max(1, Math.floor(agents.length / sampleSize));
    const sample: Bacterium[] = [];
    for (let i = 0; i < agents.length && sample.length < sampleSize; i += step) {
      sample.push(agents[i]);
    }
    let total = 0;
    let pairs = 0;
    for (let i = 0; i < sample.length; i++) {
      for (let j = i + 1; j < sample.length; j++) {
        const a = new Set(sample[i].vocabulary.ids());
        const b = sample[j].vocabulary.ids();
        if (a.size === 0 && b.length === 0) {
          total += 1;
        } else {
          let shared = 0;
          for (const id of b) if (a.has(id)) shared++;
          const union = a.size + b.length - shared;
          total += union === 0 ? 1 : shared / union;
        }
        pairs++;
      }
    }
    return pairs === 0 ? 1 : total / pairs;
  }

  snapshot(lexiconSize: number, coinedWords: number): WorldSnapshot {
    const population = this.bacteria.length;
    let energy = 0;
    let vocabulary = 0;
    for (const agent of this.bacteria) {
      energy += agent.energy;
      vocabulary += agent.vocabulary.size();
    }
    return {
      time: this.time,
      tick: this.tickCount,
      population,
      births: this.births,
      deaths: this.deaths,
      generation: this.maxGeneration,
      environment: { ...this.environment },
      meanEnergy: population === 0 ? 0 : energy / population,
      meanVocabulary: population === 0 ? 0 : vocabulary / population,
      lexiconSize,
      coinedWords,
      utterances: this.utteranceCount,
      comprehensionRate:
        this.audienceCount === 0 ? 0 : this.comprehendedCount / this.audienceCount,
      cohesion: this.cohesion(),
    };
  }
}
