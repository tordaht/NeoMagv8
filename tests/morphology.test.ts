import { describe, expect, it } from 'vitest';
import {
  aoristSpec,
  attach,
  capitalize,
  conjugate,
  derive,
  deriveLexeme,
  inflectNoun,
} from '../src/lang/morphology.js';
import { harmonyA, harmonyI, softenFinal } from '../src/lang/phonology.js';

describe('vowel harmony', () => {
  it('resolves the two-way archiphoneme A', () => {
    expect(harmonyA('kitap')).toBe('a');
    expect(harmonyA('ev')).toBe('e');
    expect(harmonyA('okul')).toBe('a');
    expect(harmonyA('göz')).toBe('e');
  });

  it('resolves the four-way archiphoneme I in all four cells', () => {
    expect(harmonyI('kitap')).toBe('ı'); // back unrounded
    expect(harmonyI('ev')).toBe('i'); // front unrounded
    expect(harmonyI('okul')).toBe('u'); // back rounded
    expect(harmonyI('göz')).toBe('ü'); // front rounded
  });

  it('propagates harmony across stacked suffixes', () => {
    // ev + ler + im + de — each suffix harmonises with what precedes it.
    expect(inflectNoun('ev', { plural: true, possessive: '1sg', case: 'loc' })).toBe('evlerimde');
    expect(inflectNoun('okul', { plural: true, possessive: '1sg', case: 'loc' })).toBe(
      'okullarımda',
    );
  });
});

describe('consonant assimilation and softening', () => {
  it('devoices D after a voiceless consonant', () => {
    expect(inflectNoun('kitap', { case: 'loc' })).toBe('kitapta');
    expect(inflectNoun('ev', { case: 'loc' })).toBe('evde');
    expect(inflectNoun('ağaç', { case: 'abl' })).toBe('ağaçtan');
    expect(inflectNoun('göz', { case: 'abl' })).toBe('gözden');
  });

  it('voices a final stop before a vowel-initial suffix when the lexeme allows it', () => {
    expect(inflectNoun('kitap', { case: 'acc', softens: true })).toBe('kitabı');
    expect(inflectNoun('ağaç', { case: 'acc', softens: true })).toBe('ağacı');
    expect(inflectNoun('renk', { case: 'acc', softens: true })).toBe('rengi');
  });

  it('leaves lexemes that do not soften alone', () => {
    // `sepet` is a real counter-example: *sepedi is wrong.
    expect(inflectNoun('sepet', { case: 'acc' })).toBe('sepeti');
    expect(inflectNoun('at', { case: 'acc' })).toBe('atı');
  });

  it('applies nk → ng rather than nğ', () => {
    expect(softenFinal('renk')).toBe('reng');
  });

  it('drops the final high vowel for lexemes flagged for syncope', () => {
    expect(inflectNoun('burun', { possessive: '1sg', dropsVowel: true })).toBe('burnum');
    expect(inflectNoun('ağız', { possessive: '1sg', dropsVowel: true })).toBe('ağzım');
  });
});

describe('buffer consonants', () => {
  it('inserts y before a vowel-initial case suffix after a vowel', () => {
    expect(inflectNoun('kapı', { case: 'acc' })).toBe('kapıyı');
    expect(inflectNoun('kapı', { case: 'dat' })).toBe('kapıya');
    expect(inflectNoun('ev', { case: 'dat' })).toBe('eve');
  });

  it('inserts n in the genitive after a vowel', () => {
    expect(inflectNoun('kapı', { case: 'gen' })).toBe('kapının');
    expect(inflectNoun('ev', { case: 'gen' })).toBe('evin');
  });

  it('inserts s in the third-person possessive after a vowel', () => {
    expect(inflectNoun('kapı', { possessive: '3sg' })).toBe('kapısı');
    expect(inflectNoun('ev', { possessive: '3sg' })).toBe('evi');
  });

  it('inserts the pronominal n between a third-person possessive and a case', () => {
    expect(inflectNoun('kapı', { possessive: '3sg', case: 'acc' })).toBe('kapısını');
    expect(inflectNoun('ev', { possessive: '3sg', case: 'loc' })).toBe('evinde');
    expect(inflectNoun('ev', { possessive: '3sg', case: 'dat' })).toBe('evine');
  });

  it('inserts the buffer vowel only after consonants in the possessive', () => {
    expect(inflectNoun('ev', { possessive: '1sg' })).toBe('evim');
    expect(inflectNoun('kapı', { possessive: '1sg' })).toBe('kapım');
    expect(inflectNoun('okul', { possessive: '1pl' })).toBe('okulumuz');
  });
});

