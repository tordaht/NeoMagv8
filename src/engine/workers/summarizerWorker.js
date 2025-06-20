/**
 * Minimal NLP summarizer executed inside a Web Worker.
 * Also provides a lightweight regex intent extraction fallback
 * used by the main thread when processing exceeds its budget.
 * Both operations are extremely fast, keeping the UI snappy.
 */
self.onmessage = e => {
  const data = e.data;

  // When called for regex extraction, return intent and topics
  if (data && data.type === 'regex') {
    const text = String(data.text || '').toLowerCase();
    let intent = 'statement';
    if (/\b(merhaba|selam|hello|hi|nas\u0131ls\u0131n|nasilsin|nas\u0131ls\u0131n\u0131z|nasilsiniz)\b/.test(text)) {
      intent = 'greeting';
    } else if (/(te\u015Fekk\u00FCr(?:ler)?|sa\u011F ?ol|thank you|thanks)/i.test(text)) {
      intent = 'thanks';
    } else if (/(\?|ne|neden|nas\u0131l|when|how|why|what)/i.test(text)) {
      intent = 'question';
    }

    const topics = [];
    if (/enerji/.test(text)) topics.push('enerji');
    if (/bakteri/.test(text)) topics.push('bakteri');

    self.postMessage({ intent, topics });
    return;
  }

  const messages = data || [];
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

