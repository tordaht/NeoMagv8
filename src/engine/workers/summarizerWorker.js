self.onmessage = (e) => {
  const messages = e.data || [];
  const summary = summarize(messages);
  self.postMessage(summary);
};

const stopWords = new Set([
  'the','a','an','and','ve','ile','için','mi','mı','mu','mü','bir','da','de'
]);

function summarize(messages) {
  const freq = Object.create(null);
  for (const { text } of messages) {
    const words = (text || '')
      .toLowerCase()
      .match(/\p{L}+/gu) || [];
    for (const w of words) {
      if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1;
    }
  }
  const keywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);
  return keywords.length
    ? `Öne çıkan kelimeler: ${keywords.join(', ')}`
    : '';
}
