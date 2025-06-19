const CACHE = new Map();

/**
 * Summarize the last up to 5 messages.
 * The function delegates heavy text work to a Web Worker and caches
 * the result keyed by the JSON representation of the message window.
 * @param {{ sender: string, text: string }[]} messages
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

