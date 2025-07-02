/**
 * Adds short personality phrases to generated text.
 *
 * Each profile stores an identifier and a communication tone. The tone
 * determines which phrase pool will be used by {@link CharacterProfile#applyTone}
 * when decorating output text.
 */

export class CharacterProfile {

  /**
   * Create a character profile with a unique ID and speaking tone.
   *
   * @param {string} id Unique identifier for the character.
   * @param {'curious'|'playful'|'scientific'} tone Chosen personality tone.
   */
  constructor(id, tone) {
    this.id = id;
    this.tone = tone;
  }

  /**
   * Prepend a randomly selected tone phrase to the provided text.
   *
   * @param {string} text Original text to decorate.
   * @returns {string} Text with a personality phrase in front.
   */
  applyTone(text) {
    const pool = CharacterProfile.tonePhrases[this.tone] || [];
    const phrase = pool[Math.floor(Math.random() * pool.length)];
    return `${phrase} ${text}`;
  }
}

// Initialize static property separately for wider syntax support
CharacterProfile.tonePhrases = {
  curious: ['Hmm, ilginç!', 'Merak ettim doğrusu.'],
  playful: ['Hoho, ne eğlenceli!', 'Buna bayıldım!'],
  scientific: ['Veriler gösteriyor ki…', 'Bilimsel açıdan bakacak olursak…']
};

