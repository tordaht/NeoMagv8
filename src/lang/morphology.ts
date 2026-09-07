/**
 * Turkish morphological realiser.
 *
 * Suffixes are written with the archiphonemes used in Turkish descriptive
 * grammar, so one spec covers every harmony variant:
 *
 *   `A`   → a / e            (two-way harmony)
 *   `I`   → ı / i / u / ü    (four-way harmony)
 *   `D`   → d / t            (voicing assimilation)
 *   `C`   → c / ç            (voicing assimilation)
 *   `(y)` `(s)` `(n)`        buffer consonant, only after a vowel-final stem
 *   `(I)` buffer vowel,      only after a consonant-final stem
 *
 * The alternations that Turkish conditions lexically rather than phonologically
 * — final-stop voicing (kitap → kitabı but sepet → sepeti) and syncope
 * (burun → burnum) — are driven by per-lexeme flags, never guessed from shape.
 */

import {
  dropFinalVowel,
  endsVoiceless,
  endsWithVowel,
  harmonyA,
  harmonyI,
  isVowel,
  isWide,
  softenFinal,
  syllableCount,
} from './phonology.js';

export type Case = 'nom' | 'acc' | 'dat' | 'loc' | 'abl' | 'gen' | 'ins';
export type Possessive = 'none' | '1sg' | '2sg' | '3sg' | '1pl' | '2pl' | '3pl';
export type Person = '1sg' | '2sg' | '3sg' | '1pl' | '2pl' | '3pl';
export type Tense =
  | 'present'
  | 'past'
  | 'aorist'
  | 'future'
  | 'necessitative'
  | 'imperative'
  | 'optative';

/** Lexically conditioned stem behaviour, stored on the lexeme. */
export interface StemFlags {
  /** Final p/ç/t/k voices before a vowel-initial suffix (kitap → kitabı). */
  softens?: boolean;
  /** Final-syllable high vowel is dropped before a vowel-initial suffix. */
  dropsVowel?: boolean;
}

export interface NounFeatures extends StemFlags {
  plural?: boolean;
  possessive?: Possessive;
  case?: Case;
}

export interface VerbFeatures extends StemFlags {
  tense: Tense;
  person?: Person;
  negative?: boolean;
  /** Renders the yes/no question particle as a separate orthographic word. */
  question?: boolean;
}

function resolveChar(symbol: string, sofar: string): string {
  switch (symbol) {
    case 'A':
      return harmonyA(sofar);
    case 'I':
      return harmonyI(sofar);
    case 'D':
      return endsVoiceless(sofar) ? 't' : 'd';
    case 'C':
      return endsVoiceless(sofar) ? 'ç' : 'c';
    default:
      return symbol;
  }
}

/** Whether an optional group `(x)` surfaces for a given stem. */
function groupSurfaces(inner: string, stemEndsVowel: boolean): boolean {
  // `(I)` is a buffer *vowel*, needed only after consonants; the buffer
  // consonants `(y)`, `(s)`, `(n)` are needed only after vowels.
  return inner === 'I' ? !stemEndsVowel : stemEndsVowel;
}

/** First phoneme the spec would emit, or null if it emits nothing. */
function firstEmitted(stem: string, spec: string): string | null {
  const stemEndsVowel = endsWithVowel(stem);
  let i = 0;
  while (i < spec.length) {
    if (spec[i] === '(') {
      const close = spec.indexOf(')', i);
      const inner = spec.slice(i + 1, close);
      i = close + 1;
      if (groupSurfaces(inner, stemEndsVowel)) return resolveChar(inner, stem);
      continue;
    }
    return resolveChar(spec[i], stem);
  }
  return null;
}

/**
 * Realises a suffix against a stem, returning the (possibly alternated) stem
 * and the surface form of the suffix separately. Callers that need only the
 * suffix — the question particle, which is written as its own word — use this
 * rather than string-slicing the joined form.
 */
