/**
 * Seed lexicon for the bacterial language.
 *
 * Every entry carries the two things the morphology layer cannot infer from
 * spelling: its part of speech and its lexically conditioned stem behaviour.
 * `softens` in particular is per-word in Turkish — `tat → tadı` but
 * `at → atı` — so it is recorded here rather than derived from the final
 * letter. The list is deliberately small and hand-checked; the population
 * grows it at run time by derivation (see `evolution.ts`).
 */

import type { StemFlags } from './morphology.js';

export type Pos = 'noun' | 'verb' | 'adj' | 'adv' | 'interj';

/**
 * Argument structure. Without this the grammar happily produced
 * `*Enerjimi korkalım` — an accusative object on an intransitive verb. A slot
 * that supplies an object now only accepts a verb that can govern one.
 */
export type Valency = 'intransitive' | 'transitive' | 'dative' | 'ditransitive';

/**
 * Affective valence. Greeting and offering frames are grammatical with any
 * verb, but `Seni unutuyorum.` is a poor greeting; slots that carry goodwill
 * ask for non-negative verbs.
 */
export type Valence = 'positive' | 'neutral' | 'negative';

/**
 * Semantic fields double as the topic space: an utterance is "about" a field,
 * and comprehension depends partly on whether speaker and listener share
 * vocabulary in it.
 */
export type Field =
  | 'need'
  | 'body'
  | 'space'
  | 'social'
  | 'affect'
  | 'cognition'
  | 'existence'
  | 'environment';

export const FIELDS: readonly Field[] = [
  'need',
  'body',
  'space',
  'social',
  'affect',
  'cognition',
  'existence',
  'environment',
];

export interface SeedEntry {
  form: string;
  pos: Pos;
  field: Field;
  gloss: string;
  flags?: StemFlags;
  /** Required for verbs; ignored for everything else. */
  valency?: Valency;
  /** Defaults to neutral. */
  valence?: Valence;
}

