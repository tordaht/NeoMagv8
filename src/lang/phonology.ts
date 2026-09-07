/**
 * Turkish phonology primitives.
 *
 * Everything the morphology layer needs to know about Turkish sound structure
 * lives here: vowel classes, harmony, consonant voicing and the final-stop
 * alternations. Kept separate from `morphology.ts` so the rules can be tested
 * in isolation against known forms.
 */

export const VOWELS = 'aeıioöuü';
export const BACK_VOWELS = 'aıou';
export const FRONT_VOWELS = 'eiöü';
export const ROUND_VOWELS = 'oöuü';
/** Wide (open) vowels — these are the ones that narrow before `-Iyor`. */
export const WIDE_VOWELS = 'aeoö';

/** Consonants that devoice a following `D`/`C` archiphoneme (fıstıkçı şahap). */
export const VOICELESS = 'fstkçşhp';

/** Final stops that voice when a vowel-initial suffix follows: p→b, ç→c, t→d, k→ğ. */
const FINAL_SOFTENING: Record<string, string> = { p: 'b', ç: 'c', t: 'd', k: 'ğ' };

/** `nk` softens to `ng` rather than `nğ` (renk → rengi). */
const NASAL_SOFTENING = 'ng';

export function isVowel(ch: string): boolean {
  return VOWELS.includes(ch);
}

export function isBack(vowel: string): boolean {
  return BACK_VOWELS.includes(vowel);
}

export function isRound(vowel: string): boolean {
  return ROUND_VOWELS.includes(vowel);
}

export function isWide(vowel: string): boolean {
  return WIDE_VOWELS.includes(vowel);
}

export function endsWithVowel(word: string): boolean {
  return word.length > 0 && isVowel(word[word.length - 1]);
}

/** Last vowel of a word, or `null` for vowel-less strings. */
export function lastVowel(word: string): string | null {
  for (let i = word.length - 1; i >= 0; i--) {
    if (isVowel(word[i])) return word[i];
  }
  return null;
}

/** Number of vowels — Turkish syllable count for practical purposes. */
export function syllableCount(word: string): number {
  let count = 0;
  for (const ch of word) if (isVowel(ch)) count++;
  return count;
}

/**
 * Resolves the two-way harmony archiphoneme `A` → `a` (back) or `e` (front).
 */
export function harmonyA(stem: string): string {
  const v = lastVowel(stem);
  return v !== null && isBack(v) ? 'a' : 'e';
}

/**
 * Resolves the four-way harmony archiphoneme `I` → `ı` / `i` / `u` / `ü`,
 * matching the last vowel in both backness and roundness.
 */
export function harmonyI(stem: string): string {
  const v = lastVowel(stem);
  if (v === null) return 'i';
  const back = isBack(v);
  const round = isRound(v);
  if (back) return round ? 'u' : 'ı';
  return round ? 'ü' : 'i';
}

/** Narrows a wide vowel while keeping backness and roundness (e → i, a → ı). */
export function narrowVowel(vowel: string): string {
  switch (vowel) {
    case 'a':
      return 'ı';
    case 'e':
      return 'i';
    case 'o':
      return 'u';
    case 'ö':
      return 'ü';
    default:
      return vowel;
  }
}

/** True when the final consonant devoices a following `D`/`C`. */
export function endsVoiceless(word: string): boolean {
  return word.length > 0 && VOICELESS.includes(word[word.length - 1]);
}

/**
 * Applies final-stop voicing before a vowel-initial suffix (kitap → kitab-).
 *
 * This alternation is lexically conditioned in Turkish — `kitap → kitabı` but
 * `sepet → sepeti`, not `*sepedi` — so callers pass the per-lexeme flag rather
 * than the rule firing on shape alone.
 */
export function softenFinal(stem: string): string {
  if (stem.length < 2) return stem;
  const last = stem[stem.length - 1];
  const prev = stem[stem.length - 2];
  if (last === 'k' && prev === 'n') return stem.slice(0, -2) + NASAL_SOFTENING;
  const soft = FINAL_SOFTENING[last];
  return soft ? stem.slice(0, -1) + soft : stem;
}

/**
 * Drops the high vowel of the final syllable (burun → burn-, ağız → ağz-).
 * Also lexically conditioned; the caller decides whether it applies.
 */
export function dropFinalVowel(stem: string): string {
  for (let i = stem.length - 1; i >= 0; i--) {
    if (isVowel(stem[i])) return stem.slice(0, i) + stem.slice(i + 1);
  }
  return stem;
}