export function realize(
  stem: string,
  spec: string,
  flags: StemFlags = {},
): { stem: string; suffix: string } {
  if (spec === '') return { stem, suffix: '' };

  const first = firstEmitted(stem, spec);
  const vowelInitial = first !== null && isVowel(first);

  let base = stem;
  if (vowelInitial) {
    if (flags.dropsVowel) base = dropFinalVowel(base);
    if (flags.softens) base = softenFinal(base);
  }

  const stemEndsVowel = endsWithVowel(stem);
  let out = base;
  let i = 0;
  while (i < spec.length) {
    if (spec[i] === '(') {
      const close = spec.indexOf(')', i);
      const inner = spec.slice(i + 1, close);
      i = close + 1;
      if (groupSurfaces(inner, stemEndsVowel)) out += resolveChar(inner, out);
      continue;
    }
    out += resolveChar(spec[i], out);
    i++;
  }
  return { stem: base, suffix: out.slice(base.length) };
}

/**
 * Attaches one archiphonemic suffix spec to a stem, applying harmony,
 * assimilation and — when the lexeme allows it — the stem alternations.
 */
export function attach(stem: string, spec: string, flags: StemFlags = {}): string {
  const { stem: base, suffix } = realize(stem, spec, flags);
  return base + suffix;
}

/** Surface form of a suffix alone, e.g. the `mu` of `geliyor mu`. */
export function suffixOf(stem: string, spec: string): string {
  return realize(stem, spec).suffix;
}

/** Attaches several specs in order, re-evaluating harmony at each step. */
export function attachAll(stem: string, specs: readonly string[], flags: StemFlags = {}): string {
  // Only the first suffix can trigger a stem alternation; later ones attach to
  // an already-suffixed form.
  let out = attach(stem, specs[0] ?? '', flags);
  for (let i = 1; i < specs.length; i++) out = attach(out, specs[i]);
  return out;
}

const POSSESSIVE_SPECS: Record<Exclude<Possessive, 'none'>, string> = {
  '1sg': '(I)m',
  '2sg': '(I)n',
  '3sg': '(s)I',
  '1pl': '(I)mIz',
  '2pl': '(I)nIz',
  '3pl': 'lArI',
};

const CASE_SPECS: Record<Case, string> = {
  nom: '',
  acc: '(y)I',
  dat: '(y)A',
  loc: 'DA',
  abl: 'DAn',
  gen: '(n)In',
  ins: '(y)lA',
};

/** After a third-person possessive Turkish inserts the pronominal `n`. */
const CASE_SPECS_AFTER_3P: Record<Case, string> = {
  nom: '',
  acc: 'nI',
  dat: 'nA',
  loc: 'nDA',
  abl: 'nDAn',
  gen: 'nIn',
  ins: 'ylA',
};

/** Realises a noun: stem + plural + possessive + case. */
export function inflectNoun(stem: string, features: NounFeatures = {}): string {
  const { plural = false, possessive = 'none', case: nounCase = 'nom' } = features;
  const specs: string[] = [];
  if (plural) specs.push('lAr');
  if (possessive !== 'none') specs.push(POSSESSIVE_SPECS[possessive]);

  const thirdPerson = possessive === '3sg' || possessive === '3pl';
  const caseSpec = thirdPerson ? CASE_SPECS_AFTER_3P[nounCase] : CASE_SPECS[nounCase];
  if (caseSpec) specs.push(caseSpec);

  if (specs.length === 0) return stem;
  return attachAll(stem, specs, features);
}

/**
 * Monosyllabic verbs whose aorist is `-Ir` rather than the regular `-Ar`.
 * This list is closed in Turkish, so it is data rather than a rule.
 */
const AORIST_IR_EXCEPTIONS = new Set([
  'al', 'bil', 'bul', 'dur', 'gel', 'gör', 'kal', 'ol', 'öl', 'san', 'var', 'ver', 'vur',
]);

