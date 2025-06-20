// LanguageEngine - generates short replies with tone injection
// and minimal NLP. The functions here are intentionally lightweight
// so the UI remains snappy.

import { CharacterProfile } from './CharacterProfile.js';

/** Cache previous intent detections */
const INTENT_CACHE = new Map();
/** Cache template selections */
const TEMPLATE_CACHE = new Map();

/**
 * Basic regex based intent extraction used on the main thread.
 * @param {string} text
 * @returns {{ intent: string, topics: string[] }}
 */
function regexExtractSync(text = '') {
  const lower = text.toLowerCase();
  let intent = 'statement';
  if (/\b(merhaba|selam|hello|hi|nas\u0131ls\u0131n|nasilsin|nas\u0131ls\u0131n\u0131z|nasilsiniz)\b/.test(lower)) {
    intent = 'greeting';
  } else if (/(te\u015Fekk\u00FCr(?:ler)?|sa\u011F ?ol|thank you|thanks)/i.test(lower)) {
    intent = 'thanks';
  } else if (/(\?|ne|neden|nas\u0131l|when|how|why|what)/i.test(lower)) {
    intent = 'question';
  }
  const topics = [];
  if (/enerji/.test(lower)) topics.push('enerji');
  if (/bakteri/.test(lower)) topics.push('bakteri');
  return { intent, topics };
}

/**
 * Run the regex extraction inside the summarizer worker when
 * the synchronous call exceeds the 50ms UI budget.
 * @param {string} text
 * @returns {Promise<{ intent: string, topics: string[] }>}
 */
async function regexExtract(text) {
  const key = text.toLowerCase();
  if (INTENT_CACHE.has(key)) return INTENT_CACHE.get(key);

  const start = performance.now();
  let result = regexExtractSync(text);
  const duration = performance.now() - start;

  if (duration > 50) {
    try {
      const worker = new Worker(new URL('./workers/summarizerWorker.js', import.meta.url));
      result = await new Promise(res => {
        worker.onmessage = e => res(e.data);
        worker.postMessage({ type: 'regex', text });
      });
      worker.terminate();
    } catch {
      // fall back to already computed result
    }
  }

  INTENT_CACHE.set(key, result);
  return result;
}

/**
 * Select a short template phrase for the given user message.
 * Results are memoized to avoid repeated string scans.
 * @param {string} text
 * @returns {Promise<string>}
 */
async function selectTemplate(text) {
  const key = text.toLowerCase();
  if (TEMPLATE_CACHE.has(key)) return TEMPLATE_CACHE.get(key);

  let category = 'statement';
  if (/\b(merhaba|selam|hello|hi)\b/i.test(key)) category = 'greeting';
  else if (/(te\u015Fekk\u00FCr|sa\u011F ?ol|thanks?)/i.test(key)) category = 'thanks';
  else if (/\?/.test(text)) category = 'question';

  const templates = {
    greeting: ['Sizi gördüğüme sevindim.'],
    question: ['Bu soruya birlikte bakalım.'],
    thanks: ['Memnun oldum.'],
    statement: ['Notunuzu aldım.']
  };

  const arr = templates[category] || templates.statement;
  const choice = arr[Math.floor(Math.random() * arr.length)];
  TEMPLATE_CACHE.set(key, choice);
  return choice;
}

/**
 * Generate a short, context aware answer. Intent detection and
 * template selection run in parallel to keep latency low.
 * If regex processing blocks the main thread for more than ~50ms,
 * the work is retried in a Web Worker.
 *
 * @param {string} userMsg
 * @param {string} contextSummary
 * @param {CharacterProfile} profile
 * @returns {Promise<string>}
 */
export async function generateAnswer(userMsg, contextSummary, profile) {
  const [parsed, template] = await Promise.all([
    regexExtract(userMsg),
    selectTemplate(userMsg)
  ]);

  const intentMap = {
    greeting: 'Selamlar!',
    question: 'Sorunuz üzerine düşünüyorum.',
    thanks: 'Rica ederim.',
    statement: 'Anladım.'
  };

  const sentence1 = `${intentMap[parsed.intent] || intentMap.statement} ${template}`.trim();
  const sentence2 = contextSummary
    ? `Son sohbetten anlaşıldığı kadarıyla ${contextSummary}. Bu konuda ne düşünüyorsunuz?`
    : 'Bu konuyu biraz daha açar mısınız?';

  const combined = `${sentence1} ${sentence2}`;
  return profile.applyTone(combined);
}
