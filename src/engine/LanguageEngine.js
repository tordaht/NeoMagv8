const extractionCache = new Map();
const templateCache = new Map();
let worker;

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./workers/summarizerWorker.js', import.meta.url));
  }
  return worker;
}

function localRegex(text) {
  const lower = text.toLowerCase();
  const intent = /\b(nasıl|neden|what|why|when|how|\?)\b/.test(lower)
    ? 'question'
    : 'statement';
  const entities = [];
  if (/bakteri/.test(lower)) entities.push('bacteria');
  if (/yemek|besin/.test(lower)) entities.push('food');
  return { intent, entities };
}

async function regexExtract(text) {
  const key = text.toLowerCase();
  if (extractionCache.has(key)) return extractionCache.get(key);

  const start = Date.now();
  const result = localRegex(text);
  const duration = Date.now() - start;

  if (duration > 50) {
    const w = getWorker();
    const workerResult = await new Promise(res => {
      const handler = e => {
        w.removeEventListener('message', handler);
        res(e.data);
      };
      w.addEventListener('message', handler);
      w.postMessage({ type: 'regex', text });
    });
    extractionCache.set(key, workerResult);
    return workerResult;
  }

  extractionCache.set(key, result);
  return result;
}

function selectTemplate(intent) {
  if (templateCache.has(intent)) return templateCache.get(intent);
  const templates = {
    question: ['Merak ettiğini anlıyorum.', 'Güzel bir soru!'],
    statement: ['İlginç bir nokta.', 'Anladım.']
  };
  const arr = templates[intent] || templates.statement;
  const chosen = arr[Math.floor(Math.random() * arr.length)];
  templateCache.set(intent, chosen);
  return chosen;
}

/**
 * Generate a context aware answer.
 * @param {string} userMsg
 * @param {string} contextSummary
 * @param {import('./CharacterProfile.js').default} profile
 */
export async function generateAnswer(userMsg, contextSummary, profile) {
  const intentPromise = regexExtract(userMsg);
  const templatePromise = intentPromise.then(r => selectTemplate(r.intent));
  const [{ intent, entities }, template] = await Promise.all([
    intentPromise,
    templatePromise
  ]);

  const first = template;
  const second = contextSummary
    ? `Geçmiş özet: ${contextSummary}.`
    : 'Bu konuda daha fazla paylaşabilirsin.';
  const combined = `${first} ${second}`;
  return profile.applyTone(combined);
}

/**
 * Example:
 * @example
 * const profile = new CharacterProfile('b1', 'playful');
 * const reply = await generateAnswer('Nasılsın?', 'Özet', profile);
 * console.log(reply);
 */