describe('present continuous', () => {
  it('adds a harmonised vowel to consonant-final stems', () => {
    expect(conjugate('gel', { tense: 'present', person: '3sg' })).toBe('geliyor');
    expect(conjugate('bak', { tense: 'present', person: '3sg' })).toBe('bakıyor');
    expect(conjugate('gör', { tense: 'present', person: '3sg' })).toBe('görüyor');
    expect(conjugate('konuş', { tense: 'present', person: '3sg' })).toBe('konuşuyor');
  });

  it('narrows a final wide vowel', () => {
    expect(conjugate('bekle', { tense: 'present', person: '3sg' })).toBe('bekliyor');
    expect(conjugate('başla', { tense: 'present', person: '3sg' })).toBe('başlıyor');
    expect(conjugate('ara', { tense: 'present', person: '3sg' })).toBe('arıyor');
  });

  it('keeps a final narrow vowel', () => {
    expect(conjugate('oku', { tense: 'present', person: '3sg' })).toBe('okuyor');
    expect(conjugate('yürü', { tense: 'present', person: '3sg' })).toBe('yürüyor');
  });

  it('voices the stem for lexemes flagged to soften', () => {
    expect(conjugate('git', { tense: 'present', person: '3sg', softens: true })).toBe('gidiyor');
    expect(conjugate('et', { tense: 'present', person: '3sg', softens: true })).toBe('ediyor');
  });

  it('attaches person endings that harmonise with -yor', () => {
    expect(conjugate('gel', { tense: 'present', person: '1sg' })).toBe('geliyorum');
    expect(conjugate('gel', { tense: 'present', person: '2sg' })).toBe('geliyorsun');
    expect(conjugate('gel', { tense: 'present', person: '1pl' })).toBe('geliyoruz');
    expect(conjugate('gel', { tense: 'present', person: '2pl' })).toBe('geliyorsunuz');
    expect(conjugate('gel', { tense: 'present', person: '3pl' })).toBe('geliyorlar');
  });

  it('negates by narrowing the negative marker', () => {
    expect(conjugate('gel', { tense: 'present', person: '3sg', negative: true })).toBe('gelmiyor');
    expect(conjugate('bak', { tense: 'present', person: '1sg', negative: true })).toBe('bakmıyorum');
    expect(conjugate('konuş', { tense: 'present', person: '3sg', negative: true })).toBe(
      'konuşmuyor',
    );
  });
});

describe('past tense', () => {
  it('assimilates the D of -DI and takes past person endings', () => {
    expect(conjugate('gel', { tense: 'past', person: '1sg' })).toBe('geldim');
    expect(conjugate('gel', { tense: 'past', person: '2sg' })).toBe('geldin');
    expect(conjugate('gel', { tense: 'past', person: '3sg' })).toBe('geldi');
    expect(conjugate('gel', { tense: 'past', person: '1pl' })).toBe('geldik');
    expect(conjugate('gel', { tense: 'past', person: '2pl' })).toBe('geldiniz');
    expect(conjugate('gel', { tense: 'past', person: '3pl' })).toBe('geldiler');
    expect(conjugate('bak', { tense: 'past', person: '1sg' })).toBe('baktım');
    expect(conjugate('konuş', { tense: 'past', person: '3sg' })).toBe('konuştu');
  });

  it('keeps the stem voiceless before the consonant-initial -DI', () => {
    expect(conjugate('git', { tense: 'past', person: '3sg', softens: true })).toBe('gitti');
  });

  it('negates', () => {
    expect(conjugate('gel', { tense: 'past', person: '1sg', negative: true })).toBe('gelmedim');
    expect(conjugate('bak', { tense: 'past', person: '3sg', negative: true })).toBe('bakmadı');
  });
});

