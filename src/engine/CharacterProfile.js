/**
 * Character profile used to apply personality-driven tone to generated text.
 * Each tone has predefined phrases injected into answers to create lively
 * conversations.
 */
const TONE_PHRASES = {
  curious: [
    'Hmm, ilginç!',
    'Merak ettim!'
  ],
  playful: [
    'Haha!',
    'Çok eğlenceli.'
  ],
  scientific: [
    'Bilimsel olarak',
    'Araştırmalara göre'
  ]
};

export default class CharacterProfile {
  constructor(id, tone) {
    this.id = id;
    this.tone = tone;
  }

  /**
   * Inject 1-2 phrases based on tone into the provided text.
   * @param {string} text
   * @returns {string}
   */
  applyTone(text) {
    const pool = TONE_PHRASES[this.tone] || [];
    const count = 1 + Math.floor(Math.random() * 2);
    let result = text;
    for (let i = 0; i < count; i++) {
      const phrase = pool[Math.floor(Math.random() * pool.length)];
      if (phrase) result += (result.endsWith('.') ? ' ' : '. ') + phrase;
    }
    return result;
  }
}

/**
 * Example:
 * @example
 * const profile = new CharacterProfile('Bakteri-2', 'curious');
 * console.log(profile.applyTone('Merhaba dunya.'));
 */