/** Nouns, adjectives and adverbs. */
const NOMINALS: SeedEntry[] = [
  // need
  { form: 'besin', pos: 'noun', field: 'need', gloss: 'nutrient' },
  { form: 'enerji', pos: 'noun', field: 'need', gloss: 'energy' },
  { form: 'güç', pos: 'noun', field: 'need', gloss: 'strength', flags: { softens: true } },
  { form: 'sıvı', pos: 'noun', field: 'need', gloss: 'liquid' },
  { form: 'tat', pos: 'noun', field: 'need', gloss: 'taste', flags: { softens: true } },
  // body
  { form: 'hücre', pos: 'noun', field: 'body', gloss: 'cell' },
  { form: 'zar', pos: 'noun', field: 'body', gloss: 'membrane' },
  { form: 'çekirdek', pos: 'noun', field: 'body', gloss: 'nucleus', flags: { softens: true } },
  { form: 'yavru', pos: 'noun', field: 'body', gloss: 'offspring' },
  { form: 'kanat', pos: 'noun', field: 'body', gloss: 'flagellum', flags: { softens: true } },
  // space
  { form: 'yer', pos: 'noun', field: 'space', gloss: 'place' },
  { form: 'yol', pos: 'noun', field: 'space', gloss: 'path' },
  { form: 'kuzey', pos: 'noun', field: 'space', gloss: 'north' },
  { form: 'güney', pos: 'noun', field: 'space', gloss: 'south' },
  { form: 'iz', pos: 'noun', field: 'space', gloss: 'trace' },
  { form: 'köşe', pos: 'noun', field: 'space', gloss: 'corner' },
  // social
  { form: 'dost', pos: 'noun', field: 'social', gloss: 'friend' },
  { form: 'arkadaş', pos: 'noun', field: 'social', gloss: 'companion' },
  { form: 'komşu', pos: 'noun', field: 'social', gloss: 'neighbour' },
  { form: 'ses', pos: 'noun', field: 'social', gloss: 'voice' },
  { form: 'ad', pos: 'noun', field: 'social', gloss: 'name' },
  { form: 'kalabalık', pos: 'noun', field: 'social', gloss: 'crowd', flags: { softens: true } },
  // affect
  { form: 'korku', pos: 'noun', field: 'affect', gloss: 'fear' },
  { form: 'sevinç', pos: 'noun', field: 'affect', gloss: 'joy' },
  { form: 'acı', pos: 'noun', field: 'affect', gloss: 'pain' },
  { form: 'umut', pos: 'noun', field: 'affect', gloss: 'hope', flags: { softens: true } },
  { form: 'özlem', pos: 'noun', field: 'affect', gloss: 'longing' },
  // cognition
  { form: 'söz', pos: 'noun', field: 'cognition', gloss: 'word' },
  { form: 'anlam', pos: 'noun', field: 'cognition', gloss: 'meaning' },
  { form: 'soru', pos: 'noun', field: 'cognition', gloss: 'question' },
  { form: 'düş', pos: 'noun', field: 'cognition', gloss: 'dream' },
  { form: 'akıl', pos: 'noun', field: 'cognition', gloss: 'mind', flags: { dropsVowel: true } },
  // existence
  { form: 'can', pos: 'noun', field: 'existence', gloss: 'life' },
  { form: 'ölüm', pos: 'noun', field: 'existence', gloss: 'death' },
  { form: 'varlık', pos: 'noun', field: 'existence', gloss: 'existence', flags: { softens: true } },
  { form: 'an', pos: 'noun', field: 'existence', gloss: 'moment' },
  { form: 'son', pos: 'noun', field: 'existence', gloss: 'end' },
  // environment
  { form: 'ışık', pos: 'noun', field: 'environment', gloss: 'light', flags: { softens: true } },
  { form: 'atık', pos: 'noun', field: 'environment', gloss: 'waste', flags: { softens: true } },
  { form: 'toprak', pos: 'noun', field: 'environment', gloss: 'ground', flags: { softens: true } },
  { form: 'koku', pos: 'noun', field: 'environment', gloss: 'scent' },
  { form: 'renk', pos: 'noun', field: 'environment', gloss: 'colour', flags: { softens: true } },
  { form: 'gölge', pos: 'noun', field: 'environment', gloss: 'shadow' },
  { form: 'gece', pos: 'noun', field: 'environment', gloss: 'night' },

  // adjectives
  { form: 'küçük', pos: 'adj', field: 'body', gloss: 'small', flags: { softens: true } },
  { form: 'büyük', pos: 'adj', field: 'body', gloss: 'large', flags: { softens: true } },
  { form: 'hızlı', pos: 'adj', field: 'space', gloss: 'fast' },
  { form: 'yavaş', pos: 'adj', field: 'space', gloss: 'slow' },
  { form: 'yakın', pos: 'adj', field: 'space', gloss: 'near' },
  { form: 'uzak', pos: 'adj', field: 'space', gloss: 'far', flags: { softens: true } },
  { form: 'sıcak', pos: 'adj', field: 'environment', gloss: 'warm', flags: { softens: true } },
  { form: 'soğuk', pos: 'adj', field: 'environment', gloss: 'cold', flags: { softens: true } },
  { form: 'karanlık', pos: 'adj', field: 'environment', gloss: 'dark', flags: { softens: true } },
  { form: 'boş', pos: 'adj', field: 'need', gloss: 'empty' },
  { form: 'dolu', pos: 'adj', field: 'need', gloss: 'full' },
  { form: 'yeni', pos: 'adj', field: 'cognition', gloss: 'new' },
  { form: 'tuhaf', pos: 'adj', field: 'cognition', gloss: 'strange' },
  { form: 'güzel', pos: 'adj', field: 'affect', gloss: 'beautiful' },
  { form: 'yorgun', pos: 'adj', field: 'body', gloss: 'tired' },
  { form: 'iyi', pos: 'adj', field: 'affect', gloss: 'well' },
  { form: 'kötü', pos: 'adj', field: 'affect', gloss: 'bad' },
  { form: 'sessiz', pos: 'adj', field: 'social', gloss: 'silent' },
  { form: 'tehlike', pos: 'noun', field: 'environment', gloss: 'danger' },
  { form: 'yardım', pos: 'noun', field: 'social', gloss: 'help' },

  // adverbs
  { form: 'çok', pos: 'adv', field: 'cognition', gloss: 'very' },
  { form: 'az', pos: 'adv', field: 'cognition', gloss: 'little' },
  { form: 'hep', pos: 'adv', field: 'cognition', gloss: 'always' },
  { form: 'şimdi', pos: 'adv', field: 'existence', gloss: 'now' },
  { form: 'sonra', pos: 'adv', field: 'existence', gloss: 'later' },
  { form: 'belki', pos: 'adv', field: 'cognition', gloss: 'perhaps' },
  { form: 'yine', pos: 'adv', field: 'existence', gloss: 'again' },

  // interjections
  { form: 'merhaba', pos: 'interj', field: 'social', gloss: 'hello' },
  { form: 'selam', pos: 'interj', field: 'social', gloss: 'greetings' },
  { form: 'hey', pos: 'interj', field: 'social', gloss: 'hey' },
  { form: 'vay', pos: 'interj', field: 'affect', gloss: 'wow' },
  { form: 'eyvah', pos: 'interj', field: 'affect', gloss: 'alas' },
];

