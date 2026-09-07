/**
 * A small generative grammar for the colony's Turkish.
 *
 * A frame is a sequence of *constituents carrying morphological features*, not
 * a string with holes in it. Content words are drawn from the speaker's own
 * vocabulary and inflected by `morphology.ts`, so what an agent can say is
 * bounded by what it actually knows — which is what makes the language evolve
 * rather than merely shuffle.
 *
 * Closed-class items (var, yok, ne, nerede, bir, …) are `fixed`: function words
 * are not part of the open lexicon and are not subject to selection.
 */

import {
  capitalize,
  conjugate,
  inflectNoun,
  attach,
  suffixOf,
  type Case,
  type Person,
  type Possessive,
  type Tense,
} from './morphology.js';
import type { Lexeme } from './lexicon.js';
import {
  PRONOUNS,
  type Field,
  type PronounCase,
  type PronounPerson,
  type Valence,
  type Valency,
} from './seed.js';
import type { SpeechAct } from '../core/types.js';

export interface NounSlot {
  kind: 'noun';
  field?: Field;
  plural?: boolean;
  possessive?: Possessive;
  case?: Case;
  /** Prefer a word the addressee is likely to know. */
  shared?: boolean;
}

export interface VerbSlot {
  kind: 'verb';
  field?: Field;
  tense: Tense;
  person: Person;
  negative?: boolean;
  question?: boolean;
  shared?: boolean;
  /**
   * Argument structures acceptable here. A frame that supplies an accusative
   * object must not accept an intransitive verb, or the clause comes out as
   * `*Enerjimi korkalım`.
   */
  valency?: Valency[];
  /** Affective valences acceptable here; omit to accept any. */
  valence?: Valence[];
}

export interface AdjSlot {
  kind: 'adj';
  field?: Field;
  /** Renders as a predicate with a personal ending: `yorgun` → `yorgunum`. */
  predicative?: Person;
  shared?: boolean;
}

export interface InterjSlot {
  kind: 'interj';
  field?: Field;
}

export interface PronounSlot {
  kind: 'pronoun';
  person: PronounPerson;
  case: PronounCase;
}

export interface NameSlot {
  kind: 'name';
  /** Renders as a vocative, followed by a comma. */
  comma?: boolean;
}

/**
 * The yes/no particle written as its own word. It harmonises with the word
 * before it and carries the person ending, so `iyi` + 2sg is `iyi misin`.
 */
export interface QuestionSlot {
  kind: 'question';
  person: Person;
}

export interface FixedSlot {
  kind: 'fixed';
  text: string;
}

export type Constituent =
  | NounSlot
  | VerbSlot
  | AdjSlot
  | InterjSlot
  | PronounSlot
  | NameSlot
  | QuestionSlot
  | FixedSlot;

export interface Frame {
  /** How elaborate the framing is, in [0, 1]. Drives the incongruity signal. */
  register: number;
  /** Constituents in Turkish order — the verb, when present, comes last. */
  parts: Constituent[];
  /** Punctuation for the finished clause. */
  end?: '.' | '!' | '?';
}

/** A request for one content word from the speaker's vocabulary. */
export interface PickRequest {
  pos: 'noun' | 'verb' | 'adj' | 'interj';
  field: Field | undefined;
  /** Prefer words the speaker has had success with. */
  shared: boolean;
  /** Acceptable argument structures, for verb slots. */
  valency: Valency[] | undefined;
  /** Acceptable affective valences, for verb slots. */
  valence: Valence[] | undefined;
  /** Lexemes already used in this clause; repeating one reads as a glitch. */
  exclude: ReadonlySet<string>;
  /**
   * Whether an off-topic word may be substituted when the field is empty.
   * Allowed for nouns and verbs (an imprecise word is still a sentence);
   * refused for adjectives, where it produced clauses like `*İyiyim!` as a
   * complaint about hunger.
   */
  allowFieldRelaxation: boolean;
}

