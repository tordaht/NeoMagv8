/**
 * The shared lexeme registry and the per-agent vocabulary that sits on top of
 * it.
 *
 * A `Lexeme` is a word that exists in the world; a `Vocabulary` records how
 * well one bacterium knows it. Words are never stored as bare strings on an
 * agent — the agent holds a strength for a lexeme id — because selection
 * pressure acts on that strength, and because morphology needs the lexeme's
 * part of speech and stem flags to inflect it.
 */

import type { StemFlags } from './morphology.js';
import type { Field, Pos, SeedEntry, Valence, Valency } from './seed.js';
import { SEED_LEXEMES } from './seed.js';

export interface Lexeme {
  id: string;
  form: string;
  pos: Pos;
  field: Field;
  gloss: string;
  flags: StemFlags;
  /** Argument structure; only meaningful for verbs. */
  valency: Valency;
  /** Affective valence; only meaningful for verbs. */
  valence: Valence;
  /** True for words coined during the run rather than present at seeding. */
  coined: boolean;
  /** Lexeme ids this word was derived from. */
  origin: string[];
  /** Simulation time (seconds) at which the word first appeared. */
  bornAt: number;
}

/** How well a single agent knows a single lexeme. */
export interface WordMemory {
  /** Retrieval/comprehension strength in [0, 1]. */
  strength: number;
  uses: number;
  successes: number;
  learnedAt: number;
}

export class Lexicon {
  private readonly byId = new Map<string, Lexeme>();
  private readonly byForm = new Map<string, Lexeme>();

  constructor(entries: readonly SeedEntry[] = SEED_LEXEMES) {
    for (const entry of entries) this.define(entry, { coined: false, bornAt: 0 });
  }

  /**
   * Registers a lexeme. Returns the existing entry when the surface form is
   * already taken, so a coined homophone never shadows a seeded word.
   */
  define(
    entry: SeedEntry,
    meta: { coined: boolean; bornAt: number; origin?: string[] },
  ): Lexeme {
    const existing = this.byForm.get(entry.form);
    if (existing) return existing;

    const lexeme: Lexeme = {
      id: `${entry.pos}:${entry.form}`,
      form: entry.form,
      pos: entry.pos,
      field: entry.field,
      gloss: entry.gloss,
      flags: entry.flags ?? {},
      valency: entry.valency ?? 'intransitive',
      valence: entry.valence ?? 'neutral',
      coined: meta.coined,
      origin: meta.origin ?? [],
      bornAt: meta.bornAt,
    };
    this.byId.set(lexeme.id, lexeme);
    this.byForm.set(lexeme.form, lexeme);
    return lexeme;
  }

  get(id: string): Lexeme | undefined {
    return this.byId.get(id);
  }

  /** Looks a word up by its surface citation form. */
  find(form: string): Lexeme | undefined {
    return this.byForm.get(form.toLocaleLowerCase('tr'));
  }

  has(id: string): boolean {
    return this.byId.has(id);
  }

  all(): Lexeme[] {
    return [...this.byId.values()];
  }

  get size(): number {
    return this.byId.size;
  }

  get coinedCount(): number {
    let count = 0;
    for (const lexeme of this.byId.values()) if (lexeme.coined) count++;
    return count;
  }

  select(filter: { pos?: Pos; field?: Field }): Lexeme[] {
    const out: Lexeme[] = [];
    for (const lexeme of this.byId.values()) {
      if (filter.pos && lexeme.pos !== filter.pos) continue;
      if (filter.field && lexeme.field !== filter.field) continue;
      out.push(lexeme);
    }
    return out;
  }
}

/**
 * One agent's knowledge of the lexicon.
 *
 * `reinforce` is the selection step of language evolution: a word that carried
 * a successfully understood utterance gets stronger and is more likely to be
 * retrieved and passed on; one that failed weakens and eventually drops out.
 */
export class Vocabulary {
  private readonly memory = new Map<string, WordMemory>();

  /** Strength below which a word is treated as forgotten. */
  static readonly FORGET_THRESHOLD = 0.05;

  size(): number {
    return this.memory.size;
  }

  ids(): string[] {
    return [...this.memory.keys()];
  }

  entries(): [string, WordMemory][] {
    return [...this.memory.entries()];
  }

  knows(id: string): boolean {
    return this.memory.has(id);
  }

  strengthOf(id: string): number {
    return this.memory.get(id)?.strength ?? 0;
  }

  get(id: string): WordMemory | undefined {
    return this.memory.get(id);
  }

  /** Adds a word, or strengthens it slightly if already known. */
  learn(id: string, at: number, strength = 0.35): WordMemory {
    const existing = this.memory.get(id);
    if (existing) {
      existing.strength = Math.min(1, existing.strength + 0.05);
      return existing;
    }
    const fresh: WordMemory = { strength, uses: 0, successes: 0, learnedAt: at };
    this.memory.set(id, fresh);
    return fresh;
  }

  /** Learning rate applied when an utterance lands. */
  static readonly SUCCESS_RATE = 0.12;
  /**
   * Learning rate applied when it does not. Deliberately much smaller than
   * `SUCCESS_RATE`: with a symmetric update, an early run of failures drove
   * every strength to zero, agents forgot their words, and the shared language
   * collapsed instead of evolving.
   */
  static readonly FAILURE_RATE = 0.03;

  /**
   * Records the outcome of using a word: a bounded exponential move toward 1
   * (success) or 0 (failure), which keeps strengths inside [0, 1] without
   * clamping artefacts.
   */
  reinforce(id: string, success: boolean, rate?: number): void {
    const entry = this.memory.get(id);
    if (!entry) return;
    entry.uses += 1;
    if (success) entry.successes += 1;
    const step = rate ?? (success ? Vocabulary.SUCCESS_RATE : Vocabulary.FAILURE_RATE);
    const target = success ? 1 : 0;
    entry.strength += (target - entry.strength) * step;
  }

  /** Passive forgetting; called on a slow cadence, not every tick. */
  decay(amount: number): void {
    for (const [id, entry] of this.memory) {
      entry.strength -= amount;
      if (entry.strength < Vocabulary.FORGET_THRESHOLD) this.memory.delete(id);
    }
  }

  /** Mean strength across everything the agent knows. */
  meanStrength(): number {
    if (this.memory.size === 0) return 0;
    let total = 0;
    for (const entry of this.memory.values()) total += entry.strength;
    return total / this.memory.size;
  }

  /** Total successful uses, used as a communication-competence signal. */
  successRate(): number {
    let uses = 0;
    let successes = 0;
    for (const entry of this.memory.values()) {
      uses += entry.uses;
      successes += entry.successes;
    }
    return uses === 0 ? 0 : successes / uses;
  }

  /** Copies this vocabulary, halving strengths — used when a cell divides. */
  inherit(at: number, retention = 0.75): Vocabulary {
    const child = new Vocabulary();
    for (const [id, entry] of this.memory) {
      const strength = entry.strength * retention;
      if (strength >= Vocabulary.FORGET_THRESHOLD) {
        child.memory.set(id, { strength, uses: 0, successes: 0, learnedAt: at });
      }
    }
    return child;
  }
}

/** Jaccard overlap of two vocabularies — the basis of the dialect metric. */
export function lexicalOverlap(a: Vocabulary, b: Vocabulary): number {
  const idsA = new Set(a.ids());
  const idsB = b.ids();
  if (idsA.size === 0 && idsB.length === 0) return 1;
  let shared = 0;
  for (const id of idsB) if (idsA.has(id)) shared++;
  const union = idsA.size + idsB.length - shared;
  return union === 0 ? 1 : shared / union;
}
