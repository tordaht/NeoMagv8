const cache = new Map();

/**
 * Generate a short summary of the last few chat messages.
 * Results are cached per window to avoid repeated worker calls.
 *
 * @param {Array<{sender: string, text: string}>} messages Chat history
 * @returns {Promise<string>} Summarized context string
 */
export async function summarize(messages = []) {
  const window = messages.slice(-5);
  const key = JSON.stringify(window);
  if (cache.has(key)) {
    return cache.get(key);
  }

  const worker = new Worker(
    new URL('./workers/summarizerWorker.js', import.meta.url)
  );
  const summary = await new Promise(resolve => {
    worker.onmessage = e => resolve(e.data);
    worker.postMessage(window);
  });
  worker.terminate();
  cache.set(key, summary);
  return summary;
}