/**
 * Verbs, stored as bare stems (the second-person singular imperative), which is
 * the form every other tense is built from.
 */
const VERBS: SeedEntry[] = [
  { form: 'ye', pos: 'verb', field: 'need', gloss: 'eat' , valency: 'transitive' },
  { form: 'iç', pos: 'verb', field: 'need', gloss: 'drink' , valency: 'transitive' },
  { form: 'ara', pos: 'verb', field: 'space', gloss: 'search' , valency: 'transitive' },
  { form: 'bul', pos: 'verb', field: 'space', gloss: 'find' , valency: 'transitive' },
  { form: 'git', pos: 'verb', field: 'space', gloss: 'go', flags: { softens: true } , valency: 'dative' },
  { form: 'gel', pos: 'verb', field: 'space', gloss: 'come' , valency: 'dative' },
  { form: 'kaç', pos: 'verb', field: 'space', gloss: 'flee' , valency: 'intransitive', valence: 'negative' },
  { form: 'yaklaş', pos: 'verb', field: 'space', gloss: 'approach' , valency: 'dative' },
  { form: 'kal', pos: 'verb', field: 'space', gloss: 'stay' , valency: 'intransitive' },
  { form: 'dön', pos: 'verb', field: 'space', gloss: 'turn' , valency: 'dative' },
  { form: 'taşı', pos: 'verb', field: 'space', gloss: 'carry' , valency: 'transitive' },
  { form: 'gör', pos: 'verb', field: 'cognition', gloss: 'see' , valency: 'transitive' },
  { form: 'bil', pos: 'verb', field: 'cognition', gloss: 'know' , valency: 'transitive' },
  { form: 'öğren', pos: 'verb', field: 'cognition', gloss: 'learn' , valency: 'transitive', valence: 'positive' },
  { form: 'anla', pos: 'verb', field: 'cognition', gloss: 'understand' , valency: 'transitive', valence: 'positive' },
  { form: 'düşün', pos: 'verb', field: 'cognition', gloss: 'think' , valency: 'intransitive' },
  { form: 'sor', pos: 'verb', field: 'cognition', gloss: 'ask' , valency: 'transitive' },
  { form: 'unut', pos: 'verb', field: 'cognition', gloss: 'forget' , valency: 'transitive', valence: 'negative' },
  { form: 'konuş', pos: 'verb', field: 'social', gloss: 'speak' , valency: 'intransitive' },
  { form: 'söyle', pos: 'verb', field: 'social', gloss: 'say' , valency: 'ditransitive' },
  { form: 'dinle', pos: 'verb', field: 'social', gloss: 'listen' , valency: 'transitive' },
  { form: 'ver', pos: 'verb', field: 'social', gloss: 'give' , valency: 'ditransitive', valence: 'positive' },
  { form: 'al', pos: 'verb', field: 'social', gloss: 'take' , valency: 'transitive' },
  { form: 'paylaş', pos: 'verb', field: 'social', gloss: 'share' , valency: 'ditransitive', valence: 'positive' },
  { form: 'topla', pos: 'verb', field: 'social', gloss: 'gather' , valency: 'transitive' },
  { form: 'bekle', pos: 'verb', field: 'social', gloss: 'wait' , valency: 'transitive' },
  { form: 'büyü', pos: 'verb', field: 'body', gloss: 'grow' , valency: 'intransitive', valence: 'positive' },
  { form: 'böl', pos: 'verb', field: 'body', gloss: 'divide' , valency: 'transitive' },
  { form: 'yaşa', pos: 'verb', field: 'existence', gloss: 'live' , valency: 'intransitive', valence: 'positive' },
  { form: 'öl', pos: 'verb', field: 'existence', gloss: 'die' , valency: 'intransitive', valence: 'negative' },
  { form: 'kork', pos: 'verb', field: 'affect', gloss: 'fear' , valency: 'intransitive', valence: 'negative' },
  { form: 'sev', pos: 'verb', field: 'affect', gloss: 'love' , valency: 'transitive', valence: 'positive' },
  { form: 'iste', pos: 'verb', field: 'affect', gloss: 'want' , valency: 'transitive' },
  { form: 'üşü', pos: 'verb', field: 'environment', gloss: 'be cold' , valency: 'intransitive', valence: 'negative' },
  { form: 'azal', pos: 'verb', field: 'need', gloss: 'diminish' , valency: 'intransitive', valence: 'negative' },
  { form: 'art', pos: 'verb', field: 'need', gloss: 'increase' , valency: 'intransitive' },
  { form: 'bit', pos: 'verb', field: 'need', gloss: 'run out' , valency: 'intransitive', valence: 'negative' },
];

