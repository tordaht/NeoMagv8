/**
 * Analyze a user message and extract intent and entities.
 * Uses simple keyword matching for demonstration purposes.
 * @param {string} text
 * @returns {{ intent: string, entities: string[] }}
 */
export function extractIntent(text = '') {
  const lower = text.toLowerCase();
  const INTENT_MAP = {
    enerji: 'energy_query',
    nasılsınız: 'greeting',
    soru: 'question'
  };
  let intent = 'unknown';
  for (const [key, value] of Object.entries(INTENT_MAP)) {
    if (new RegExp(`\\b${key}\\b`, 'i').test(lower)) {
      intent = value;
      break;
    }
  }
  const entities = [];
  if (/bakteri/.test(lower)) entities.push('bacteria');
  if (/enerji/.test(lower)) entities.push('energy');
  return { intent, entities };
}

