const intentCache = new Map();
let regexWorker = null;

function getRegexWorker() {
  if (!regexWorker) {
    const blob = new Blob([
      `self.onmessage = e => {\n` +
      `  const text = (e.data || '').toLowerCase();\n` +
      `  const result = {};\n` +
      `  result.intent = /\b(nas\u0131l|neden|what|why|when|how|\?)\b/.test(text) ? 'question' : 'statement';\n` +
      `  const entities = [];\n` +
      `  if (/bakteri/.test(text)) entities.push('bacteria');\n` +
      `  if (/yemek|besin/.test(text)) entities.push('food');\n` +
      `  result.entities = entities;\n` +
      `  self.postMessage(result);\n` +
      `};`
    ], { type: 'application/javascript' });
    regexWorker = new Worker(URL.createObjectURL(blob));
  }
  return regexWorker;
}

function extractIntent(text) {
  const key = text.toLowerCase();
  if (intentCache.has(key)) return Promise.resolve(intentCache.get(key));

  return new Promise(resolve => {
    const worker = getRegexWorker();
    const handler = e => {
      worker.removeEventListener('message', handler);
      intentCache.set(key, e.data);
      resolve(e.data);
    };
    worker.addEventListener('message', handler);
    worker.postMessage(text);
  });
}

export async function generateAnswer(userMsg, contextSummary, profile) {
  const timeout = new Promise(res => setTimeout(() => res({ intent: 'statement', entities: [] }), 50));
  const [{ intent, entities }] = await Promise.all([
    Promise.race([extractIntent(userMsg), timeout])
  ]);

  const acknowledge = intent === 'question'
    ? 'Sorunu anladım.'
    : 'Bahsettiğin konu ilgimi çekti.';

  const fact = entities.includes('bacteria')
    ? `Sohbet geçmişinde öne çıkanlar: ${contextSummary || 'henüz veri yok.'}`
    : 'Bu konuda daha fazla detay paylaşabilirim.';

  const toneSentence = profile.applyTone('Umarım bu bilgi işine yarar.');

  return [acknowledge, fact, toneSentence].join(' ');
}
