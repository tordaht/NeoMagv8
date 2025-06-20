/**
 * Minimal NLP summarizer executed inside a Web Worker.
 * Common filler words are removed and key terms are concatenated
 * into a single sentence. For a window of five messages this work
 * completes well under 20 ms, keeping the UI snappy.
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
    'the','a','an','and','ve','ile','i\u00e7in','mi','m\u0131','mu','m\u00fc','bir','da','de'
  ]);
  const filtered = cleaned.filter(w => !filler.has(w));
  const summary = filtered.slice(0, 20).join(' ') + '.';
  self.postMessage(summary);
};