/** What a caller must supply for a frame to be realised. */
export interface RealizeContext {
  /** Picks a content word, or null when the speaker knows nothing suitable. */
  pick(request: PickRequest): Lexeme | null;
  addresseeName: string | null;
}

export interface BuiltClause {
  text: string;
  lexemeIds: string[];
  suffixCount: number;
}

/** Counts the inflectional features a slot realises, for the complexity metric. */
function countSuffixes(slot: NounSlot | VerbSlot | AdjSlot): number {
  if (slot.kind === 'noun') {
    let n = 0;
    if (slot.plural) n++;
    if (slot.possessive && slot.possessive !== 'none') n++;
    if (slot.case && slot.case !== 'nom') n++;
    return n;
  }
  if (slot.kind === 'adj') return slot.predicative && slot.predicative !== '3sg' ? 1 : 0;
  let n = 1; // tense
  if (slot.negative) n++;
  if (slot.person !== '3sg') n++;
  if (slot.question) n++;
  return n;
}

const PERSON_PREDICATIVE: Record<Person, string> = {
  '1sg': '(y)Im',
  '2sg': 'sIn',
  '3sg': '',
  '1pl': '(y)Iz',
  '2pl': 'sInIz',
  '3pl': 'lAr',
};

/**
 * Realises one frame. Returns null when the speaker lacks a word for a
 * required slot — a bacterium with a two-word vocabulary genuinely cannot say
 * most things, and staying silent is the correct outcome.
 */
export function realizeFrame(frame: Frame, ctx: RealizeContext): BuiltClause | null {
  const words: string[] = [];
  const lexemeIds: string[] = [];
  const used = new Set<string>();
  let suffixCount = 0;

  /** Requests a content word and records it, so no clause repeats a lexeme. */
  const take = (
    pos: 'noun' | 'verb' | 'adj' | 'interj',
    field: Field | undefined,
    shared: boolean,
    valency?: Valency[],
    valence?: Valence[],
  ): Lexeme | null => {
    const lexeme = ctx.pick({
      pos,
      field,
      shared,
      valency,
      valence,
      exclude: used,
      allowFieldRelaxation: pos === 'noun' || pos === 'verb',
    });
    if (lexeme) {
      used.add(lexeme.id);
      lexemeIds.push(lexeme.id);
    }
    return lexeme;
  };

  for (const part of frame.parts) {
    switch (part.kind) {
      case 'fixed':
        words.push(part.text);
        break;

      case 'name': {
        if (!ctx.addresseeName) return null;
        words.push(part.comma ? `${ctx.addresseeName},` : ctx.addresseeName);
        break;
      }

      case 'pronoun':
        words.push(PRONOUNS[part.person][part.case]);
        break;

      case 'question': {
        const anchor = words[words.length - 1];
        if (!anchor) return null;
        // The particle harmonises with the preceding word and takes the person
        // ending: `iyi` + 2sg → `iyi misin`, `yorgun` + 2sg → `yorgun musun`.
        const particle = suffixOf(anchor.replace(/[,!?.]$/, ''), 'mI');
        words.push(attach(particle, PERSON_PREDICATIVE[part.person]));
        suffixCount += 1;
        break;
      }

      case 'noun': {
        const lexeme = take('noun', part.field, part.shared ?? false);
        if (!lexeme) return null;
        words.push(
          inflectNoun(lexeme.form, {
            plural: part.plural,
            possessive: part.possessive,
            case: part.case,
            ...lexeme.flags,
          }),
        );
        suffixCount += countSuffixes(part);
        break;
      }

      case 'adj': {
        const lexeme = take('adj', part.field, part.shared ?? false);
        if (!lexeme) return null;
        words.push(
          part.predicative
            ? attach(lexeme.form, PERSON_PREDICATIVE[part.predicative], lexeme.flags)
            : lexeme.form,
        );
        suffixCount += countSuffixes(part);
        break;
      }

      case 'interj': {
        const lexeme = take('interj', part.field, false);
        if (!lexeme) return null;
        words.push(lexeme.form);
        break;
      }

      case 'verb': {
        const lexeme = take('verb', part.field, part.shared ?? false, part.valency, part.valence);
        if (!lexeme) return null;
        words.push(
          conjugate(lexeme.form, {
            tense: part.tense,
            person: part.person,
            negative: part.negative,
            question: part.question,
            ...lexeme.flags,
          }),
        );
        suffixCount += countSuffixes(part);
        break;
      }
    }
  }

  if (words.length === 0) return null;
  const text = capitalize(words.join(' ')) + (frame.end ?? '.');
  return { text, lexemeIds, suffixCount };
}

