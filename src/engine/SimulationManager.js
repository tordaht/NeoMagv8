/**
 * Version 10 biological simulation manager.
 *
 * The manager keeps a lightweight but expressive representation of
 * bacteria that now prioritises biological interactions (energy, health,
 * nutrient exchange) together with their emergent social language.
 */
import { EventEmitter } from 'events';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export class SimulationManager {
  constructor(count = 10, initialEnergy = 1) {
    /** Tracks the public release of the engine. */
    this.version = 'v10.0.0';

    /** Internal event emitter shared with background services. */
    this.events = new EventEmitter();
    this._bgLoop = null;
    this._dialogueLoop = null;

    /** Core population container. */
    this.bacteria = [];
    this.initialEnergy = Math.max(initialEnergy, 0.6);
    this.running = true; // ticking begins immediately in background services

    /**
     * Shared environment values – nutrients regenerate, waste builds up and the
     * temperature oscillates slowly to create a living backdrop for the colony.
     */
    this.environment = {
      nutrientPool: count * 1.5,
      wasteLevel: 0.1,
      temperature: 0.5,
      cycle: 0
    };

    /** Simple communication lexicon used for emergent language. */
    this.languageTokens = {
      greet: ['zi', 'moro'],
      share: ['luma', 'nutri'],
      request: ['nek', 'ask'],
      warn: ['haz', 'caut'],
      thanks: ['gral', 'seno'],
      status: {
        rich: 'ri',
        ok: 'ok',
        low: 'lo',
        warm: 'wa',
        steady: 'st',
        calm: 'ca',
        ally: 'al',
        alert: 'hz'
      },
      resource: {
        energy: 'en',
        nutrient: 'nu',
        hazard: 'hz'
      }
    };

    this._idCounter = 0;

    for (let i = 0; i < count; i++) {
      this.bacteria.push(this._createBacterium());
    }
  }

  /** Create a new bacterium, optionally inheriting traits from a parent. */
  _createBacterium(parent = null) {
    const id = `b_${this._idCounter++}`;
    const inheritedVocab = parent ? Array.from(parent.vocabulary).slice(0, 3) : ["merhaba", "selam", "nasilsin"]; // Turkish base words

    return {
      id,
      name: parent ? `${parent.name}-${this._idCounter}` : `Bac${this._idCounter}`,
      age: 0,
      energy: parent ? clamp(parent.energy * 0.6, 0.4, 1.2) : this.initialEnergy,
      nutrientReserve: parent ? clamp(parent.nutrientReserve * 0.5, 0.2, 1.0) : 0.4 + Math.random() * 0.2,
      health: parent ? clamp(parent.health * 0.9, 0.5, 1) : 0.8 + Math.random() * 0.2,
      mood: parent ? clamp(parent.mood, 0.2, 1) : 0.5 + Math.random() * 0.3,
      alertness: parent ? clamp(parent.alertness || 0.2, 0.1, 1) : 0.2,
      vocabulary: new Set(inheritedVocab.slice(0, 2)),
      memory: [],
      socialBonds: new Map(),
      pendingRequests: []
    };
  }

  /** Start the simulation loop. */
  start() {
    this.running = true;
  }

  /** Stop simulation updates. */
  stop() {
    this.running = false;
  }

  /** Execute one biological tick. */
  tick() {
    if (!this.running) {
      return;
    }

    this.environment.cycle += 1;
    this._regenerateEnvironment();

    const newborns = [];
    const survivors = [];

    this.bacteria.forEach(bacteria => {
      this._metabolize(bacteria);
      this._ageBacteria(bacteria);
      this._decaySocialStructures(bacteria);

      if (bacteria.health <= 0) {
        return; // bacterium perished this tick
      }

      const child = this._maybeReproduce(bacteria);
      if (child) {
        newborns.push(child);
      }

      survivors.push(bacteria);
    });

    this.bacteria = survivors.concat(newborns);

    this.events.emit('tick', this.getState());
  }

  _regenerateEnvironment() {
    const baseRegen = Math.max(0.02, this.bacteria.length * 0.005);
    const capacity = Math.max(2, this.bacteria.length * 0.9);
    this.environment.nutrientPool = clamp(this.environment.nutrientPool + baseRegen, 0, capacity);
    this.environment.wasteLevel = clamp(this.environment.wasteLevel - 0.01, 0, 1);
    this.environment.temperature = clamp(0.5 + Math.sin(this.environment.cycle / 600) * 0.08, 0.3, 0.8);
  }

  _metabolize(bacteria) {
    const metabolicRate = 0.0025 + bacteria.age * 0.00005;
    bacteria.energy = clamp(bacteria.energy - metabolicRate, 0, 1.5);
    this.environment.wasteLevel = clamp(this.environment.wasteLevel + 0.001, 0, 1);

    if (bacteria.nutrientReserve > 0) {
      const conversion = Math.min(bacteria.nutrientReserve, 0.01);
      bacteria.nutrientReserve -= conversion;
      bacteria.energy = clamp(bacteria.energy + conversion * 0.8, 0, 1.5);
    }

    if (bacteria.energy < 0.35 && this.environment.nutrientPool > 0) {
      const harvest = Math.min(0.06, this.environment.nutrientPool);
      this.environment.nutrientPool -= harvest;
      bacteria.energy = clamp(bacteria.energy + harvest * 0.7, 0, 1.5);
      bacteria.nutrientReserve = clamp(bacteria.nutrientReserve + harvest * 0.3, 0, 1.5);
    }

    if (this.environment.wasteLevel > 0.7) {
      bacteria.health = clamp(bacteria.health - 0.006, 0, 1);
      bacteria.mood = clamp(bacteria.mood - 0.01, 0, 1);
    }

    if (bacteria.energy > 0.7) {
      bacteria.mood = clamp(bacteria.mood + 0.006, 0, 1);
    } else if (bacteria.energy < 0.3) {
      bacteria.mood = clamp(bacteria.mood - 0.008, 0, 1);
    }
  }

  _ageBacteria(bacteria) {
    bacteria.age += 0.016; // ~60 fps equivalent
    if (bacteria.age > 60) {
      bacteria.health = clamp(bacteria.health - 0.002, 0, 1);
    }
    if (bacteria.energy < 0.25) {
      bacteria.health = clamp(bacteria.health - 0.01, 0, 1);
    } else if (bacteria.energy > 0.6) {
      bacteria.health = clamp(bacteria.health + 0.003, 0, 1);
    }
  }

  _decaySocialStructures(bacteria) {
    bacteria.socialBonds.forEach((value, key, map) => {
      const decayed = value * 0.995;
      if (decayed < 0.01) {
        map.delete(key);
      } else {
        map.set(key, decayed);
      }
    });

    if (bacteria.pendingRequests.length) {
      bacteria.pendingRequests = bacteria.pendingRequests
        .map(req => ({ ...req, urgency: clamp(req.urgency - 0.01, 0, 1) }))
        .filter(req => req.urgency > 0.05);
    }

    if (bacteria.memory.length > 25) {
      bacteria.memory = bacteria.memory.slice(-25);
    }
  }

  _maybeReproduce(bacteria) {
    if (
      bacteria.energy > 0.85 &&
      bacteria.health > 0.75 &&
      this.environment.nutrientPool > 0.5
    ) {
      const offspring = this._createBacterium(bacteria);
      bacteria.energy = clamp(bacteria.energy - 0.3, 0, 1.5);
      bacteria.nutrientReserve = clamp(bacteria.nutrientReserve - 0.2, 0, 1.5);
      this.environment.nutrientPool = clamp(this.environment.nutrientPool - 0.2, 0, Infinity);

      // Inherit vocabulary shards for cultural continuity
      const parentWords = Array.from(bacteria.vocabulary);
      parentWords.slice(0, 3).forEach(word => offspring.vocabulary.add(word));

      this._updateSocialBond(bacteria, offspring, 0.2);
      return offspring;
    }
    return null;
  }

  /** Pick two distinct living bacteria. */
  pickRandomPair() {
    const living = this.bacteria.filter(b => b.health > 0);
    if (living.length < 2) return [];
    const a = living[Math.floor(Math.random() * living.length)];
    let b = a;
    while (b === a) {
      b = living[Math.floor(Math.random() * living.length)];
    }
    return [a, b];
  }

  /** Generate a structured message between two bacteria. */
  talk(a, b) {
    const decision = this._decideIntent(a, b);
    const { intent, payload, requestIndex } = decision;
    const text = this._renderMessage(intent, payload);

    if (intent === 'share' && payload?.amount) {
      const amount = clamp(payload.amount, 0, a.nutrientReserve);
      a.nutrientReserve = clamp(a.nutrientReserve - amount, 0, 1.5);
      a.energy = clamp(a.energy - amount * 0.2, 0, 1.5);
      payload.amount = amount;
      this._updateSocialBond(a, b, 0.08);
    } else if (intent === 'request') {
      this._updateSocialBond(a, b, 0.05);
    } else {
      this._updateSocialBond(a, b, 0.02);
    }

    if (typeof requestIndex === 'number' && requestIndex > -1) {
      a.pendingRequests.splice(requestIndex, 1);
    }

    return { text, intent, payload };
  }

  _decideIntent(a, b) {
    const requestIndex = a.pendingRequests.findIndex(req => req.fromId === b.id);
    if (requestIndex !== -1 && a.nutrientReserve > 0.05) {
      const amount = clamp(Math.min(0.12, a.nutrientReserve * 0.5), 0.02, 0.2);
      return {
        intent: 'share',
        payload: {
          resource: 'nutrient',
          amount,
          status: this._statusFromEnergy(a.energy)
        },
        requestIndex
      };
    }

    if (a.energy < 0.35) {
      return {
        intent: 'request',
        payload: {
          resource: 'energy',
          urgency: clamp(1 - a.energy, 0.2, 1),
          status: this._statusFromEnergy(a.energy)
        }
      };
    }

    if (b.energy < 0.3 && a.nutrientReserve > 0.05) {
      return {
        intent: 'share',
        payload: {
          resource: 'nutrient',
          amount: clamp(Math.min(0.1, a.nutrientReserve * 0.4), 0.02, 0.15),
          status: this._statusFromEnergy(a.energy)
        }
      };
    }

    if (this.environment.wasteLevel > 0.65) {
      return {
        intent: 'warn',
        payload: {
          hazard: 'waste',
          level: clamp(this.environment.wasteLevel, 0, 1),
          status: 'alert'
        }
      };
    }

    const bond = a.socialBonds.get(b.id) || 0;
    if (bond > 0.6) {
      return {
        intent: 'thanks',
        payload: { status: 'ally' }
      };
    }

    return {
      intent: 'greet',
      payload: { status: this._statusFromMood(a.mood) }
    };
  }

  _statusFromEnergy(energy) {
    if (energy < 0.35) return 'low';
    if (energy > 0.75) return 'rich';
    return 'ok';
  }

  _statusFromMood(mood) {
    if (mood > 0.65) return 'warm';
    if (mood < 0.35) return 'calm';
    return 'steady';
  }

  _renderMessage(intent, payload = {}) {
    const tokens = [];
    const base = this.languageTokens[intent];
    if (Array.isArray(base)) {
      tokens.push(base[0]);
    } else {
      tokens.push('zi');
    }

    const statusToken = payload.status && this.languageTokens.status[payload.status];
    const resourceToken = payload.resource && this.languageTokens.resource[payload.resource];

    if (resourceToken) {
      tokens.push(resourceToken);
    }

    if (statusToken) {
      tokens.push(statusToken);
    }

    if (payload.amount !== undefined) {
      tokens.push(this._formatAmount(payload.amount));
    }

    if (payload.urgency !== undefined) {
      tokens.push(this._formatAmount(payload.urgency));
    }

    if (payload.level !== undefined) {
      tokens.push(this._formatAmount(payload.level));
    }

    return `[${intent.toUpperCase()}] ${tokens.join(' ')}`.trim();
  }

  _formatAmount(value) {
    return Number.parseFloat(value).toFixed(2);
  }

  /** Apply biological or social changes caused by a received message. */
  receive(target, message, from) {
    const { intent, payload, text } = this._normalizeMessage(message);

    target.memory.push(text);
    if (target.memory.length > 25) {
      target.memory = target.memory.slice(-25);
    }

    switch (intent) {
      case 'share': {
        const amount = clamp(payload.amount || 0, 0, 0.3);
        if (amount > 0) {
          target.energy = clamp(target.energy + amount * 0.7, 0, 1.5);
          target.nutrientReserve = clamp(target.nutrientReserve + amount * 0.3, 0, 1.5);
          target.mood = clamp(target.mood + 0.04, 0, 1);
          this._updateSocialBond(target, from, 0.12);
          this._updateSocialBond(from, target, 0.05);
        }
        break;
      }
      case 'request': {
        const urgency = clamp(payload.urgency || 0.4, 0, 1);
        target.pendingRequests.push({ fromId: from.id, urgency });
        if (target.pendingRequests.length > 6) {
          target.pendingRequests.shift();
        }
        this._updateSocialBond(target, from, 0.05);
        target.alertness = clamp((target.alertness || 0.2) + 0.05, 0, 1);
        break;
      }
      case 'warn': {
        target.alertness = clamp((target.alertness || 0.2) + 0.1, 0, 1);
        target.mood = clamp(target.mood - 0.02, 0, 1);
        this._updateSocialBond(target, from, 0.03);
        break;
      }
      case 'thanks': {
        this._updateSocialBond(target, from, 0.07);
        target.mood = clamp(target.mood + 0.02, 0, 1);
        break;
      }
      default: {
        this._updateSocialBond(target, from, 0.03);
        target.mood = clamp(target.mood + 0.01, 0, 1);
        break;
      }
    }
  }

  _normalizeMessage(message) {
    if (message && typeof message === 'object') {
      const intent = message.intent || 'greet';
      const payload = message.payload || {};
      const text = message.text || this._renderMessage(intent, payload);
      return { intent, payload, text };
    }

    if (typeof message === 'string') {
      const match = message.match(/^\[(\w+)\]\s*(.*)$/);
      const intent = match ? match[1].toLowerCase() : 'greet';
      const payload = {};
      return { intent, payload, text: message };
    }

    return { intent: 'greet', payload: {}, text: '[GREET] zi' };
  }

  _updateSocialBond(bacteria, other, delta) {
    if (!bacteria || !other) return;
    const current = bacteria.socialBonds.get(other.id) || 0;
    bacteria.socialBonds.set(other.id, clamp(current + delta, 0, 1));
  }

  /** Return public state snapshot. */
  getState() {
    return {
      version: this.version,
      running: this.running,
      environment: {
        nutrientPool: Number(this.environment.nutrientPool.toFixed(3)),
        wasteLevel: Number(this.environment.wasteLevel.toFixed(3)),
        temperature: Number(this.environment.temperature.toFixed(3))
      },
      population: this.bacteria.map(b => ({
        id: b.id,
        name: b.name,
        age: Number(b.age.toFixed(2)),
        energy: Number(b.energy.toFixed(3)),
        health: Number(b.health.toFixed(3)),
        nutrientReserve: Number(b.nutrientReserve.toFixed(3)),
        vocabularySize: b.vocabulary.size,
        socialBondCount: b.socialBonds.size,
        pendingRequests: b.pendingRequests.length
      }))
    };
  }

  /** Start background tick and dialogue loops for autonomous mode. */
  startBackground() {
    if (this._bgLoop || this._dialogueLoop) {
      return;
    }

    this.running = true;
    this._bgLoop = setInterval(() => this.tick(), 1000 / 60);
    this._dialogueLoop = setInterval(() => {
      const [a, b] = this.pickRandomPair();
      if (!a || !b) return;
      const interaction = this.talk(a, b);
      this.receive(b, interaction, a);
      this.events.emit('newMessage', { from: a.id, to: b.id, text: interaction.text, intent: interaction.intent, payload: interaction.payload });
      this.events.emit('dialogue', { from: a.id, to: b.id, message: interaction.text, intent: interaction.intent, payload: interaction.payload });
    }, 4000);
  }

  /** Stop background loops. */
  stopBackground() {
    clearInterval(this._bgLoop);
    clearInterval(this._dialogueLoop);
    this._bgLoop = null;
    this._dialogueLoop = null;
    this.running = false;
  }
}

export default SimulationManager;
