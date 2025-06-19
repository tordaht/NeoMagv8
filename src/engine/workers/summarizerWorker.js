/**
 * Web Worker performing lightweight text summarization.
 * Removes filler words and returns key phrases.
 */
self.onmessage = e => {
  const messages = e.data || [];
  const joined = messages.map(m => m.text).join(' ');
  const cleaned = joined
    .toLowerCase()
    .replace(/[.,!?]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  const filler = new Set([
    'the','a','an','and','ve','ile','i\u00E7in','mi','m\u0131','mu','m\u00FC','bir','da','de'
  ]);
  const filtered = cleaned.filter(w => !filler.has(w));
  const summary = filtered.slice(0, 20).join(' ');
  self.postMessage(summary);
};

