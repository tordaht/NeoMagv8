/**
 * Simple summarization worker.
 * Concatenates message texts and returns the first
 * 100 characters followed by an ellipsis.
 *
 * @param {MessageEvent<Array<{sender: string, text: string}>>} e
 */
onmessage = e => {
  const messages = e.data || [];
  const text = messages.map(m => m.text).join(' ');
  const summary = text.slice(0, 100) + '…';
  postMessage(summary);
};
