self.onmessage = e => {
  if (e.data && e.data.type === 'regex') {
    const text = (e.data.text || '').toLowerCase();
    const intent = /\b(nasıl|neden|what|why|when|how|\?)\b/.test(text)
      ? 'question'
      : 'statement';
    const entities = [];
    if (/bakteri/.test(text)) entities.push('bacteria');
    if (/yemek|besin/.test(text)) entities.push('food');
    self.postMessage({ intent, entities });
    return;
  }

  const messages = e.data || [];
  const joined = messages.map(m => m.text).join(' ');
  const words = joined
    .toLowerCase()
    .replace(/[.,!?]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  const filler = new Set(['the','a','an','and','ve','ile','için','mi','mı','mu','mü','bir','da','de']);
  const filtered = words.filter(w => !filler.has(w));
  const summary = filtered.slice(0, 20).join(' ');
  self.postMessage(summary);
};

/**
 * @example
 * // Used internally by ContextSummarizer
 */