/** Chooses the aorist allomorph for a bare verb stem. */
export function aoristSpec(stem: string): string {
  if (endsWithVowel(stem)) return 'r';
  if (AORIST_IR_EXCEPTIONS.has(stem)) return 'Ir';
  return syllableCount(stem) <= 1 ? 'Ar' : 'Ir';
}

/**
 * Builds the `-Iyor` stem. `-yor` is the one suffix that does not harmonise,
 * but it forces the stem to end in a high vowel:
 *
 *   consonant-final → add a harmonised high vowel   (gel → geli-yor)
 *   wide vowel      → replace it with a harmonised high vowel
 *                     (bekle → bekli-yor, söyle → söylü-yor, konuşma → konuşmu-yor)
 *   high vowel      → keep it                        (oku → oku-yor)
 *
 * Note that the replacement harmonises with the *preceding* syllable, which is
 * why `söyle` gives `söylüyor` rather than `*söyliyor`.
 */
function progressiveStem(stem: string, flags: StemFlags): string {
  if (endsWithVowel(stem)) {
    const last = stem[stem.length - 1];
    if (!isWide(last)) return stem;
    const trimmed = stem.slice(0, -1);
    return trimmed + harmonyI(trimmed);
  }
  let base = stem;
  if (flags.dropsVowel) base = dropFinalVowel(base);
  if (flags.softens) base = softenFinal(base);
  return base + harmonyI(base);
}

const PERSON_AFTER_PAST: Record<Person, string> = {
  '1sg': 'm',
  '2sg': 'n',
  '3sg': '',
  '1pl': 'k',
  '2pl': 'nIz',
  '3pl': 'lAr',
};

const PERSON_GENERAL: Record<Person, string> = {
  '1sg': '(y)Im',
  '2sg': 'sIn',
  '3sg': '',
  '1pl': '(y)Iz',
  '2pl': 'sInIz',
  '3pl': 'lAr',
};

/** Negative aorist is suppletive in the first person (gelmem, gelmeyiz). */
function negativeAorist(stem: string, person: Person): string {
  const negated = attach(stem, 'mA');
  if (person === '1sg') return attach(negated, 'm');
  if (person === '1pl') return attach(negated, '(y)Iz');
  return attach(attach(negated, 'z'), PERSON_GENERAL[person]);
}

/** Realises a verb with tense, person, polarity and optional question particle. */
export function conjugate(stem: string, features: VerbFeatures): string {
  const { tense, person = '3sg', negative = false, question = false } = features;

  if (tense === 'imperative') {
    // 2sg imperative is the bare stem; 2pl adds -(y)In.
    const base = negative ? attach(stem, 'mA', features) : stem;
    const form = person === '2pl' ? attach(base, '(y)In', negative ? {} : features) : base;
    return question ? `${form} ${suffixOf(form, 'mI')}` : form;
  }

  if (tense === 'optative') {
    const base = negative ? attach(stem, 'mA', features) : stem;
    return attach(base, person === '1sg' ? '(y)AyIm' : '(y)AlIm', negative ? {} : features);
  }

  let body: string;
  let personSpec = PERSON_GENERAL[person];

  switch (tense) {
    case 'present': {
      const base = negative ? attach(stem, 'mA', features) : stem;
      body = `${progressiveStem(base, negative ? {} : features)}yor`;
      break;
    }
    case 'past': {
      const base = negative ? attach(stem, 'mA', features) : stem;
      body = attach(base, 'DI', negative ? {} : features);
      personSpec = PERSON_AFTER_PAST[person];
      break;
    }
    case 'aorist': {
      if (negative) {
        const form = negativeAorist(stem, person);
        return question ? `${form} ${suffixOf(form, 'mI')}` : form;
      }
      body = attach(stem, aoristSpec(stem), features);
      break;
    }
    case 'future': {
      const base = negative ? attach(stem, 'mA', features) : stem;
      // -(y)AcAk voices its final k before a vowel-initial person suffix.
      body = attach(base, '(y)AcAk', negative ? {} : features);
      const firstOfPerson = firstEmitted(body, personSpec);
      if (firstOfPerson !== null && isVowel(firstOfPerson)) body = softenFinal(body);
      break;
    }
    case 'necessitative': {
      const base = negative ? attach(stem, 'mA', features) : stem;
      body = attach(base, 'mAlI', negative ? {} : features);
      break;
    }
  }

  if (question) {
    // Past keeps the person marker on the verb ("geldin mi?"); the other tenses
    // move it onto the particle ("geliyor musun?").
    if (tense === 'past') {
      const inflected = attach(body, personSpec);
      return `${inflected} ${suffixOf(inflected, 'mI')}`;
    }
    const particle = suffixOf(body, 'mI');
    return `${body} ${attach(particle, personSpec)}`;
  }

  return attach(body, personSpec);
}

