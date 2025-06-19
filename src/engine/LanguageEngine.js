import { extractIntent } from './IntentExtractor.js';
import { summarize } from './ContextSummarizer.js';
import { CharacterProfile } from './CharacterProfile.js';

const INTENT_CACHE = new Map();

/**
 * Generate a context aware answer.
 * @param {string} userMsg
 * @param {string} _contextSummary ignored summary parameter
 * @param {CharacterProfile} profile
 * @returns {Promise<string>}
 */
export async function generateAnswer(userMsg, _contextSummary, profile) {
  const cacheKey = userMsg.toLowerCase();
  let parsed = INTENT_CACHE.get(cacheKey);
  if (!parsed) {
    parsed = extractIntent(userMsg);
    INTENT_CACHE.set(cacheKey, parsed);
  }
  const history = globalThis.chatHistory || [];
  const context = await summarize(history);

  const greetMap = {
    greeting: 'Selam! Size nasıl yardımcı olabilirim?',
    question: 'Sorunuzu anladım.',
    thanks: 'Rica ederim.',
    statement: 'Anladım.'
  };
  const sentence1 = greetMap[parsed.intent] || greetMap.statement;
  const entityPart = parsed.entities.length
    ? parsed.entities.join(', ')
    : 'belirli bir konu';
  const sentence2 = context
    ? `Son konuşmalara göre \`${entityPart}\` geçiyor ve özetle ${context}.`
    : `Sözleriniz \`${entityPart}\` ile ilgili.`;
  const sentence3 = profile.applyTone('Umar\u0131m yard\u0131mc\u0131 olabildim.');

  return `${sentence1} ${sentence2} ${sentence3}`;
}

