/**
 * Adds personality tone to bot replies.
 * Each tone has predefined phrases that are randomly injected.
 *
 * Tone phrase map:
 * curious     -> ["Hmm, ilginç!", "Merak ettim!"]
 * playful     -> ["Haha!", "Çok eğlenceli."]
 * scientific  -> ["Bilimsel olarak", "Araştırmalara göre"]

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

export class CharacterProfile {
  constructor(id, tone) {
    this.id = id;
    this.tone = tone;
  }
  /**
   * Inject 1–2 tone-specific phrases into text.
   * @param {string} text
   * @returns {string}
   */
  applyTone(text) {
    const pool = TONE_PHRASES[this.tone] || [];
    const count = 1 + Math.floor(Math.random() * 2);
    let result = text;
    for (let i = 0; i < count; i++) {
      if (pool.length === 0) break;
      const phrase = pool[Math.floor(Math.random() * pool.length)];
      if (phrase) result += (result.endsWith('.') ? ' ' : '. ') + phrase;
    }
    return result;
  }
}

