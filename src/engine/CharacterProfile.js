/**
 * CharacterProfile injects short tone phrases into replies.
 *
 * Each tone is mapped to a set of phrases held in {@link CharacterProfile.tonePhrases}.
 * The {@link CharacterProfile#applyTone} method randomly places one of these phrases
 * at the beginning or end of the provided text. Such small variations help break
 * monotonous responses and make the conversation feel more engaging.
 */

export class CharacterProfile {
  /**
   * Known tone phrases used when injecting personality.
   * @type {{ [key in 'curious'|'playful'|'scientific']: string[] }}
   */
  // `tonePhrases` is attached after the class definition to stay
  // compatible with older ECMAScript versions used in lint rules.

  constructor(id, tone) {
    this.id = id;
    this.tone = tone;
  }

  /**
   * Add a random phrase before or after the text based on the profile's tone.
   *
   * A single phrase is selected from {@link CharacterProfile.tonePhrases} and
   * then either prepended or appended. This creates subtle variety that keeps
   * replies feeling lively.
   *
   * @param {string} text
   * @returns {string}
   */
  applyTone(text) {
    const pool = CharacterProfile.tonePhrases[this.tone] || [];
    if (!pool.length) return text;
    const phrase = pool[Math.floor(Math.random() * pool.length)];
    return Math.random() < 0.5
      ? `${phrase} ${text}`
      : `${text} ${phrase}`;
  }
}

// Static tone phrase definitions attached outside the class so the file
// remains compatible with ESLint's ES2021 parser settings.
CharacterProfile.tonePhrases = {
  curious: [
    'Hmm, ilginç!',
    'Merak ettim!',
    'Nasıl oldu acaba?'
  ],
  playful: [
    'Haha!',
    'Şaka yapıyorum tabii.',
    'Bu çok eğlenceli!'
  ],
  scientific: [
    'Bilimsel olarak',
    'Araştırmalara göre',
    'Veriler gösteriyor ki'
  ]
};