describe('aorist', () => {
  it('uses -r after vowels', () => {
    expect(aoristSpec('oku')).toBe('r');
    expect(conjugate('oku', { tense: 'aorist', person: '3sg' })).toBe('okur');
    expect(conjugate('bekle', { tense: 'aorist', person: '3sg' })).toBe('bekler');
  });

  it('uses -Ar for regular monosyllables', () => {
    expect(conjugate('bak', { tense: 'aorist', person: '3sg' })).toBe('bakar');
    expect(conjugate('yaz', { tense: 'aorist', person: '3sg' })).toBe('yazar');
    expect(conjugate('sev', { tense: 'aorist', person: '3sg' })).toBe('sever');
  });

  it('uses -Ir for the closed list of monosyllabic exceptions', () => {
    expect(conjugate('gel', { tense: 'aorist', person: '3sg' })).toBe('gelir');
    expect(conjugate('al', { tense: 'aorist', person: '3sg' })).toBe('alır');
    expect(conjugate('bul', { tense: 'aorist', person: '3sg' })).toBe('bulur');
    expect(conjugate('gör', { tense: 'aorist', person: '3sg' })).toBe('görür');
    expect(conjugate('ver', { tense: 'aorist', person: '3sg' })).toBe('verir');
  });

  it('uses -Ir for polysyllabic consonant-final stems', () => {
    expect(conjugate('getir', { tense: 'aorist', person: '3sg' })).toBe('getirir');
    expect(conjugate('konuş', { tense: 'aorist', person: '3sg' })).toBe('konuşur');
    expect(conjugate('öğren', { tense: 'aorist', person: '3sg' })).toBe('öğrenir');
  });

  it('has a suppletive negative in the first person', () => {
    expect(conjugate('gel', { tense: 'aorist', person: '1sg', negative: true })).toBe('gelmem');
    expect(conjugate('gel', { tense: 'aorist', person: '1pl', negative: true })).toBe('gelmeyiz');
    expect(conjugate('gel', { tense: 'aorist', person: '3sg', negative: true })).toBe('gelmez');
    expect(conjugate('gel', { tense: 'aorist', person: '2sg', negative: true })).toBe('gelmezsin');
    expect(conjugate('bak', { tense: 'aorist', person: '1sg', negative: true })).toBe('bakmam');
  });
});

describe('future and necessitative', () => {
  it('voices the k of -AcAk before a vowel-initial person ending', () => {
    expect(conjugate('gel', { tense: 'future', person: '1sg' })).toBe('geleceğim');
    expect(conjugate('bak', { tense: 'future', person: '1sg' })).toBe('bakacağım');
    expect(conjugate('gel', { tense: 'future', person: '3sg' })).toBe('gelecek');
    expect(conjugate('gel', { tense: 'future', person: '2sg' })).toBe('geleceksin');
    expect(conjugate('oku', { tense: 'future', person: '3sg' })).toBe('okuyacak');
  });

  it('builds -mAlI forms', () => {
    expect(conjugate('gel', { tense: 'necessitative', person: '1sg' })).toBe('gelmeliyim');
    expect(conjugate('bak', { tense: 'necessitative', person: '1sg' })).toBe('bakmalıyım');
    expect(conjugate('gel', { tense: 'necessitative', person: '3sg' })).toBe('gelmeli');
  });
});