/**
 * Frame inventory, grouped by speech act.
 *
 * Register rises with abstraction: complaining about hunger sits near 0,
 * asking what existence is sits near 1. The gap between an utterance's
 * register and the speaker's actual urgency is what the comedy metric reads.
 */
export const FRAMES: Record<SpeechAct, Frame[]> = {
  greet: [
    { register: 0.2, parts: [{ kind: 'interj', field: 'social' }, { kind: 'name' }], end: '!' },
    {
      register: 0.3,
      parts: [
        { kind: 'name', comma: true },
        { kind: 'adj', field: 'affect' },
        { kind: 'question', person: '2sg' },
      ],
      end: '?',
    },
    {
      register: 0.35,
      parts: [
        { kind: 'pronoun', person: '2sg', case: 'acc' },
        {
          kind: 'verb',
          field: 'cognition',
          tense: 'present',
          person: '1sg',
          valency: ['transitive'],
          valence: ['positive', 'neutral'],
        },
      ],
    },
  ],

  request: [
    {
      register: 0.15,
      parts: [
        { kind: 'pronoun', person: '1sg', case: 'dat' },
        { kind: 'noun', field: 'need', shared: true },
        {
          kind: 'verb',
          field: 'social',
          tense: 'imperative',
          person: '2sg',
          valency: ['ditransitive'],
        },
      ],
      end: '!',
    },
    {
      register: 0.3,
      parts: [
        { kind: 'noun', field: 'need', shared: true },
        {
          kind: 'verb',
          field: 'social',
          tense: 'optative',
          person: '1pl',
          valency: ['transitive', 'ditransitive'],
        },
      ],
    },
    {
      register: 0.35,
      parts: [
        { kind: 'noun', field: 'need', shared: true },
        {
          kind: 'verb',
          field: 'space',
          tense: 'aorist',
          person: '2sg',
          question: true,
          valency: ['transitive'],
        },
      ],
      end: '?',
    },
  ],

  complain: [
    {
      register: 0.05,
      parts: [{ kind: 'adj', field: 'body', predicative: '1sg' }],
      end: '!',
    },
    {
      register: 0.15,
      parts: [
        { kind: 'noun', field: 'need', possessive: '1sg' },
        {
          kind: 'verb',
          field: 'need',
          tense: 'present',
          person: '3sg',
          valency: ['intransitive'],
        },
      ],
    },
    {
      register: 0.2,
      parts: [
        { kind: 'noun', field: 'need' },
        { kind: 'fixed', text: 'yok' },
      ],
      end: '!',
    },
    {
      register: 0.25,
      parts: [
        { kind: 'noun', field: 'need', case: 'acc' },
        {
          kind: 'verb',
          field: 'space',
          tense: 'present',
          person: '1sg',
          negative: true,
          valency: ['transitive'],
        },
      ],
    },
  ],

  inform: [
    {
      register: 0.35,
      parts: [
        { kind: 'noun', field: 'space', case: 'loc' },
        { kind: 'noun', field: 'need' },
        { kind: 'fixed', text: 'var' },
      ],
    },
    {
      register: 0.4,
      parts: [
        { kind: 'noun', field: 'environment' },
        { kind: 'adj', field: 'environment' },
      ],
    },
    {
      register: 0.45,
      parts: [
        { kind: 'noun', field: 'space', case: 'dat' },
        {
          kind: 'verb',
          field: 'space',
          tense: 'present',
          person: '1sg',
          valency: ['dative'],
        },
      ],
    },
  ],

  offer: [
    {
      register: 0.3,
      parts: [
        { kind: 'pronoun', person: '2sg', case: 'dat' },
        { kind: 'noun', field: 'need', shared: true },
        {
          kind: 'verb',
          field: 'social',
          tense: 'present',
          person: '1sg',
          valency: ['ditransitive'],
          valence: ['positive', 'neutral'],
        },
      ],
    },
    {
      register: 0.4,
      parts: [
        { kind: 'noun', field: 'need', possessive: '1sg', case: 'acc' },
        {
          kind: 'verb',
          field: 'social',
          tense: 'optative',
          person: '1pl',
          valency: ['transitive', 'ditransitive'],
        },
      ],
    },
  ],

  ask: [
    {
      register: 0.5,
      parts: [{ kind: 'noun' }, { kind: 'fixed', text: 'ne' }, { kind: 'fixed', text: 'demek' }],
      end: '?',
    },
    {
      register: 0.45,
      parts: [{ kind: 'noun', field: 'need' }, { kind: 'fixed', text: 'nerede' }],
      end: '?',
    },
    {
      register: 0.55,
      parts: [
        { kind: 'pronoun', person: '1sg', case: 'acc' },
        {
          kind: 'verb',
          field: 'cognition',
          tense: 'present',
          person: '2sg',
          question: true,
          valency: ['transitive'],
        },
      ],
      end: '?',
    },
  ],

  warn: [
    {
      register: 0.2,
      parts: [
        { kind: 'noun', field: 'environment' },
        {
          kind: 'verb',
          field: 'need',
          tense: 'present',
          person: '3sg',
          valency: ['intransitive'],
        },
      ],
      end: '!',
    },
    {
      register: 0.25,
      parts: [
        { kind: 'noun', field: 'environment', case: 'abl' },
        {
          kind: 'verb',
          field: 'space',
          tense: 'imperative',
          person: '2pl',
          valency: ['intransitive'],
        },
      ],
      end: '!',
    },
  ],

  reflect: [
    {
      register: 0.95,
      parts: [{ kind: 'noun', field: 'existence' }, { kind: 'fixed', text: 'nedir' }],
      end: '?',
    },
    {
      register: 0.9,
      parts: [
        { kind: 'fixed', text: 'neden' },
        {
          kind: 'verb',
          field: 'existence',
          tense: 'present',
          person: '1pl',
          valency: ['intransitive'],
        },
      ],
      end: '?',
    },
    {
      register: 0.85,
      parts: [
        { kind: 'noun', field: 'cognition', possessive: '3sg', case: 'acc' },
        {
          kind: 'verb',
          field: 'space',
          tense: 'present',
          person: '1sg',
          valency: ['transitive'],
        },
      ],
    },
    {
      register: 1,
      parts: [
        { kind: 'noun', field: 'existence' },
        { kind: 'fixed', text: 'bir' },
        { kind: 'noun', field: 'existence' },
        { kind: 'question', person: '3sg' },
      ],
      end: '?',
    },
  ],

  celebrate: [
    {
      register: 0.3,
      parts: [
        { kind: 'interj', field: 'affect' },
        { kind: 'noun', field: 'body', possessive: '1sg' },
        { kind: 'fixed', text: 'var' },
      ],
      end: '!',
    },
    {
      register: 0.35,
      parts: [
        {
          kind: 'verb',
          field: 'body',
          tense: 'present',
          person: '1sg',
          valency: ['intransitive'],
          valence: ['positive', 'neutral'],
        },
      ],
      end: '!',
    },
  ],
};
