/**
 * Analyze a user message and extract intent and entities.
 * Results are memoized to avoid repeated regex passes.
 * @param {string} text
 * @returns {{ intent: string, entities: string[] }}
 */
const CACHE = new Map();
export function extractIntent(text = '') {
  const lower = text.toLowerCase();
  if (CACHE.has(lower)) return CACHE.get(lower);

  // Map keywords to high level intents
  const KEYWORD_INTENTS = {
    // selam/merhaba/hello/nasılsın -> greeting intent
    greeting: /\b(merhaba|selam|hello|hi|nas\u0131ls\u0131n|nasilsin|nas\u0131ls\u0131n\u0131z|nasilsiniz)\b/i,
    // teşekkür -> thanks intent
    thanks: /(te\u015Fekk\u00FCr(?:ler)?|sa\u011F ?ol|thank you|thanks)/i,
    // question marks or WH-words -> question intent
    question: /(\?|ne|neden|nas\u0131l|when|how|why|what|soru)/i
  };

  let intent = 'statement';
  for (const [name, regex] of Object.entries(KEYWORD_INTENTS)) {
    if (regex.test(lower)) {
      intent = name;
      break;
    }
  }

  const entities = [];
  if (/enerji/.test(lower)) entities.push('enerji');
  if (/nas\u0131ls\u0131n|nasilsin|nas\u0131ls\u0131n\u0131z|nasilsiniz/.test(lower)) {
    entities.push('nas\u0131ls\u0131n');
  }
  if (/bakteri/.test(lower)) entities.push('bakteri');

  const result = { intent, entities };
  CACHE.set(lower, result);
  return result;
  return { intent, entities };
}

