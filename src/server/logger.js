import fs from 'node:fs';
import path from 'node:path';

const LOG_FILE = path.resolve('analytics_data/logs.jsonl');
const buffer = [];

/**
 * Record an experiment entry. Data is buffered and written in batches every
 * second for better I/O performance.
 * @param {object} experiment Metadata for the simulation event
 */
export function recordExperiment(experiment) {
  buffer.push(JSON.stringify(experiment));
}

// periodic flush
setInterval(() => {
  if (buffer.length === 0) return;
  const data = buffer.join('\n') + '\n';
  buffer.length = 0;
  fs.promises.appendFile(LOG_FILE, data).catch(err => console.error('log write', err));
}, 1000);

/**
 * Retrieve all logs parsed as JSON.
 * @returns {Promise<Array<object>>}
 */
export async function getLogs() {
  try {
    const txt = await fs.promises.readFile(LOG_FILE, 'utf8');
    return txt.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
  } catch {
    return [];
  }
}
