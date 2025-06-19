const CACHE = new Map();

/**
 * Summarize the last window of messages.
 * Results are cached to avoid repeated worker computation.
 * @param {Array<{text:string}>} messages
 * @returns {Promise<string>}
 */
export async function summarize(messages = []) {
  const window = messages.slice(-5);
  const key = JSON.stringify(window);
  if (CACHE.has(key)) return CACHE.get(key);

  const worker = new Worker(new URL('./workers/summarizerWorker.js', import.meta.url));
  worker.postMessage(window);
  const summary = await new Promise(res => {
    worker.onmessage = e => res(e.data);
  });
  worker.terminate();
  CACHE.set(key, summary);
  return summary;
}

/**
 * Example:
 * @example
 * const summary = await summarize([{text:'merhaba'}]);
 * console.log(summary);
 */