export const SEED_LEXEMES: readonly SeedEntry[] = [...NOMINALS, ...VERBS];

/**
 * Personal pronouns are irregular in the dative and genitive (ben → bana,
 * benim) so they are stored as full paradigms rather than run through the
 * regular machinery.
 */
export const PRONOUNS = {
  '1sg': { nom: 'ben', acc: 'beni', dat: 'bana', gen: 'benim', loc: 'bende', abl: 'benden' },
  '2sg': { nom: 'sen', acc: 'seni', dat: 'sana', gen: 'senin', loc: 'sende', abl: 'senden' },
  '3sg': { nom: 'o', acc: 'onu', dat: 'ona', gen: 'onun', loc: 'onda', abl: 'ondan' },
  '1pl': { nom: 'biz', acc: 'bizi', dat: 'bize', gen: 'bizim', loc: 'bizde', abl: 'bizden' },
} as const;

/**
 * Closed-class items the grammar emits as `fixed` constituents, plus the
 * commonest function words a player might type. These are not part of the open
 * lexicon: they are not learned, not selected on, and never coined — so player
 * input containing them does not silently inflate the lexicon.
 */
export const FUNCTION_WORDS: ReadonlySet<string> = new Set([
  've', 'ile', 'ama', 'fakat', 'çünkü', 'ki', 'de', 'da', 'ya',
  'ne', 'nedir', 'neden', 'nerede', 'nereye', 'nasıl', 'kim', 'hangi', 'kaç',
  'mi', 'mı', 'mu', 'mü', 'demek', 'var', 'yok', 'bir', 'bu', 'şu',
  'ben', 'sen', 'biz', 'siz', 'onlar', 'için', 'gibi', 'değil', 'evet', 'hayır',
]);

export type PronounPerson = keyof typeof PRONOUNS;
export type PronounCase = keyof (typeof PRONOUNS)['1sg'];
