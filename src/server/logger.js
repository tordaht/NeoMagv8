/**
 * @module logger
 * @description Utility for persisting experiment analytics as JSON lines.
 */

import { promises as fs } from 'fs';
import path from 'path';

const LOG_DIR = path.resolve('analytics_data');
const LOG_FILE = path.join(LOG_DIR, 'logs.jsonl');

/**
 * Append a log entry to the analytics data file.
 * Batching writes or adding advanced error handling could improve performance
 * in production scenarios.
 *
 * @param {object} logEntry - Experiment data to record
 * @returns {Promise<void>} Resolves when the entry is written
 */
export async function recordExperiment(logEntry) {
  await fs.mkdir(LOG_DIR, { recursive: true });
  await fs.appendFile(LOG_FILE, `${JSON.stringify(logEntry)}\n`);
}

/**
 * Retrieve every log entry from the analytics data file.
 * Consider implementing batching for large files.
 *
 * @returns {Promise<object[]>} Parsed experiment log objects
 */
export async function getAllLogs() {
  try {
    const txt = await fs.readFile(LOG_FILE, 'utf8');
    return txt.split('\n').filter(Boolean).map(line => JSON.parse(line));
  } catch (err) {
    // Production systems should handle errors or missing files more robustly
    return [];
  }
}
