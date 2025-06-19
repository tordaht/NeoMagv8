import { extractIntent } from './IntentExtractor.js';
import { summarize } from './ContextSummarizer.js';
import { CharacterProfile } from './CharacterProfile.js';

const INTENT_CACHE = new Map();

/**
 * Generate a context aware answer.
 * @param {string} userMsg
 * @param {string} contextSummary
 * @param {CharacterProfile} profile
 * @returns {Promise<string>}
 */
export async function generateAnswer(userMsg, contextSummary, profile) {
  const cacheKey = userMsg.toLowerCase();
  let parsed = INTENT_CACHE.get(cacheKey);
  if (!parsed) {
    parsed = extractIntent(userMsg);
    INTENT_CACHE.set(cacheKey, parsed);
  }
  const context = contextSummary;

  const sentence1 = `Niyetinizi \`${parsed.intent}\` olarak alg\u0131lad\u0131m.`;
  const entityPart = parsed.entities.length
    ? parsed.entities.join(', ')
    : 'belirli bir konu';
  const sentence2 = context
    ? `Mesajlar\u0131n\u0131zdan \`${entityPart}\` bahsediliyor ve \u00f6zetle ${context}.`
    : `S\u00f6zleriniz \`${entityPart}\` ile ilgili.`;
  const sentence3 = profile.applyTone('Umar\u0131m yard\u0131mc\u0131 olabildim.');

  return `${sentence1} ${sentence2} ${sentence3}`;
}