describe('imperative and optative', () => {
  it('uses the bare stem for the second-person singular imperative', () => {
    expect(conjugate('ver', { tense: 'imperative', person: '2sg' })).toBe('ver');
    expect(conjugate('gel', { tense: 'imperative', person: '2sg', negative: true })).toBe('gelme');
    expect(conjugate('ver', { tense: 'imperative', person: '2pl' })).toBe('verin');
    expect(conjugate('oku', { tense: 'imperative', person: '2pl' })).toBe('okuyun');
  });

  it('builds first-person optatives', () => {
    expect(conjugate('git', { tense: 'optative', person: '1pl', softens: true })).toBe('gidelim');
    expect(conjugate('paylaş', { tense: 'optative', person: '1pl' })).toBe('paylaşalım');
    expect(conjugate('bak', { tense: 'optative', person: '1sg' })).toBe('bakayım');
  });
});

describe('questions', () => {
  it('moves the person ending onto the particle outside the past tense', () => {
    expect(conjugate('gel', { tense: 'present', person: '2sg', question: true })).toBe(
      'geliyor musun',
    );
    expect(conjugate('gel', { tense: 'present', person: '3sg', question: true })).toBe(
      'geliyor mu',
    );
    expect(conjugate('gel', { tense: 'aorist', person: '2sg', question: true })).toBe(
      'gelir misin',
    );
  });

  it('keeps the person ending on the verb in the past tense', () => {
    expect(conjugate('gel', { tense: 'past', person: '2sg', question: true })).toBe('geldin mi');
  });
});

describe('derivation', () => {
  it('builds nouns and adjectives from stems', () => {
    expect(derive('aç', 'lIk')).toBe('açlık');
    expect(derive('göz', 'lIk')).toBe('gözlük');
    expect(derive('yol', 'CI')).toBe('yolcu');
    expect(derive('iş', 'CI')).toBe('işçi');
    expect(derive('enerji', 'lI')).toBe('enerjili');
    expect(derive('enerji', 'sIz')).toBe('enerjisiz');
    expect(derive('su', 'sIz')).toBe('susuz');
  });

  it('builds verbs from nominals', () => {
    expect(derive('ev', 'lAn')).toBe('evlen');
    expect(derive('bir', 'lAş')).toBe('birleş');
  });

  it('feeds its output back into inflection', () => {
    // Derived stems must behave like any other stem.
    expect(conjugate(derive('bir', 'lAş'), { tense: 'present', person: '1pl' })).toBe(
      'birleşiyoruz',
    );
  });

  it('reports the part of speech and stem flags of the coined word', () => {
    const hunger = deriveLexeme('aç', 'lIk');
    expect(hunger).toEqual({ form: 'açlık', pos: 'noun', flags: { softens: true } });
    // The coined stem must inflect correctly on its own terms: açlık → açlığım.
    expect(inflectNoun(hunger.form, { possessive: '1sg', ...hunger.flags })).toBe('açlığım');

    expect(deriveLexeme('enerji', 'sIz').pos).toBe('adj');
    expect(deriveLexeme('bir', 'lAş').pos).toBe('verb');
  });
});

describe('present continuous rounding', () => {
  it('takes rounding from the preceding syllable when the wide vowel is replaced', () => {
    expect(conjugate('söyle', { tense: 'present', person: '3sg' })).toBe('söylüyor');
    expect(conjugate('gör', { tense: 'present', person: '3sg', negative: true })).toBe('görmüyor');
    expect(conjugate('oku', { tense: 'present', person: '3sg', negative: true })).toBe('okumuyor');
  });
});

describe('attach', () => {
  it('is a no-op for the empty spec', () => {
    expect(attach('ev', '')).toBe('ev');
  });

  it('capitalises with Turkish casing', () => {
    expect(capitalize('istiyorum')).toBe('İstiyorum');
    expect(capitalize('açım')).toBe('Açım');
  });
});
