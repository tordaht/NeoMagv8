const CACHE = new Map();
const WINDOW_SIZE = 5;
let workerPromise = null;

function loadWorker() {
  if (!workerPromise) {
    workerPromise = import(
      /* webpackChunkName: "summarizer" */ './workers/summarizerWorker.js?worker'
    ).then(m => new m.default());
  }
  return workerPromise;
}

export async function summarize(messages = []) {
  const window = messages.slice(-WINDOW_SIZE);
  const key = JSON.stringify(window);
  if (CACHE.has(key)) return CACHE.get(key);

  const worker = await loadWorker();

  return new Promise(resolve => {
    const handle = e => {
      worker.removeEventListener('message', handle);
      CACHE.set(key, e.data);
      resolve(e.data);
    };
    worker.addEventListener('message', handle);
    worker.postMessage(window);
  });
}