export type DerivationSuffix = 'lIk' | 'CI' | 'lI' | 'sIz' | 'lAn' | 'lAş' | 'mA' | '(y)Iş';
export type DerivedPos = 'noun' | 'adj' | 'verb';

/**
 * What each derivational suffix produces, which part of speech it attaches to,
 * and how the resulting stem behaves under further inflection. `-lIk` ends in
 * a `k` that voices (açlık → açlığım), so a word coined at run time carries
 * the right flag from the start rather than inheriting its parent's.
 */
const DERIVATIONS: Record<
  DerivationSuffix,
  { pos: DerivedPos; from: DerivedPos[]; flags: StemFlags }
> = {
  lIk: { pos: 'noun', from: ['noun', 'adj'], flags: { softens: true } },
  CI: { pos: 'noun', from: ['noun'], flags: {} },
  lI: { pos: 'adj', from: ['noun'], flags: {} },
  sIz: { pos: 'adj', from: ['noun'], flags: {} },
  lAn: { pos: 'verb', from: ['noun', 'adj'], flags: {} },
  lAş: { pos: 'verb', from: ['noun', 'adj'], flags: {} },
  // Deverbal nominalisers: bölme (a division), bakış (a glance), geliş (arrival).
  mA: { pos: 'noun', from: ['verb'], flags: {} },
  '(y)Iş': { pos: 'noun', from: ['verb'], flags: {} },
};

/**
 * Derivational suffixes that can attach to a stem of the given part of speech.
 * Accepts any tag so callers can pass a wider part-of-speech union; parts of
 * speech with no productive derivations (adverbs, interjections) return none.
 */
export function derivationsFor(pos: string): DerivationSuffix[] {
  return (Object.keys(DERIVATIONS) as DerivationSuffix[]).filter((suffix) =>
    (DERIVATIONS[suffix].from as string[]).includes(pos),
  );
}

export interface DerivedForm {
  form: string;
  pos: DerivedPos;
  flags: StemFlags;
  /** Denominal verbs (-lAn, -lAş) are intransitive: `sıcaklan`, `birleş`. */
  intransitive: boolean;
}

/**
 * Applies a derivational suffix, e.g. `aç` + `lIk` → `açlık`, returning the
 * resulting part of speech and stem flags alongside the surface form.
 */
export function deriveLexeme(
  stem: string,
  suffix: DerivationSuffix,
  flags: StemFlags = {},
): DerivedForm {
  const spec = DERIVATIONS[suffix];
  return {
    form: attach(stem, suffix, flags),
    pos: spec.pos,
    flags: { ...spec.flags },
    intransitive: spec.pos === 'verb',
  };
}

/** Surface form only, for callers that do not need the derived features. */
export function derive(stem: string, suffix: DerivationSuffix, flags: StemFlags = {}): string {
  return deriveLexeme(stem, suffix, flags).form;
}

export const DERIVATION_SUFFIXES = Object.keys(DERIVATIONS) as DerivationSuffix[];

/** Capitalises using Turkish casing rules (i → İ). */
export function capitalize(word: string): string {
  if (word.length === 0) return word;
  const first = word[0] === 'i' ? 'İ' : word[0].toLocaleUpperCase('tr');
  return first + word.slice(1);
}
